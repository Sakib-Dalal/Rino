import React, { useState } from 'react';
import { ResponsiveNetworkCanvas } from '@nivo/network';

// Sample Data for different devices (e.g., EC2 instances and their connections)
const deviceData = {
    device1: {
        nodes: [
            { id: 'EC2-Main', radius: 12, color: '#f47560' },
            { id: '10.0.1.5', radius: 8, color: '#e8c1a0' },
            { id: '10.0.1.10', radius: 8, color: '#e8c1a0' },
            { id: 'DB-Instance', radius: 10, color: '#f1e15b' },
        ],
        links: [
            { source: 'EC2-Main', target: '10.0.1.5', distance: 50 },
            { source: 'EC2-Main', target: '10.0.1.10', distance: 50 },
            { source: '10.0.1.5', target: 'DB-Instance', distance: 80 },
        ]
    },
    device2: {
        nodes: [
            { id: 'Gateway-Router', radius: 12, color: '#61cdbb' },
            { id: '192.168.1.1', radius: 8, color: '#97e3d5' },
            { id: '192.161.1.1', radius: 8, color: '#97e3d5' },
            { id: '192.163.1.1', radius: 8, color: '#97e3d5' },
            { id: '192.168.1.2', radius: 8, color: '#97e3d5' },
            { id: 'External-IP', radius: 10, color: '#e8a838' },
        ],
        links: [
            { source: 'Gateway-Router', target: '192.168.1.1', distance: 60 },
            { source: 'Gateway-Router', target: '192.161.1.1', distance: 60 },
            { source: 'Gateway-Router', target: '192.163.1.1', distance: 60 },
            { source: 'Gateway-Router', target: '192.168.1.2', distance: 60 },
            { source: 'Gateway-Router', target: 'External-IP', distance: 100 },
        ]
    },
    device3: {
        nodes: [
            { id: 'IDS-Sensor-01', radius: 14, color: '#4e79a7', type: 'sensor' },
            { id: 'Critical-Database', radius: 16, color: '#f28e2c', type: 'asset' },
            { id: '192.168.1.50', radius: 10, color: '#e15759', status: 'Compromised' }, // Red: High Risk
            { id: '10.0.5.22', radius: 10, color: '#76b7b2', status: 'Safe' },
            { id: 'Attacker-C2', radius: 12, color: '#7041fa', type: 'external' }, // Purple: Command & Control
            { id: 'Anomalous-IP', radius: 10, color: '#edc949', status: 'Warning' }, // Yellow: Medium Risk
        ],
        links: [
            // Normal internal traffic
            { source: 'IDS-Sensor-01', target: '10.0.5.22', distance: 60, label: 'Standard Flow' },
            // Suspicious traffic from external C2 to internal IP
            { source: 'Attacker-C2', target: '192.168.1.50', distance: 100, label: 'Unauthorized Access' },
            // Lateral movement attempt
            { source: '192.168.1.50', target: 'Critical-Database', distance: 40, label: 'SQL Injection Attempt' },
            // Potential scanning behavior
            { source: 'Anomalous-IP', target: 'IDS-Sensor-01', distance: 80, label: 'Port Scan' },
        ]
    }
};

function NetworkMap() {
    const [selectedDevice, setSelectedDevice] = useState('device1');

    const handleChange = (event) => {
        setSelectedDevice(event.target.value);
    };

    return (
        <div style={{ height: '600px', width: '100%', padding: '20px' }}>
            {/* Dropdown Menu */}
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="device-select">Select Agent: </label>
                <select
                    id="device-select"
                    value={selectedDevice}
                    onChange={handleChange}
                    style={{ padding: '5px', borderRadius: '4px' }}
                >
                    <option value="device1">EC2 Instance - Prod</option>
                    <option value="device2">EC2 Instance - Dev</option>
                    <option value="device3">EC2 Instance - Dev</option>
                </select>
            </div>

            {/* Network Graph Container */}
            <div style={{ height: '800px', border: '1px solid #ddd', background: 'white' }}>
                <ResponsiveNetworkCanvas
                    data={deviceData[selectedDevice]}
                    margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                    linkDistance={e => e.distance}
                    centeringStrength={0.3}
                    repulsivity={6}
                    nodeColor={e => e.color}
                    nodeBorderWidth={1}
                    nodeBorderColor={{ from: 'color', modifiers: [['darker', 0.8]] }}
                    linkThickness={2}
                    linkColor="#999"
                    motionConfig="gentle"
                />
            </div>
        </div>
    );
}

export default NetworkMap;