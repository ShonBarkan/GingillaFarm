import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  
  const navLinks = [
    { name: 'בית החווה', path: '/' },
    { name: 'סייר אייקונים', path: '/icons' },
    { name: 'שתילת אייקון', path: '/add-icon' },
  ];

  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-black tracking-tighter text-xl group-hover:text-emerald-400 transition-colors text-white">
            GINGILLA <span className="text-emerald-500">ICONS</span>
          </span>
                    <span className="text-2xl">🚜</span>

        </Link>
        
        <div className="flex gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-bold uppercase tracking-widest transition-colors ${
                location.pathname === link.path ? 'text-emerald-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;