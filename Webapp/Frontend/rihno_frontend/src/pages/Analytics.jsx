import React from 'react';

function Analytics() {
    return (
        /* w-full h-full: Centers within the remaining parent space
           flex-1: Ensures it grows to fill the available area in a flex container
        */
        <div className="w-full h-full bg-black flex flex-col items-center justify-center flex-1">
            <h1 className="text-[#CEFFBC] text-4xl font-black uppercase">
                Analytics Dashboard
            </h1>
            <p className="text-white font-mono mt-4">
                System monitoring in progress...
            </p>
        </div>
    );
}

export default Analytics;