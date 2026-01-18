import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Server, Database, User, Activity, LineChart,
    Bell, Settings, Sparkles, UserCircle
} from 'lucide-react';

function NavDashboardBottom() {
    // Note: We removed the <main> "Welcome Back" section from here.
    // It is now moved to DashboardHome.jsx so it doesn't overlap with the Servers page.

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 px-4 py-3 bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">

                {/* 1. SERVERS LINK */}
                <DockIcon to="/dashboard/servers" icon={<Server size={24} />} label="Servers" />

                {/* 2. DATA LINK */}
                <DockIcon to="/dashboard/data" icon={<Database size={24} />} label="Data" />

                <div className="w-[2px] h-8 bg-black mx-1 opacity-20"></div>

                <DockIcon to="/dashboard/user" icon={<User size={24} />} label="User" />
                <DockIcon to="/dashboard/profile" icon={<UserCircle size={24} />} label="Profile" />

                <div className="w-[2px] h-8 bg-black mx-1 opacity-20"></div>

                <DockIcon to="/dashboard/activity" icon={<Activity size={24} />} label="Activity" />
                <DockIcon to="/dashboard/analytics" icon={<LineChart size={24} />} label="Analytics" />

                <div className="w-[2px] h-8 bg-black mx-1 opacity-20"></div>
                <DockIcon to="/dashboard/notify" icon={<Bell size={24} />} label="Notify" />
                <DockIcon to="/dashboard/config" icon={<Settings size={24} />} label="Config" />
                <DockIcon to="/dashboard/ai" icon={<Sparkles size={24} />} label="AI" />

            </div>
        </div>
    );
}

// Helper: Uses NavLink for active state styling
const DockIcon = ({ icon, label, to }) => (
    <div className="group relative flex flex-col items-center justify-center">
        <span className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs font-bold py-1 px-2 mb-2 pointer-events-none whitespace-nowrap border-[1px] border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
            {label}
        </span>
        <NavLink
            to={to}
            className={({ isActive }) =>
                `p-2 border-[2px] transition-all hover:-translate-y-1 active:translate-y-0 ` +
                (isActive
                        ? "bg-black text-white border-black"
                        : "bg-transparent border-transparent hover:border-black hover:bg-black hover:text-white"
                )
            }
        >
            {React.cloneElement(icon, { strokeWidth: 2.5 })}
        </NavLink>
    </div>
);

export default NavDashboardBottom;