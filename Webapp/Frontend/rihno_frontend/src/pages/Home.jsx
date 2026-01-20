import React, { Suspense } from 'react';
import { ContactShadows, Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Model from "../components/Model.jsx";
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';

function Home() {
    return (
        <div className="relative w-full h-screen bg-white overflow-hidden">

            {/* --- 1. UI LAYER (Text & Buttons) --- */}
            {/* ADDED: 'pb-32' to shift the visual center upwards */}
            <div className="absolute inset-0 z-10 container mx-auto px-6 flex items-center pb-32 pointer-events-none">
                <div className="max-w-2xl pointer-events-auto">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-xs font-bold tracking-wider mb-6 border border-gray-800 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        SYSTEM ONLINE v1.0
                    </div>

                    {/* Headline */}
                    <h1 className="text-7xl font-black text-black leading-tight mb-6 drop-shadow-sm">
                        <span className={"bg-black text-white"}>SECURE YOUR</span> <br />
                        <span className="bg-clip-text text-black">
                            INFRASTRUCTURE
                        </span>
                    </h1>

                    {/* Subtext */}
                    <p className="text-lg text-gray-600 mb-8 font-mono leading-relaxed max-w-lg">
                        Next-generation AI Intrusion Detection System.
                        Real-time monitoring, intelligent threat analysis, and
                        instant response for cloud and edge networks.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex gap-4">
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-2 bg-[#CEFFBC] text-black border-[3px] border-black px-8 py-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                        >
                            Get Started <ArrowRight size={20} />
                        </Link>

                        <Link
                            to="/documentation"
                            className="flex items-center gap-2 bg-[#7EA0FD] text-black border-[3px] border-black px-8 py-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                        >
                            Documentation
                        </Link>
                    </div>

                    {/* Feature Ticks */}
                    <div className="mt-12 flex gap-8 text-sm font-bold text-gray-500">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={18} className="text-black"/> 99.9% Uptime
                        </div>
                        {/* Note: Kept the syntax fix here (&lt;) */}
                        <div className="flex items-center gap-2">
                            <Zap size={18} className="text-black"/> &lt; 10ms Latency
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 2. 3D SCENE (Background) --- */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
                    <ambientLight intensity={0.7} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
                    <directionalLight position={[-5, 5, -5]} intensity={0.5} color="white" />

                    <Suspense fallback={null}>
                        <group position={[2.0, 0.3, 0]}>
                            <Model />
                        </group>
                    </Suspense>

                    <Environment preset="city" />
                </Canvas>
            </div>
        </div>
    );
}

export default Home;