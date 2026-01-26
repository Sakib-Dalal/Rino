import React, { useState, useEffect } from 'react';
import { useAuth } from "react-oidc-context";
import axios from 'axios';
import { backendConfig } from "../authConfig.js";

const Servers = () => {
    const auth = useAuth();
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch data from your local Node.js backend
    useEffect(() => {
        const fetchDevices = async () => {
            const email = auth.user?.profile?.email;

            if (!email) return;

            try {
                setLoading(true);
                const response = await axios.get(`${backendConfig.backendURL}api/list_all_devices`, {
                    params: { email: email }
                });
                setServers(response.data);
            } catch (error) {
                console.error("Error fetching devices:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDevices();
    }, [auth.user?.profile?.email]); // Re-run if email changes or loads

    return (
        <div className="flex flex-col items-center animate-fade-in-up w-full p-4">
            <div className="mb-12">
                <h1 className="text-6xl md:text-8xl font-black uppercase leading-none text-center">
                    DEVICE
                    <span className="block md:inline-block bg-[#FFECA0] border-[4px] border-black px-4 ml-0 md:ml-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        LIST
                    </span>
                </h1>
            </div>

            <div className="w-full max-w-5xl border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-6">
                {loading ? (
                    <p className="text-center font-mono font-bold py-10">LOADING DEVICE DATA ...</p>
                ) : (
                    <table className="w-full text-left font-mono border-collapse">
                        <thead>
                        <tr className="bg-gray-300 text-black">
                            <th className="p-4 border-[2px] border-black">Device Name</th>
                            <th className="p-4 border-[2px] border-black">Status</th>
                            <th className="p-4 border-[2px] border-black">Location</th>
                            <th className="p-4 border-[2px] border-black">Device Type</th>
                            <th className="p-4 border-[2px] border-black">Date Created</th>
                        </tr>
                        </thead>
                        <tbody>
                        {servers.length > 0 ? (
                            servers.map((server, index) => (
                                <tr key={index} className="hover:bg-black hover:text-white transition-colors">
                                    <td className="p-4 border-[2px] border-black font-bold">
                                        {server.DeviceName}
                                    </td>
                                    <td className={`p-4 border-[2px] border-black font-black ${
                                        server.Status === 'Online' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {server.Status}
                                    </td>
                                    <td className="p-4 border-[2px] border-black">
                                        {server.Location || 'N/A'}
                                    </td>
                                    <td className="p-4 border-[2px] border-black">
                                        {server.DeviceType || 'N/A'}
                                    </td>
                                    <td className="p-4 border-[2px] border-black">
                                        {server.DateCreated || 'N/A'}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-4 text-center border-[2px] border-black">
                                    No devices found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Servers;