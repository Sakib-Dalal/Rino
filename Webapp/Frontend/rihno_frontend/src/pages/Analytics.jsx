import React, { useState } from 'react';
import { Calendar, Cpu, MapPin } from "lucide-react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import Button from "../components/Button.jsx";
import {Link} from "react-router-dom";

function Analytics() {
    // Pie chart data
    const data_01 = [
        { name: "CPU Available", value: 10 },
        { name: "CPU Used", value: 90 }
    ];
    const data_02 = [
        { name: "Memory Available", value: 25 },
        { name: "Memory Used", value: 75 }
    ];
    const data_03 = [
        { name: "Network Available", value: 40 },
        { name: "Network Used", value: 60 }
    ];

    const data_04 = [
        { name: "Network Available", value: 44 },
        { name: "Network Used", value: 56 }
    ];

    // Pie chart Colors
    const COLORS_01 = ["#F7B980", "#5A7ACD"];
    const COLORS_02 = ["#94A378", "#2D3C59"];
    const COLORS_03 = ["#ACBAC4", "#E1D9BC"];
    const COLORS_04 = ["#BBE0EF", "#FF7DB0"];

    // Track WHICH card is hovered by its ID/Index (null means none are hovered)
    const [hoveredCardIndex, setHoveredCardIndex] = useState(null);

    return (
        <div>
            <h1 className={"font-mono text-3xl my-16 uppercase text-center"}>
                Rihno: <span className={"border-4 font-bold p-3 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-[#CEFFBC]"}>Agent Dashboard</span>
            </h1>
            <hr />
            <div>
                <h1 className={"p-3 uppercase font-mono bg-black text-white flex gap-3"}> <Cpu /> System Resources </h1>
                <hr />
                <div className={"grid grid-cols-4 gap-1 mt-2 justify-center items-center "}>

                    {/* CARD 1 */}
                    <div className={"bg-white hover:shadow-xl border-1 border-dashed border-gray-200 hover:border-black hover:border-solid px-4 py-3"}>
                        <div className={"flex flex-row items-center justify-between"}>
                            <h1 className={"font-mono p-1 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-[#FFECA0]"}> System CPU </h1>

                            <div className="relative inline-block">
                                <button
                                    onMouseEnter={() => setHoveredCardIndex(1)} // Set to 1
                                    onMouseLeave={() => setHoveredCardIndex(null)} // Reset
                                    className="w-5 h-5 rounded-full bg-gray-300 text-white flex items-center justify-center hover:bg-[#FFA0A2] transition"
                                >
                                    i
                                </button>

                                {hoveredCardIndex === 1 && ( // Check if 1
                                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-gray-200 text-black text-sm px-3 py-2 rounded shadow-lg w-48 z-10">
                                        Overall system CPU usage.
                                    </div>
                                )}
                            </div>
                        </div>


                        <div className={"flex flex-col items-center justify-between mb-3"}>
                            <PieChart width={250} height={250}>
                                <Pie data={data_01} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius="65%" label>
                                    {data_01.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_01[index % COLORS_01.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                            <div className={"flex flex-row items-start justify-center gap-2"}>
                                <h1 className={"font-mono "}><span className={"bg-[#F7B980] text-white p-1"}>10%</span> CPU Available</h1>
                                <h1 className={"font-mono "}><span className={"bg-[#5A7ACD] text-white p-1"}>90%</span> CPU Used</h1>
                            </div>
                        </div>

                        <hr></hr>
                        <Link to='/dashboard/analytics/timestamp_view'
                              className={"flex flex-row justify-center items-end m-4 gap-2 font-mono border border-white p-1 text-black hover:border-black hover:text-white bg-white hover:bg-black"}
                        >
                            <Calendar />
                            View More
                        </Link>

                    </div>

                    {/* CARD 2 */}
                    <div className={"bg-white hover:shadow-xl border border-dashed border-gray-200 hover:border-black hover:border-solid px-4 py-3"}>
                        <div className={"flex flex-row items-center justify-between"}>
                            <h1 className={"font-mono p-1 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-[#FFECA0]"}> Avg. CPU Core </h1>

                            <div className="relative inline-block">
                                <button
                                    onMouseEnter={() => setHoveredCardIndex(2)} // Set to 2
                                    onMouseLeave={() => setHoveredCardIndex(null)}
                                    className="w-5 h-5 rounded-full bg-gray-300 text-white flex items-center justify-center hover:bg-[#FFA0A2] transition"
                                >
                                    i
                                </button>

                                {hoveredCardIndex === 2 && ( // Check if 2
                                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-gray-200 text-black text-sm px-3 py-2 rounded shadow-lg w-48 z-10">
                                        Average per-core CPU usage
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={"flex flex-col items-center justify-between mb-3"}>
                            <PieChart width={250} height={250}>
                                <Pie data={data_02} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius="65%" label>
                                    {data_02.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_02[index % COLORS_02.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                            <div className={"flex flex-row items-start justify-center gap-2"}>
                                <h1 className={"font-mono "}><span className={`bg-[#94A378] text-white p-1`}>25%</span> Avg. CPU Available</h1>
                                <h1 className={"font-mono "}><span className={"bg-[#2D3C59] text-white p-1"}>75%</span> Avg. CPU Used</h1>
                            </div>
                        </div>

                        <hr></hr>
                        <Link to='/dashboard/analytics/timestamp_view'
                              className={"flex flex-row justify-center items-end m-4 gap-2 font-mono border border-white p-1 text-black hover:border-black hover:text-white bg-white hover:bg-black"}
                        >
                            <Calendar />
                            View More
                        </Link>
                    </div>

                    {/* CARD 3 */}
                    <div className={"bg-white hover:shadow-xl border-1 border-dashed border-gray-200 hover:border-black hover:border-solid px-4 py-3"}>
                        <div className={"flex flex-row items-center justify-between"}>
                            <h1 className={"font-mono p-1 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-[#FFECA0]"}> System Memory Percentage </h1>

                            <div className="relative inline-block">
                                <button
                                    onMouseEnter={() => setHoveredCardIndex(3)} // Set to 3
                                    onMouseLeave={() => setHoveredCardIndex(null)}
                                    className="w-5 h-5 rounded-full bg-gray-300 text-white flex items-center justify-center hover:bg-[#FFA0A2] transition"
                                >
                                    i
                                </button>

                                {hoveredCardIndex === 3 && ( // Check if 3
                                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-gray-200 text-black text-sm px-3 py-2 rounded shadow-lg w-48 z-10">
                                        Overall memory utilization in percentage.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={"flex flex-col items-center justify-between mb-3"}>
                            <PieChart width={250} height={250}>
                                <Pie data={data_03} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius="65%" label>
                                    {data_03.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_03[index % COLORS_03.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                            <div className={"flex flex-row items-start justify-center gap-2"}>
                                <h1 className={"font-mono "}><span className={"bg-[#ACBAC4] text-white p-1"}>40%</span> CPU Available</h1>
                                <h1 className={"font-mono "}><span className={"bg-[#E1D9BC] text-white p-1"}>60%</span> CPU Used</h1>
                            </div>
                        </div>

                        <hr></hr>
                        <Link to='/dashboard/analytics/timestamp_view'
                              className={"flex flex-row justify-center items-end m-4 gap-2 font-mono border border-white p-1 text-black hover:border-black hover:text-white bg-white hover:bg-black"}
                        >
                            <Calendar />
                            View More
                        </Link>
                    </div>

                    {/* CARD 4 */}
                    <div className={"bg-white hover:shadow-xl border-1 border-dashed border-gray-200 hover:border-black hover:border-solid px-4 py-3"}>
                        <div className={"flex flex-row items-center justify-between"}>
                            <h1 className={"font-mono p-1 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-[#FFECA0]"}> Swap Memory Percentage </h1>

                            <div className="relative inline-block">
                                <button
                                    onMouseEnter={() => setHoveredCardIndex(4)} // Set to 4
                                    onMouseLeave={() => setHoveredCardIndex(null)}
                                    className="w-5 h-5 rounded-full bg-gray-300 text-white flex items-center justify-center hover:bg-[#FFA0A2] transition"
                                >
                                    i
                                </button>

                                {hoveredCardIndex === 4 && ( // Check if 4
                                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-gray-200 text-black text-sm px-3 py-2 rounded shadow-lg w-48 z-10">
                                        Overall swap space utilization in percentage.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={"flex flex-col items-center justify-between mb-3"}>
                            <PieChart width={250} height={250}>
                                <Pie data={data_04} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius="65%" label>
                                    {data_04.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_04[index % COLORS_04.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                            <div className={"flex flex-row items-start justify-center gap-2"}>
                                <h1 className={"font-mono "}><span className={"bg-[#BBE0EF] text-white p-1"}>10%</span> CPU Available</h1>
                                <h1 className={"font-mono "}><span className={"bg-[#FF7DB0] text-white p-1"}>90%</span> CPU Used</h1>
                            </div>
                        </div>

                        <hr></hr>
                        <Link to='/dashboard/analytics/timestamp_view'
                        className={"flex flex-row justify-center items-end m-4 gap-2 font-mono border border-white p-1 text-black hover:border-black hover:text-white bg-white hover:bg-black"}
                        >
                            <Calendar />
                            View More
                        </Link>

                    </div>


                </div>
            </div>
        </div>
    );
}

export default Analytics;