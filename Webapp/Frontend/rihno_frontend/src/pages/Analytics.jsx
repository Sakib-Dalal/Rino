import React from 'react';
import {Calendar, Cpu, MapPin} from "lucide-react";

function Analytics() {
    return (
        <div>
            <h1 className={"font-mono text-3xl mb-6"}>Agent Rihno Dashboard</h1>
            <div className={"grid grid-cols-3 gap-1"}>
                <div className={"bg-white"}>
                    <Cpu size={24} />
                </div>
                <div className={"bg-black"}>
                    hi
                </div>
                <div className={"bg-black"}>
                    hi
                </div>

            </div>
        </div>

    );
}

export default Analytics;