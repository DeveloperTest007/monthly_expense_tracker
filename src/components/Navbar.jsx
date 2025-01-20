import React from 'react';
import { MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  return (
    <div className="h-16 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/30">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-800/50 border border-slate-700/30 
                       text-slate-200 text-sm placeholder:text-slate-400 focus:outline-none 
                       focus:border-sky-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
            <BellIcon className="w-5 h-5 text-slate-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-400"></span>
          </button>
          <div className="w-[1px] h-6 bg-slate-700/30"></div>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800/50 transition-colors">
            <span className="text-sm font-medium text-slate-200">Help</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
