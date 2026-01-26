import React, { useEffect, useState } from 'react';
import { useAuth } from "react-oidc-context";
import axios from "axios";
import { backendConfig } from "../../authConfig.js";

function DeleteDevices() {
    const auth = useAuth();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const email = auth.user?.profile?.email;

    // 1. Fetch current devices to populate the list
    const fetchDevices = async () => {
        if (!email) return;
        try {
            setLoading(true);
            const response = await axios.get(`${backendConfig.backendURL}api/list_all_devices`, {
                params: { email: email }
            });
            setDevices(response.data);
        } catch (error) {
            console.error("Error fetching devices:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, [email]);

    // 2. The Confirmation Logic
    const handleDelete = async (deviceName) => {
        // This triggers the browser's "Yes/No" (OK/Cancel) dialog
        const confirmed = window.confirm(`Are you sure you want to delete ${deviceName}? This action cannot be undone.`);

        if (!confirmed) {
            return; // If user clicks "No" (Cancel), stop the function
        }

        try {
            setIsProcessing(true);
            // Matches backend: /api/delete?email=xxx&device=xxx
            await axios.delete(`${backendConfig.backendURL}api/delete`, {
                params: {
                    email: email,
                    device: deviceName
                }
            });

            alert(`${deviceName} successfully deleted.`);
            fetchDevices(); // Refresh the list
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete device.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col items-start w-full p-6 font-mono">
            <h2 className="text-2xl font-mono font-bold mb-6 border-b-2 border-black pb-2">DELETE DEVICES</h2>

            {loading ? (
                <p>LOADING...</p>
            ) : (
                <div className="w-full max-w-4xl">
                    <table className="w-full border-2 border-black border-collapse">
                        <thead>
                        <tr className="bg-gray-200">
                            <th className="border-2 border-black p-2 text-left">Device Name</th>
                            <th className="border-2 border-black p-2 text-center">Location</th>
                            <th className="border-2 border-black p-2 text-center">Device Type</th>
                            <th className="border-2 border-black p-2 text-center">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {devices.map((device, index) => (
                            <tr key={index} className="hover:bg-red-50">
                                <td className="border-2 border-black p-2 font-bold">
                                    {device.DeviceName}
                                </td>
                                <td className="border-2 border-black p-2 font-bold">
                                    {device.Location}
                                </td>
                                <td className="border-2 border-black p-2 font-bold">
                                    {device.DeviceType}
                                </td>
                                <td className="border-2 border-black p-2 text-center">
                                    <button
                                        onClick={() => handleDelete(device.DeviceName)}
                                        disabled={isProcessing}
                                        className="bg-red-600 text-white px-4 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50"
                                    >
                                        {isProcessing ? '...' : 'DELETE'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default DeleteDevices;