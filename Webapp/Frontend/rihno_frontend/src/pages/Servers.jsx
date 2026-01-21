import React from 'react';

const Servers = () => {
    // 1. Define your data as an array of objects
    const servers = [
        { id: '01', name: 'Alpha-Node', status: 'ONLINE', region: 'US-East' },
        { id: '02', name: 'Bravo-DB', status: 'OFFLINE', region: 'EU-West' },
        { id: '03', name: 'Charlie-API', status: 'ONLINE', region: 'AP-South' },
    ];

    return (
        <div className="flex flex-col items-center animate-fade-in-up w-full p-4">
            <h2 className="text-4xl font-black mb-8 uppercase italic border-b-[6px] border-[#FFECA0] inline-block">
                Server Status
            </h2>

            {/* Neo-Brutalism Table Container */}
            <div className="w-full max-w-5xl border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-6">
                <table className="w-full text-left font-mono border-collapse">
                    <thead>
                    <tr className="bg-black text-white">
                        <th className="p-4 border-[2px] border-black">ID</th>
                        <th className="p-4 border-[2px] border-black">Server Name</th>
                        <th className="p-4 border-[2px] border-black">Status</th>
                        <th className="p-4 border-[2px] border-black">Region</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* 2. Map through the data to generate rows dynamically */}
                    {servers.map((server) => (
                        <tr
                            key={server.id}
                            className={`transition-colors ${
                                server.status === 'ONLINE' ? 'hover:bg-yellow-100' : 'hover:bg-red-100'
                            }`}
                        >
                            <td className="p-4 border-[2px] border-black font-bold">
                                {server.id}
                            </td>
                            <td className="p-4 border-[2px] border-black">
                                {server.name}
                            </td>
                            <td className={`p-4 border-[2px] border-black font-black ${
                                server.status === 'ONLINE' ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {server.status}
                            </td>
                            <td className="p-4 border-[2px] border-black">
                                {server.region}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Servers;