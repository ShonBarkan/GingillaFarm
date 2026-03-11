import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const Layout = ({ children }) => {
    const { dir, lang, setLang, serverStatus } = useContext(AppContext);

    return (
        <div className={`min-h-screen bg-gray-50 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
            <nav className="bg-white shadow-sm border-b px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-orange-600">🥕 Gingilla Farm</h1>
                    <span className="text-gray-400">|</span>
                    <span className="text-sm font-medium text-gray-600 uppercase tracking-widest">
                        CarrotTracker
                    </span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                            serverStatus === 'online' ? 'bg-green-500 animate-pulse' : 
                            serverStatus === 'offline' ? 'bg-red-500' : 'bg-gray-300'
                        }`}></div>
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                            {serverStatus}
                        </span>
                    </div>
                    <button 
                        onClick={() => setLang(lang === 'en' ? 'he' : 'en')}
                        className="text-sm font-bold hover:text-orange-600 transition-colors uppercase"
                    >
                        {lang === 'en' ? 'עברית' : 'English'}
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-8">
                {children}
            </main>

            <footer className="text-center py-8 text-gray-400 text-xs uppercase tracking-widest">
                Gingilla Farm &copy; 2026 - Small Paws, Big Stack
            </footer>
        </div>
    );
};
export default Layout;
