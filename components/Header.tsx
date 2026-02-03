
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="py-8 px-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center pixel-border animate-pulse">
            <span className="text-white text-2xl">👾</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 uppercase">
              PixelGen Studio
            </h1>
            <p className="text-xs text-slate-400 font-mono">8-BIT MULTIVERSE CONVERTER</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
            <span className="inline-flex px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold rounded-full border border-green-500/20 uppercase tracking-widest animate-pulse">
                System Online
            </span>
        </div>
      </div>
    </header>
  );
};
