import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "react-oidc-context";
import { Loader2, CheckCircle2, AlertCircle, Copy, ShieldAlert } from 'lucide-react';
import {backendConfig} from "../../authConfig.js";

function NewDevices() {
    const auth = useAuth();
    const userEmail = auth.user?.profile?.email || '';

    const [formData, setFormData] = useState({
        email: userEmail,
        deviceName: '',
        deviceLocation: '',
        deviceType: 'CloudVM',
        deviceStatus: 'Online'
    });

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '', apiKey: '' });

    // Sync email from OIDC context once authenticated
    useEffect(() => {
        if (userEmail) {
            setFormData(prev => ({ ...prev, email: userEmail }));
        }
    }, [userEmail]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error message when user starts typing a new name
        if (status.type === 'error') setStatus({ type: '', message: '', apiKey: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '', apiKey: '' });

        try {
            const dateCreated = new Date().toLocaleDateString('en-GB');

            // POST to your Node.js backend
            const response = await axios.post(`${backendConfig.backendURL}api/create`, null, {
                params: {
                    ...formData,
                    dateCreated: dateCreated
                }
            });

            setStatus({
                type: 'success',
                message: 'Device Registered Successfully!',
                apiKey: response.data.generatedKey
            });
        } catch (error) {
            // Logic for "Device Already Taken" (HTTP 409)
            if (error.response?.status === 409) {
                setStatus({
                    type: 'error',
                    message: 'DEVICE NAME TAKEN: This name is already registered to your account.'
                });
            } else {
                setStatus({
                    type: 'error',
                    message: error.response?.data?.message || 'Failed to connect to RHINO backend'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    if (auth.isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-[#7EA0FD]" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-black uppercase mb-8 border-b-4 border-black pb-2">Register New Device</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Authenticated Email (Read Only) */}
                    <div className="flex flex-col gap-2">
                        <label className="font-mono uppercase text-sm font-bold text-gray-500">User Account</label>
                        <input
                            readOnly
                            type="email"
                            value={formData.email}
                            className="p-3 border-2 border-gray-200 bg-gray-50 cursor-not-allowed outline-none font-bold italic"
                        />
                    </div>

                    {/* Device Name - Highlighting red if taken */}
                    <div className="flex flex-col gap-2">
                        <label className="font-mono uppercase text-sm font-bold">Device Name</label>
                        <input
                            required
                            type="text"
                            name="deviceName"
                            value={formData.deviceName}
                            onChange={handleChange}
                            className={`p-3 border-2 outline-none transition-all ${
                                status.message.includes("TAKEN")
                                    ? "border-red-500 bg-red-50 animate-shake"
                                    : "border-black focus:bg-yellow-50"
                            }`}
                            placeholder="e.g. RIHNO-Node-01"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-mono uppercase text-sm font-bold">Location</label>
                        <input
                            required
                            type="text"
                            name="deviceLocation"
                            value={formData.deviceLocation}
                            onChange={handleChange}
                            className="p-3 border-2 border-black focus:bg-yellow-50 outline-none"
                            placeholder="e.g. Mumbai, IN"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-mono uppercase text-sm font-bold">Device Type</label>
                        <select
                            name="deviceType"
                            value={formData.deviceType}
                            onChange={handleChange}
                            className="p-3 border-2 border-black bg-white focus:bg-yellow-50 outline-none font-bold"
                        >
                            <option value="CloudVM">Cloud VM</option>
                            <option value="Local Machine">Local Machine</option>
                            <option value="IOT Honeypot">IOT Honeypot</option>
                            <option value="Container">Container</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !auth.isAuthenticated}
                    className="w-full bg-black text-white p-4 font-black uppercase text-xl hover:bg-[#CEFFBC] hover:text-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Generate API Key'}
                </button>
            </form>

            {/* Notification Area */}
            {status.message && (
                <div className={`mt-8 p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${
                    status.type === 'success' ? 'bg-[#7EA0FD]' : 'bg-[#FF6B6B]'
                }`}>
                    <div className="flex items-center gap-3 mb-2 font-black uppercase">
                        {status.type === 'success' ? <CheckCircle2 size={28} /> : <ShieldAlert size={28} />}
                        <span className="text-lg">{status.message}</span>
                    </div>

                    {status.apiKey && (
                        <div className="mt-4 p-4 bg-white border-2 border-black">
                            <p className="text-[10px] font-mono text-gray-500 uppercase mb-2 font-black">Private API Key (Copy Now):</p>
                            <div className="flex items-center justify-between gap-2">
                                <code className="break-all font-mono font-black text-sm md:text-lg text-black bg-gray-100 px-2 border border-gray-300">
                                    {status.apiKey}
                                </code>
                                <button
                                    onClick={() => navigator.clipboard.writeText(status.apiKey)}
                                    className="p-2 border-2 border-black bg-yellow-300 hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    <Copy size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default NewDevices;