/**
 * Studio Header & Navigation Bar
 */

import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Project } from '../types/index.js';
import {
  Layers,
  Cloud,
  LogOut,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Settings,
  Plus,
} from 'lucide-react';
import { ModelSelector } from './common/ModelSelector.js';

interface NavbarProps {
  currentProject: Project | null;
  onBackToDashboard: () => void;
  onOpenNewProjectModal: () => void;
  onOpenCloudflareModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProject,
  onBackToDashboard,
  onOpenNewProjectModal,
  onOpenCloudflareModal,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#090D16]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2.5 group focus:outline-none text-left"
            title="Torna alla Dashboard"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-black text-xs tracking-wider shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform">
              SL
            </div>
            <div>
              <div className="text-xs font-mono font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
                SIRACUSA LABS
                <span className="text-[10px] text-amber-400/90 font-mono font-normal">STUDIO</span>
              </div>
              <div className="text-[11px] text-slate-400">AI Landing Studio</div>
            </div>
          </button>

          {currentProject && (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-700/80 text-xs">
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              <button
                onClick={onBackToDashboard}
                className="text-slate-400 hover:text-white transition-colors"
              >
                Progetti
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-[320px]">
                {currentProject.brief.businessName}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase border ${
                currentProject.status === 'published'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : currentProject.status === 'ready'
                  ? 'bg-blue-950/60 border-blue-500/40 text-blue-300'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              }`}>
                {currentProject.status}
              </span>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Live Google Gemini Model Selector */}
          <ModelSelector compact />

          <button
            onClick={onOpenCloudflareModal}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Configurazione Cloudflare Pages"
          >
            <Cloud className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Cloudflare Pages</span>
          </button>

          <button
            onClick={onOpenNewProjectModal}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-xs font-semibold text-black flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Nuovo Progetto</span>
          </button>

          {/* User profile */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <div className="hidden md:block text-right">
              <div className="text-xs font-medium text-white">{user?.name || 'Mattia Lacanna'}</div>
              <div className="text-[10px] text-slate-400 font-mono">{user?.email}</div>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
              title="Esci dallo Studio"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
