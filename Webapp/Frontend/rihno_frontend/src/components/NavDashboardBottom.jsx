import React from 'react';

import {
    Server,
    Database,
    User,
    Activity,
    LineChart,
    Bell,
    Settings,
    Sparkles,
    LogOut,
    ScrollText,
    UserCircle
} from 'lucide-react';

function NavDashboardBottom() {


    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
                <h2 className="text-6xl font-black mb-4 uppercase italic">Welcome Back</h2>
                <p className="font-mono text-xl max-w-2xl border-[3px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-yellow-50">
                    "Neubrutalism is about honesty in materials and purity in structure."
                    <br/><br/>
                    <span className="text-sm text-gray-500 block text-right">- Your Dashboard</span>
                </p>
            </main>

            {/* --- BOTTOM HOVER NAVBAR (DOCK) --- */}
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
                <div className="flex items-center gap-2 px-4 py-3 bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">

                    <DockIcon icon={<Server size={24} />} label="Servers" />
                    <DockIcon icon={<Database size={24} />} label="Data" />
                    <div className="w-[2px] h-8 bg-black mx-1 opacity-20"></div>

                    <DockIcon icon={<User size={24} />} label="User" />
                    <DockIcon icon={<UserCircle size={24} />} label="Profile" />
                    <div className="w-[2px] h-8 bg-black mx-1 opacity-20"></div>

                    <DockIcon icon={<Activity size={24} />} label="Activity" />
                    <DockIcon icon={<LineChart size={24} />} label="Analytics" />

                    <div className="w-[2px] h-8 bg-black mx-1 opacity-20"></div>
                    <DockIcon icon={<Bell size={24} />} label="Notify" />
                    <DockIcon icon={<Settings size={24} />} label="Config" />
                    <DockIcon icon={<Sparkles size={24} />} label="AI" />

                </div>
            </div>
        </div>
    );
}

// Helper component for the Dock Icons with Tooltip/Hover effect
const DockIcon = ({ icon, label }) => (
    <div className="group relative flex flex-col items-center justify-center">
        {/* Tooltip Label */}
        <span className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs font-bold py-1 px-2 mb-2 pointer-events-none whitespace-nowrap border-[1px] border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
            {label}
        </span>

        {/* Icon Button */}
        <button className="p-2 hover:bg-black hover:text-white border-[2px] border-transparent hover:border-black transition-all hover:-translate-y-1 active:translate-y-0">
            {React.cloneElement(icon, { strokeWidth: 2.5 })}
        </button>
    </div>
);

export default NavDashboardBottom;