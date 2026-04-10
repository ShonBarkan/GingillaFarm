import React from 'react';

const InlineJsonTable = ({ val }) => {
    // 1. Handle Null or non-object values gracefully
    if (!val || typeof val !== 'object') {
        return <span className="text-gray-400 italic">null</span>;
    }

    /**
     * CASE A: Array of Objects
     * Common in: workout_templates (exercises_config), active_params (required_params)
     */
    if (Array.isArray(val)) {
        if (val.length === 0) return <span className="text-gray-300">[]</span>;
        
        // Extract keys from the first object for headers
        const firstItem = val[0];
        const keys = (firstItem && typeof firstItem === 'object') ? Object.keys(firstItem) : [];

        return (
            <div className="border border-blue-100 rounded-xl overflow-hidden my-1 shadow-sm max-w-full">
                <table className="w-full text-[9px] leading-tight text-left">
                    <thead className="bg-blue-600 text-white">
                        <tr>
                            {keys.map(k => (
                                <th key={k} className="px-2 py-1.5 border-r border-blue-500 last:border-0 font-black uppercase tracking-tighter">
                                    {k}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {val.map((item, i) => (
                            <tr key={i} className="border-b border-blue-50 last:border-0 hover:bg-blue-50/30 transition-colors">
                                {keys.map(k => (
                                    <td key={k} className="px-2 py-1 font-mono text-blue-900 break-all">
                                        {typeof item[k] === 'object' ? '{...}' : String(item[k] ?? 'null')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    /**
     * CASE B: Single Object (Key-Value pairs)
     * Common in: activity_logs (performance_data), workout_sessions (summary_data)
     */
    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden my-1 shadow-sm max-w-[200px]">
            <table className="w-full text-[9px] leading-tight" dir="rtl">
                <tbody className="bg-gray-50/50">
                    {Object.entries(val).map(([k, v]) => (
                        <tr key={k} className="border-b border-gray-100 last:border-0 text-right hover:bg-white transition-colors">
                            <td className="px-2 py-1 font-black text-gray-500 bg-gray-100/50 w-1/3 border-l border-gray-100">
                                {k}
                            </td>
                            <td className="px-2 py-1 font-mono text-gray-700 truncate">
                                {v !== null && typeof v === 'object' ? 'JSON' : String(v ?? 'null')}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InlineJsonTable;