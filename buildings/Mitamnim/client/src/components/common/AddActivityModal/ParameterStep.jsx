import React from 'react';
import { Plus, Minus } from 'lucide-react';

const ParameterStep = ({ param, displayName, value, onChange, quickOptions, totalSteps, currentIndex }) => {
    const nameToUse = displayName || "פרמטר";
    
    const numericValue = Number(value) || 0;

    const handleIncrement = () => {
        onChange(nameToUse, numericValue + 1);
    };

    const handleDecrement = () => {
        if (numericValue > 0) {
            onChange(nameToUse, numericValue - 1);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 w-full">
            <div className="flex justify-center gap-2">
                {[...Array(totalSteps)].map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-8 bg-blue-600' : 'w-2 bg-gray-200'}`} 
                    />
                ))}
            </div>

            <div className="text-center space-y-6">
                <div className="space-y-2">
                    <span className="text-blue-600 font-black text-xs uppercase tracking-[0.2em]">שאלה {currentIndex + 1} מתוך {totalSteps}</span>
                    <h3 className="text-4xl font-black text-gray-900 tracking-tighter">
                        כמה {nameToUse}?
                    </h3>
                    <p className="text-gray-400 font-bold">ביחידות של {param?.unit || param?.parameter?.unit || 'מדד'}</p>
                </div>

                <div className="space-y-8">
                    <div className="flex items-center justify-center gap-6">
                        <button 
                            type="button" 
                            onClick={handleDecrement} 
                            className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all active:scale-90 shadow-sm"
                        >
                            <Minus size={32} strokeWidth={3} />
                        </button>

                        <div className="relative min-w-[160px]">
                            <input 
                                type="number"
                                autoFocus
                                value={value ?? ''} 
                                onChange={(e) => onChange(nameToUse, e.target.value)}
                                className="w-full text-center text-7xl font-black text-blue-600 bg-transparent outline-none placeholder:text-gray-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="0"
                            />
                        </div>

                        <button 
                            type="button" 
                            onClick={handleIncrement} 
                            className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600 transition-all active:scale-90 shadow-sm"
                        >
                            <Plus size={32} strokeWidth={3} />
                        </button>
                    </div>

                    {/* Quick Selection Chips */}
                    <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
                        {quickOptions.map(opt => (
                            <button 
                                key={opt} 
                                onClick={() => onChange(nameToUse, opt)} 
                                className="px-5 py-2.5 bg-white border border-gray-100 shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-xl font-black text-sm text-gray-500 transition-all active:scale-95"
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParameterStep;