import React from 'react';
import { Outlet } from "react-router-dom"; // Import Outlet
import NavDashboardTop from "../components/NavDashboardTop.jsx";
import NavDashboardBottom from "../components/NavDashboardBottom.jsx";

function Dashboard() {
    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white pb-32">

            {/* 1. TOP NAVBAR */}
            <NavDashboardTop />

            {/* 2. DYNAMIC CONTENT AREA (Servers, Home, etc. load here) */}
            <main className="max-w-7xl mx-auto mt-6">
                <Outlet />
            </main>

            {/* 3. BOTTOM DOCK */}
            <NavDashboardBottom />
        </div>
    );
}

export default Dashboard;