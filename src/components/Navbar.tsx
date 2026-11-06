import React from 'react';
import { ShieldCheck, ArrowRight, Server } from 'lucide-react';

interface NavbarProps {
  onEnterApp: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onEnterApp, onNavigateSection }) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-6 lg:px-12 py-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Brand wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/20">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
          FinPilot <span className="text-cyan-400">AI</span>
        </span>
        <div className="hidden sm:flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded text-[11px] font-mono font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-800/50">
          <Server className="w-3 h-3 text-cyan-400" />
          <span>Vultr VM</span>
        </div>
      </div>

      {/* Zone 2: 4-5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
        <button
          onClick={() => onNavigateSection('features')}
          className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer"
        >
          Core Engine
        </button>
        <button
          onClick={() => onNavigateSection('agents')}
          className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer"
        >
          Multi-Agent Fleet
        </button>
        <button
          onClick={() => onNavigateSection('reconciliation')}
          className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer"
        >
          Reconciliation
        </button>
        <button
          onClick={() => onNavigateSection('infrastructure')}
          className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer"
        >
          Vultr Architecture
        </button>
        <button
          onClick={() => onNavigateSection('security')}
          className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer"
        >
          Governance
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onEnterApp}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 rounded-lg shadow-sm shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>Launch FinPilot AI</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
