import React from 'react';

function DashboardHome() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center animate-fade-in-up">
            <h2 className="text-6xl font-black mb-4 uppercase italic">Welcome Back</h2>
            <p className="font-mono text-xl max-w-2xl border-[3px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-yellow-50">
                "Neubrutalism is about honesty in materials and purity in structure."
                <br/><br/>
                <span className="text-sm text-gray-500 block text-right">- Your Dashboard</span>
            </p>
        </div>
    );
}

export default DashboardHome;