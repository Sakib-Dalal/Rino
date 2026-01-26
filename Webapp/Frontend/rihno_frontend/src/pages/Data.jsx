import React from 'react';

function Data() {
    return (
        <div className="flex flex-col items-center animate-fade-in w-full p-6 min-h-screen bg-white">

            {/* Header Section */}
            <div className="mb-25">
                <h1 className="text-6xl md:text-8xl font-black uppercase leading-none text-center">
                    Data
                    <span className="block md:inline-block bg-[#FFECA0] border-[4px] border-black px-4 ml-0 md:ml-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        Log
                    </span>
                </h1>
            </div>
        </div>
    );
}

export default Data;