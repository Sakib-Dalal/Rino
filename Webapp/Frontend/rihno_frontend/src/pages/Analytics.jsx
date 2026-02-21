import React from 'react';
import {Calendar, Cpu, MapPin} from "lucide-react";

function Analytics() {
    return (
        <div className="flex flex-col items-center animate-fade-in w-full p-6 min-h-screen bg-white">

            {/* Header Section */}
            <div className="mb-25">
                <h1 className="text-6xl md:text-8xl font-black uppercase leading-none text-center">
                    Agent
                    <span className="block md:inline-block bg-[#FFECA0] border-[4px] border-black px-4 ml-0 md:ml-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        Dashboard
                    </span>
                </h1>


                <div className="flex flex-col items-center justify-between mt-30">
                    <h4>Hello</h4>
                </div>

                <div
                    className="p-6 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h3 className="text-3xl font-black leading-none text-black">
                            Agent Name
                        </h3>
                        <span className={`inline-block px-3 py-1 border-2 border-black text-[10px] font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center w-fit ${
                           'bg-[#CEFFBC] text-black'
                        }`}>
                                        Online
                                    </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 font-mono text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                        <div className="flex items-center gap-2 border-l-4 border-black pl-3 text-black">
                            <MapPin size={16} />
                            <span>Location: India</span>
                        </div>
                        <div className="flex items-center gap-2 border-l-4 border-black pl-3 text-black">
                            <Cpu size={16} />
                            <span>Device Type: CloudVM</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-full pt-2 mt-2 border-t border-gray-100 text-black">
                            <Calendar size={16} />
                            <span>Date Created: 19/08/2016</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Analytics;