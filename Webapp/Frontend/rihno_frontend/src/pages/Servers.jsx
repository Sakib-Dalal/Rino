import React from 'react';

function Servers() {
    return (
        <div className="flex flex-col items-center animate-fade-in-up w-full p-4">
            <h2 className="text-4xl font-black mb-8 uppercase italic border-b-[6px] border-[#FFECA0] inline-block">
                Server Status
            </h2>

            {/* Neo-Brutalism Table */}
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
                    <tr className="hover:bg-yellow-100 transition-colors">
                        <td className="p-4 border-[2px] border-black font-bold">01</td>
                        <td className="p-4 border-[2px] border-black">Alpha-Node</td>
                        <td className="p-4 border-[2px] border-black text-green-600 font-black">ONLINE</td>
                        <td className="p-4 border-[2px] border-black">US-East</td>
                    </tr>
                    <tr className="hover:bg-red-100 transition-colors">
                        <td className="p-4 border-[2px] border-black font-bold">02</td>
                        <td className="p-4 border-[2px] border-black">Bravo-DB</td>
                        <td className="p-4 border-[2px] border-black text-red-600 font-black">OFFLINE</td>
                        <td className="p-4 border-[2px] border-black">EU-West</td>
                    </tr>
                    <tr className="hover:bg-yellow-100 transition-colors">
                        <td className="p-4 border-[2px] border-black font-bold">03</td>
                        <td className="p-4 border-[2px] border-black">Charlie-API</td>
                        <td className="p-4 border-[2px] border-black text-green-600 font-black">ONLINE</td>
                        <td className="p-4 border-[2px] border-black">AP-South</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Servers;