import React from 'react';
import { ActivityCalendar } from 'react-activity-calendar';
import { Tooltip as ReactTooltip } from 'react-tooltip'; // Aliased to prevent collision
import 'react-tooltip/dist/react-tooltip.css';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip, // Aliased to prevent collision
    ResponsiveContainer
} from 'recharts';

// Helper function to generate a full year of mock CPU data
const generateYearlyData = () => {
    const data = [];
    const today = new Date('2026-02-22');

    for (let i = 365; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const cpuLoad = Math.floor(Math.random() * 95) + 5;

        let level = 0;
        if (cpuLoad > 20) level = 1;
        if (cpuLoad > 40) level = 2;
        if (cpuLoad > 70) level = 3;
        if (cpuLoad > 89) level = 4;

        data.push({
            date: date.toISOString().split('T')[0],
            count: cpuLoad,
            level: level
        });
    }
    return data;
};

function CPUMetricsView() {
    const cpuData = generateYearlyData();

    // Your custom pastel palette
    const customTheme = {
        light: ['#ebedf0', '#7EA0FD', '#CEFFBC', '#FFECA0', '#FFA0A2'],
        dark:  ['#1f2937', '#7EA0FD', '#CEFFBC', '#FFECA0', '#FFA0A2'],
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif', width: '100%', boxSizing: 'border-box' }}>

            {/* CSS to force the calendar's SVG to stretch and fill horizontal space */}
            <style>{`
                .stretch-calendar svg {
                    width: 100%;
                    height: auto;
                }
            `}</style>

            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: '0 0 0.5rem 0', color: '#111827' }}>
                    Node CPU Utilization
                </h2>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                    Daily average CPU load percentage over the last 365 days.
                </p>
            </div>

            {/* --- RECHARTS AREA CHART SECTION --- */}
            <div style={{ width: '100%', height: 300, marginBottom: '3rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={cpuData}
                        margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                    >
                        {/* Define the gradient fill for the Area chart */}
                        <defs>
                            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7EA0FD" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#7EA0FD" stopOpacity={0}/>
                            </linearGradient>
                        </defs>

                        {/* Format the X-axis so it doesn't get cluttered with 365 dates */}
                        <XAxis
                            dataKey="date"
                            tickFormatter={(tick) => {
                                const d = new Date(tick);
                                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            }}
                            minTickGap={50} // Ensures labels don't overlap
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <YAxis
                            tickFormatter={(tick) => `${tick}%`}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />

                        {/* The hover tooltip for the Area Chart */}
                        <RechartsTooltip
                            labelFormatter={(label) => `Date: ${label}`}
                            formatter={(value) => [`${value}%`, 'Avg Load']}
                            contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />

                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#7EA0FD"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorCpu)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* --- ACTIVITY CALENDAR SECTION --- */}
            <div className="stretch-calendar">
                <ActivityCalendar
                    data={cpuData}
                    theme={customTheme}
                    colorScheme="light"
                    blockSize={16}
                    blockRadius={100} // Perfect circles
                    blockMargin={5}
                    labels={{
                        legend: { less: 'Idle', more: 'Maxed' },
                        totalCount: 'Yearly CPU Resource Map',
                    }}
                    renderBlock={(block, activity) =>
                        React.cloneElement(block, {
                            'data-tooltip-id': 'calendar-tooltip',
                            'data-tooltip-content': `${activity.count}% Average Load on ${activity.date}`,
                        })
                    }
                />
            </div>

            {/* The Tooltip for the Calendar Heatmap */}
            <ReactTooltip
                id="calendar-tooltip"
                style={{
                    backgroundColor: '#1f2937',
                    color: '#fff',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontWeight: '500',
                    fontSize: '14px',
                    zIndex: 100
                }}
            />
        </div>
    );
}

export default CPUMetricsView;