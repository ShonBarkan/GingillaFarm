import React from 'react';

const TimeRangePicker = ({ currentRange, onRangeChange }) => {
    const ranges = [
        { id: 'all', label: 'הכל' },
        { id: 'day', label: 'היום' },
        { id: 'week', label: 'השבוע' },
        { id: 'month', label: 'החודש' },
    ];

    return (
        <div 
            className="flex bg-gray-100/80 p-1.5 rounded-2xl w-fit shadow-inner border border-gray-100" 
            dir="rtl"
        >
            {ranges.map((range) => (
                <button
                    key={range.id}
                    onClick={() => onRangeChange(range.id)}
                    className={`px-5 py-2 rounded-xl text-[11px] md:text-xs font-black transition-all duration-300 active:scale-95 ${
                        currentRange === range.id 
                            ? 'bg-white text-blue-600 shadow-sm border border-gray-50' 
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'
                    }`}
                >
                    {range.label}
                </button>
            ))}
        </div>
    );
};

export default TimeRangePicker;