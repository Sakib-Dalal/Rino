import React, { useState, useEffect } from 'react';
import { useAuth } from "react-oidc-context";
import axios from 'axios';
import { Loader2, MapPin, Cpu, Calendar, Search, Filter, Activity } from 'lucide-react';
import { backendConfig } from "../authConfig.js";

const Servers = () => {
    const auth = useAuth();
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        const fetchAgents = async () => {
            const email = auth.user?.profile?.email;
            if (!email) return;

            try {
                setLoading(true);
                const response = await axios.get(`${backendConfig.backendURL}api/list_all_devices`, {
                    params: { email: email }
                });
                setServers(response.data);
            } catch (error) {
                console.error("Error fetching agents:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAgents();
    }, [auth.user?.profile?.email]);

    // Filtering Logic
    const filteredServers = servers.filter(server => {
        const matchesSearch = server.DeviceName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "All" || server.Status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex flex-col items-center animate-fade-in w-full p-6 min-h-screen bg-white">

            {/* Header Section */}
            <div className="mb-25">
                <h1 className="text-6xl md:text-8xl font-black uppercase leading-none text-center">
                    AGENTS
                    <span className="block md:inline-block bg-[#FFECA0] border-[4px] border-black px-4 ml-0 md:ml-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        LIST
                    </span>
                </h1>
            </div>

            {/* --- FILTER BAR --- */}
            <div className="w-full max-w-4xl mb-10 flex flex-col md:flex-row gap-4">
                {/* Name Search */}
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={20} />
                    <input
                        type="text"
                        placeholder="SEARCH BY AGENT NAME..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border-4 border-black font-mono font-bold uppercase outline-none focus:bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                    />
                </div>

                {/* Status Dropdown */}
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-black pointer-events-none" size={20} />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="appearance-none pl-12 pr-10 py-4 border-4 border-black font-mono font-black uppercase outline-none bg-white cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:bg-[#7EA0FD] focus:text-white transition-all"
                    >
                        <option value="All">All Status</option>
                        <option value="Online">Online</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Offline">Offline</option>
                    </select>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="w-full max-w-4xl">
                {loading ? (
                    <div className="flex items-center justify-center gap-4 p-12 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <Loader2 className="animate-spin" size={32} />
                        <p className="font-mono text-xl font-black uppercase tracking-widest text-black">Scanning Frequency...</p>
                    </div>
                ) : filteredServers.length > 0 ? (
                    <div className="space-y-6">
                        {filteredServers.map((server, index) => (
                            <div
                                key={index}
                                className="p-6 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <h3 className="text-3xl font-black leading-none text-black">
                                        {server.DeviceName}
                                    </h3>
                                    <span className={`inline-block px-3 py-1 border-2 border-black text-[10px] font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center w-fit ${
                                        server.Status === 'Online' ? 'bg-[#CEFFBC] text-black' :
                                            server.Status === 'Maintenance' ? 'bg-[#7EA0FD] text-white' : 'bg-[#FF6B6B] text-white'
                                    }`}>
                                        {server.Status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 font-mono text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                                    <div className="flex items-center gap-2 border-l-4 border-black pl-3 text-black">
                                        <MapPin size={16} />
                                        <span>Location: {server.Location || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 border-l-4 border-black pl-3 text-black">
                                        <Cpu size={16} />
                                        <span>Device Type: {server.DeviceType || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 col-span-full pt-2 mt-2 border-t border-gray-100 text-black">
                                        <Calendar size={16} />
                                        <span>Date Created: {server.DateCreated || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-16 border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center">
                        <Activity className="mx-auto mb-4 opacity-10 text-black" size={80} />
                        <p className="font-black uppercase text-2xl text-gray-300 italic">No Matching Nodes Found</p>
                        <button
                            onClick={() => {setSearchTerm(""); setStatusFilter("All");}}
                            className="mt-4 font-mono text-xs font-black underline uppercase hover:text-[#7EA0FD]"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Servers;