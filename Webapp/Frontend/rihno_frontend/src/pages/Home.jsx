import React, { Suspense } from 'react';
import { Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Model from "../components/Model.jsx";
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';

function Home() {
    return (
        // Changed h-screen to min-h-screen to prevent content cutoff on small devices
        <div className="relative w-full min-h-screen bg-white overflow-hidden flex flex-col">

            {/* --- 1. UI LAYER --- */}
            <div className="relative lg:absolute inset-0 z-10 container mx-auto px-6 flex items-center pt-24 pb-12 lg:pb-32 pointer-events-none">
                <div className="max-w-2xl pointer-events-auto">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-[10px] md:text-xs font-bold tracking-wider mb-4 md:mb-6 border border-gray-800 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        SYSTEM ONLINE v1.0
                    </div>

                    {/* Headline: Responsive text sizes */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-black leading-tight mb-6 drop-shadow-sm">
                        <span className={"bg-black text-white px-2"}>SECURE YOUR</span> <br />
                        <span className="bg-clip-text text-black">
                            INFRASTRUCTURE
                        </span>
                    </h1>

                    {/* Subtext: Better width control on mobile */}
                    <p className="text-base md:text-lg text-gray-600 mb-8 font-mono leading-relaxed max-w-md md:max-w-lg">
                        Next-generation AI Intrusion Detection System.
                        Real-time monitoring, intelligent threat analysis.
                    </p>

                    {/* CTA Buttons: Stacks on very small screens */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/dashboard"
                            className="flex justify-center items-center gap-2 bg-[#CEFFBC] text-black border-[3px] border-black px-6 py-3 md:px-8 md:py-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                        >
                            Get Started <ArrowRight size={20} />
                        </Link>

                        <Link
                            to="/documentation"
                            className="flex justify-center items-center gap-2 bg-[#7EA0FD] text-black border-[3px] border-black px-6 py-3 md:px-8 md:py-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                        >
                            Documentation
                        </Link>
                    </div>

                    {/* Feature Ticks: Wrap on small screens */}
                    <div className="mt-8 md:mt-12 flex flex-wrap gap-4 md:gap-8 text-sm font-bold text-gray-500">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={18} className="text-black"/> 99.9% Uptime
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap size={18} className="text-black"/> &lt; 10ms Latency
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 2. 3D SCENE --- */}
            {/* Added h-[300px] for mobile so it doesn't take the full screen height */}
            <div className="absolute inset-0 z-0 h-[50vh] lg:h-full">
                <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
                    <ambientLight intensity={0.7} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
                    <directionalLight position={[-5, 5, -5]} intensity={0.5} color="white" />

                    <Suspense fallback={null}>
                        {/* Adjust position: centered on mobile, right-aligned on desktop */}
                        <group position={[window.innerWidth < 1024 ? 0 : 2.0, -0.5, 0]} scale={window.innerWidth < 1024 ? 0.8 : 1}>
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