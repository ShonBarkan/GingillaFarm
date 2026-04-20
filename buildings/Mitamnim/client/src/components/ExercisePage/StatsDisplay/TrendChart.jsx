import React, { useMemo, useState } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const TrendChart = ({ logs, parameters, timeRange }) => {
    const [selectedParam, setSelectedParam] = useState('all');

    const dynamicParams = useMemo(() => {
        const names = new Set();
        (logs || []).forEach(log => {
            if (log.performance_data) {
                Object.keys(log.performance_data).forEach(key => names.add(key));
            }
        });
        return Array.from(names).map(name => ({
            name,
            unit: (parameters || []).find(p => p.name === name)?.unit || ''
        }));
    }, [logs, parameters]);

    const chartData = useMemo(() => {
        if (!logs || logs.length === 0) return [];

        const groups = {};

        logs.forEach(log => {
            const dateObj = new Date(log.timestamp);
            if (isNaN(dateObj.getTime())) return;

            // Group by formatted string (hour for 'day' range, date for others)
            const groupKey = timeRange === 'day' 
                ? dateObj.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
                : dateObj.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' });

            if (!groups[groupKey]) {
                groups[groupKey] = {
                    displayTime: groupKey,
                    fullTimestamp: dateObj.getTime(),
                };
            }

            const perfData = log.performance_data || {};
            Object.entries(perfData).forEach(([key, value]) => {
                const numVal = parseFloat(value);
                if (!isNaN(numVal)) {
                    // Accumulate (Sum) instead of Math.max
                    groups[groupKey][key] = (groups[groupKey][key] || 0) + numVal;
                }
            });
        });

        return Object.values(groups).sort((a, b) => a.fullTimestamp - b.fullTimestamp);
    }, [logs, timeRange]);

    const maxValues = useMemo(() => {
        const maxes = {};
        chartData.forEach(entry => {
            dynamicParams.forEach(p => {
                const val = entry[p.name];
                if (typeof val === 'number') {
                    if (!maxes[p.name] || val > maxes[p.name]) maxes[p.name] = val;
                }
            });
        });
        return maxes;
    }, [chartData, dynamicParams]);

    const colors = ['#2563eb', '#7c3aed', '#db2777', '#059669', '#ea580c', '#ca8a04'];

    return (
        <div className="space-y-6 min-w-0">
            <div className="flex items-center justify-between px-2">
                <h3 className="font-black text-gray-900 text-lg uppercase tracking-widest text-right">Trend Analysis</h3>
                
                <select 
                    value={selectedParam}
                    onChange={(e) => setSelectedParam(e.target.value)}
                    className="bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-black text-blue-600 outline-none cursor-pointer hover:bg-blue-50 transition-colors"
                >
                    <option value="all">All Metrics (%)</option>
                    {dynamicParams.map(p => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                </select>
            </div>

            <div className="h-[350px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="displayTime" 
                            stroke="#d1d5db" 
                            fontSize={10} 
                            fontWeight="bold"
                            tick={{ dy: 10 }}
                        />
                        <YAxis 
                            stroke="#d1d5db" 
                            fontSize={10} 
                            fontWeight="bold"
                            tickFormatter={(value) => selectedParam === 'all' ? `${value}%` : value}
                            domain={selectedParam === 'all' ? [0, 110] : ['auto', 'auto']}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '1rem', direction: 'rtl' }}
                            itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold' }} />
                        
                        {dynamicParams.map((param, index) => {
                            const isVisible = selectedParam === 'all' || selectedParam === param.name;
                            if (!isVisible) return null;

                            return (
                                <Line
                                    key={param.name}
                                    type="monotone"
                                    dataKey={selectedParam === 'all' 
                                        ? (entry) => (maxValues[param.name] ? (entry[param.name] / maxValues[param.name]) * 100 : 0)
                                        : param.name
                                    }
                                    name={param.name}
                                    stroke={colors[index % colors.length]}
                                    strokeWidth={4}
                                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                    isAnimationActive={true}
                                    connectNulls
                                />
                            );
                        })}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TrendChart;