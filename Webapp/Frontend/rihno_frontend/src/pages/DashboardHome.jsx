import React, { Suspense } from 'react';
import { Environment, ScrollControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Model from "../components/Model.jsx";
import { Link } from 'react-router-dom';
import { Terminal } from 'lucide-react';

function DashboardHome() {
    return (

        <div className="min-h-screen bg-white text-black font-sans">
            {/* --- 1. UI LAYER --- */}
            <div className="relative z-10 flex flex-col min-h-screen">

                <main className="flex-1 container mx-auto px-1 flex flex-col justify-center pointer-events-none">
                    <div className="max-w-xl pointer-events-auto">
                        <h1 className="text-6xl md:text-8xl font-black uppercase leading-none mb-6">
                            RIHNO <br />
                            <span className="bg-[#CEFFBC] border-[3px] border-black px-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                Security
                            </span>
                        </h1>

                        <p className="text-lg font-mono mb-8 max-w-sm">
                            Next-generation AI Intrusion Detection for modern infrastructure.
                        </p>

                        <div className="flex gap-4">
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-2 bg-black text-white px-6 py-3 font-bold uppercase hover:translate-x-1 hover:translate-y-1 transition-transform"
                            >
                                Install Tool <Terminal size={18} />
                            </Link>
                            <Link
                                to="/documentation"
                                className="flex items-center gap-2 bg-[#7EA0FD] border-[3px] border-black px-6 py-3 font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                            >
                                Docs
                            </Link>
                        </div>
                    </div>
                </main>

                {/* Bottom Bar Stats */}
                <footer className="grid grid-cols-1 md:grid-cols-3 border-t-[3px] border-black bg-white">
                    <div className="p-4 border-b-[3px] md:border-b-0 md:border-r-[3px] border-black font-bold">
                        <span className="text-gray-500 text-xs uppercase block">Uptime</span>
                        99.99% Reliable
                    </div>
                    <div className="p-4 border-b-[3px] md:border-b-0 md:border-r-[3px] border-black font-bold">
                        <span className="text-gray-500 text-xs uppercase block">Latency</span>
                        &lt; 10ms Response
                    </div>
                    <div className="p-4 font-bold">
                        <span className="text-gray-500 text-xs uppercase block">Engine</span>
                        RHINO v1.0 AI
                    </div>
                </footer>
            </div>

            {/* --- 2. 3D SCENE (Background) --- */}
            <div className="absolute inset-0 z-0 mt-50">
                <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
                    <ambientLight intensity={0.8} />
                    <Suspense fallback={null}>
                        <ScrollControls pages={2} damping={0.1}>
                            <Model />
                        </ScrollControls>
                    </Suspense>
                    <Environment preset="city" />
                </Canvas>
            </div>
        </div>
    );
}

export default DashboardHome;