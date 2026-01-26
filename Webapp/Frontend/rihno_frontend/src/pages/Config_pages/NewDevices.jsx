import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "react-oidc-context"; // Import OIDC hook
import { Loader2, CheckCircle2, AlertCircle, Copy } from 'lucide-react';

function NewDevices() {
    const auth = useAuth(); // Access authentication state
    const userEmail = auth.user?.profile?.email || '';

    const [formData, setFormData] = useState({
        email: userEmail,
        deviceName: '',
        deviceLocation: '',
        deviceType: 'CloudVM',
        deviceStatus: 'Online'
    });

    // Update email in state if it changes or loads after initial render
    useEffect(() => {
        if (userEmail) {
            setFormData(prev => ({ ...prev, email: userEmail }));
        }
    }, [userEmail]);

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '', apiKey: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '', apiKey: '' });

        try {
            const dateCreated = new Date().toLocaleDateString('en-GB');

            // Send request to your Node.js backend
            const response = await axios.post(`http://localhost:5050/api/create`, null, {
                params: {
                    ...formData,
                    dateCreated: dateCreated
                }
            });

            setStatus({
                type: 'success',
                message: 'Device Created Successfully!',
                apiKey: response.data.generatedKey
            });
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to connect to backend'
            });
        } finally {
            setLoading(false);
        }
    };

    // Show loading state if OIDC is still processing
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
                    {/* Email Input - Read Only since it's from OIDC */}
                    <div className="flex flex-col gap-2">
                        <label className="font-mono uppercase text-sm font-bold text-gray-500">Authenticated Email</label>
                        <input
                            readOnly
                            type="email"
                            name="email"
                            value={formData.email}
                            className="p-3 border-2 border-gray-200 bg-gray-50 cursor-not-allowed outline-none font-bold"
                            placeholder="Not logged in..."
                        />
                    </div>

                    {/* Device Name */}
                    <div className="flex flex-col gap-2">
                        <label className="font-mono uppercase text-sm font-bold">Device Name</label>
                        <input
                            required
                            type="text"
                            name="deviceName"
                            value={formData.deviceName}
                            onChange={handleChange}
                            className="p-3 border-2 border-black focus:bg-yellow-50 outline-none transition-colors"
                            placeholder="e.g. RHINO-Node-01"
                        />
                    </div>

                    {/* Location */}
                    <div className="flex flex-col gap-2">
                        <label className="font-mono uppercase text-sm font-bold">Location</label>
                        <input
                            required
                            type="text"
                            name="deviceLocation"
                            value={formData.deviceLocation}
                            onChange={handleChange}
                            className="p-3 border-2 border-black focus:bg-yellow-50 outline-none transition-colors"
                            placeholder="e.g. Mumbai, IN"
                        />
                    </div>

                    {/* Device Type */}
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
                    className="w-full bg-black text-white p-4 font-black uppercase text-xl hover:bg-[#7EA0FD] hover:text-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(126,160,253,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Generate Device API Key'}
                </button>
            </form>

            {/* Success/Error State Display */}
            {status.message && (
                <div className={`mt-8 p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${
                    status.type === 'success' ? 'bg-[#7EA0FD]' : 'bg-red-400'
                }`}>
                    <div className="flex items-center gap-3 mb-2 font-black uppercase italic">
                        {status.type === 'success' ? <CheckCircle2 /> : <AlertCircle />}
                        <span>{status.message}</span>
                    </div>

                    {status.apiKey && (
                        <div className="mt-4 p-4 bg-white border-2 border-black">
                            <p className="text-xs font-mono text-gray-500 uppercase mb-2 font-bold">Save this API Key (It won't be shown again):</p>
                            <div className="flex items-center justify-between gap-2">
                                <code className="break-all font-mono font-black text-lg text-red-600 bg-gray-100 px-2">{status.apiKey}</code>
                                <button
                                    onClick={() => navigator.clipboard.writeText(status.apiKey)}
                                    className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
                                    title="Copy to clipboard"
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