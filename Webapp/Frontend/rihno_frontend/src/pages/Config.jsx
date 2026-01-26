import React from 'react';
import { List, Plus, Edit3Icon, Trash, ArrowLeft } from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

function Config() {
    const location = useLocation();
    const navigate = useNavigate();

    // Checks if the user is on the main config menu page
    const isRootConfig = location.pathname === "/dashboard/config" || location.pathname === "/dashboard/config/";

    const menuItems = [
        { label: "List All Devices", icon: <List size={28} />, path: "listdevices" },
        { label: "Add New Device", icon: <Plus size={28} />, path: "newdevice" },
        { label: "Edit Device", icon: <Edit3Icon size={28} />, path: "editdevice" },
        { label: "Delete Device", icon: <Trash size={28} />, path: "deletedevice" },
    ];

    return (
        <div className="flex flex-col pt-10 px-4 max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="mb-25">
                <h1 className="text-6xl md:text-8xl font-black uppercase leading-none text-center">
                    RHINO
                    <span className="block md:inline-block bg-[#7EA0FD] border-[4px] border-black px-4 ml-0 md:ml-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        Config
                    </span>
                </h1>
            </div>

            {isRootConfig ? (
                <div className="flex flex-col">
                    <div className={"h-1 bg-gray-100"}></div>
                    {menuItems.map((item) => (
                        <div>
                            <Link
                                key={item.path}
                                to={item.path}
                                className="group flex items-center justify-between p-8 bg-white text-black transition-all duration-200 hover:bg-black hover:text-white"
                            >
                            <span className="text-xl uppercase  tracking-tighter font-mono">
                                {item.label}
                            </span>
                                <div className="p-2 transition-colors">
                                    {item.icon}
                                </div>
                            </Link>
                            <div className={"h-1 bg-gray-100"}></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <button
                        onClick={() => navigate("/dashboard/config")}
                        className="flex items-center gap-2 mb-8 w-fit font-black uppercase px-6 py-3 bg-white hover:bg-black hover:text-white transition-all"
                    >
                        <ArrowLeft size={24} strokeWidth={3} /> Back to Menu
                    </button>

                    <div className="bg-white p-8">
                        <Outlet />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Config;