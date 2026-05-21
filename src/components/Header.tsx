import React, { useState, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-md p-2.5 rounded-xl border border-white/30 text-white shadow-xl">
            <BarChart2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter drop-shadow-sm">OMR <span className="text-fuchsia-200">AI VISION</span></h1>
            <p className="text-xs text-white/80 font-medium tracking-wide">Penyemak Digital Mesra Guru 🇲🇾</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-inner">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse"></span>
          <span className="text-[10px] sm:text-xs font-bold tracking-widest text-white/90">AI VISION (PERLU INTERNET)</span>
        </div>
      </div>
    </header>
  );
}
