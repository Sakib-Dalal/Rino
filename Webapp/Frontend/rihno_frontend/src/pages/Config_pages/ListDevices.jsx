import React, { useEffect, useState } from 'react';
import { useAuth } from "react-oidc-context";
import axios from "axios";
import { backendConfig } from "../../authConfig.js";

function ListDevices() {
    const auth = useAuth();
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState(null); // Tracks which key was just copied

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
    }, [auth.user?.profile?.email]);

    // Function to handle the copy logic
    const handleCopy = (apiKey, deviceId) => {
        if (!apiKey) return;

        navigator.clipboard.writeText(apiKey).then(() => {
            setCopiedId(deviceId);
            // Reset the "Copied!" message after 2 seconds
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    return (
        <div className="flex flex-col items-start animate-fade-in-up w-full">
            <h2 className="text-2xl font-mono font-bold mb-6 border-b-2 border-black pb-2">LIST DEVICES</h2>

            <div className="w-full max-w-5xl bg-white">
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
                            <th className="p-4 border-[2px] border-black">Device API</th>
                        </tr>
                        </thead>
                        <tbody>
                        {servers.length > 0 ? (
                            servers.map((server, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
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
                                    <td className="p-4 border-[2px] border-black">
                                        <button
                                            onClick={() => handleCopy(server.DeviceAPI, index)}
                                            className="flex items-center gap-2 px-2 py-1 bg-gray-100 border border-gray-400 rounded hover:bg-black hover:text-white transition-all group"
                                            title="Click to copy API Key"
                                        >
                                                <span className="text-xs">
                                                    {copiedId === index ? (
                                                        <span className="text-green-600 font-bold">COPIED!</span>
                                                    ) : (
                                                        <span>
                                                            {/* Shows first 4 chars then dots */}
                                                            {server.DeviceAPI ? `${server.DeviceAPI.substring(0, 4)}••••••••` : 'N/A'}
                                                        </span>
                                                    )}
                                                </span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="ContentCopy" />
                                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-4 text-center border-[2px] border-black">
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

export default ListDevices;