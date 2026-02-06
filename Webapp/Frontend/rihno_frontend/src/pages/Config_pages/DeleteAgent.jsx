import React, { useEffect, useState } from 'react';
import { useAuth } from "react-oidc-context";
import axios from "axios";
import { Loader2, Trash2, Search, Filter, AlertTriangle } from 'lucide-react';
import { backendConfig } from "../../authConfig.js";

function DeleteAgent() {
    const auth = useAuth();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const email = auth.user?.profile?.email;

    const fetchDevices = async () => {
        if (!email) return;
        try {
            setLoading(true);
            const response = await axios.get(`${backendConfig.backendURL}api/list_all_devices`, {
                params: { email: email }
            });
            setDevices(response.data);
        } catch (error) {
            console.error("Error fetching agents:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, [email]);

    const filteredDevices = devices.filter(dev => {
        const matchesSearch = dev.DeviceName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "All" || dev.Status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = async (deviceName) => {
        const confirmed = window.confirm(`DANGER: Are you sure you want to delete ${deviceName}?`);
        if (!confirmed) return;

        try {
            setIsProcessing(true);
            await axios.delete(`${backendConfig.backendURL}api/delete`, {
                params: {
                    email: email,
                    device: deviceName
                }
            });

            // Update UI by filtering out the deleted device
            setDevices(prevDevices =>
                prevDevices.filter(dev => dev.DeviceName !== deviceName)
            );

        } catch (error) {
            console.error("Deletion failed:", error);
            alert("Error: Could not reach the recovery server.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-black uppercase mb-8 border-b-4 border-black pb-2 text-black">Delete Agent</h2>

            {/* --- FILTER BAR --- */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} />
                    <input
                        type="text"
                        placeholder="SEARCH AGENT..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-4 border-black font-mono font-bold uppercase outline-none focus:bg-red-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" size={18} />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="appearance-none pl-12 pr-10 py-3 border-4 border-black font-mono font-black uppercase outline-none bg-white cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <option value="All">All Status</option>
                        <option value="Online">Online</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Offline">Offline</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 border-4 border-dashed border-black">
                    <Loader2 className="animate-spin mb-4" size={40} />
                    <p className="font-mono font-black uppercase tracking-widest">Loading Agents...</p>
                </div>
            ) : filteredDevices.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredDevices.map((device, index) => (
                        <div key={index} className="flex flex-col md:flex-row items-center justify-between p-6 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                            <div className="mb-4 md:mb-0">
                                <p className="font-mono text-xs uppercase font-bold text-gray-500 tracking-tighter">Identity</p>
                                <p className="text-xl font-black uppercase">{device.DeviceName}</p>
                                <div className="flex gap-2 mt-2">
                                    <span className={`text-[10px] font-bold px-2 border-2 border-black ${device.Status === 'Online' ? 'bg-[#CEFFBC]' : device.Status === 'Maintenance' ? 'bg-[#7EA0FD] text-white' : 'bg-[#FF6B6B] text-white'}`}>
                                        {device.Status}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 border-2 border-black bg-gray-100">{device.Location}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDelete(device.DeviceName)}
                                disabled={isProcessing}
                                className="flex items-center gap-2 bg-[#FF6B6B] text-white px-6 py-3 border-4 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black active:shadow-none active:translate-x-1 active:translate-y-1 disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <><Trash2 size={20} /> Delete</>}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-10 border-4 border-black bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
                    <p className="font-black uppercase text-xl">No matching agent found.</p>
                </div>
            )}
        </div>
    );
}

export default DeleteAgent;