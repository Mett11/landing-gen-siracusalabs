/**
 * Studio Main Dashboard
 * Displays project metrics, filters, and high-conversion landing project cards.
 */

import React, { useState } from 'react';
import { Project, LandingType, ProjectStatus } from '../types/index.js';
import {
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  Download,
  Trash2,
  ArrowRight,
  TrendingUp,
  Target,
  FileCheck,
  Cloud,
  Globe,
  SlidersHorizontal,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onNewProject: () => void;
  onDeleteProject: (projectId: string) => Promise<void>;
  onExportZip: (projectId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  onSelectProject,
  onNewProject,
  onDeleteProject,
  onExportZip,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | LandingType>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | ProjectStatus>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Compute metrics
  const totalCount = projects.length;
  const sellerCount = projects.filter((p) => p.brief.landingType === 'seller').length;
  const optinCount = projects.filter((p) => p.brief.landingType === 'optin').length;
  const publishedCount = projects.filter((p) => p.cloudflare?.status === 'success' || p.status === 'published').length;

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.brief.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brief.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brief.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || p.brief.landingType === selectedType;
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDeleteConfirm = async (id: string, name: string) => {
    if (confirm(`Confermi l'eliminazione definitiva del progetto "${name}"? Questa azione è irreversibile.`)) {
      setDeletingId(id);
      try {
        await onDeleteProject(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero Welcome & Metric Overview */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Siracusa Labs &bull; Produzione Digitale
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              AI Landing Studio
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Progetta landing page personalizzate ad alta conversione, genera codice Astro autonomo e pubblica su Cloudflare Pages con un click.
            </p>
          </div>

          <button
            onClick={onNewProject}
            className="self-start md:self-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-semibold text-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/15 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>Nuovo Progetto Landing</span>
          </button>
        </div>

        {/* Studio Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#0D121D] border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-mono">Totale Progetti</div>
              <div className="text-2xl font-bold text-white mt-0.5">{totalCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D121D] border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-mono">Seller Landing</div>
              <div className="text-2xl font-bold text-white mt-0.5">{sellerCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D121D] border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-mono">Opt-in / Booking</div>
              <div className="text-2xl font-bold text-white mt-0.5">{optinCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-purple-400">
              <Target className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D121D] border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-mono">Pubblicate Cloudflare</div>
              <div className="text-2xl font-bold text-emerald-400 mt-0.5">{publishedCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0D121D] border border-slate-800/80 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cerca per attività, settore o slug..."
            className="w-full bg-[#07090E] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <div className="flex items-center rounded-xl bg-[#07090E] p-1 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedType === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tutti ({totalCount})
            </button>
            <button
              onClick={() => setSelectedType('seller')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedType === 'seller' ? 'bg-blue-600/30 text-blue-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Seller ({sellerCount})
            </button>
            <button
              onClick={() => setSelectedType('optin')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedType === 'optin' ? 'bg-purple-600/30 text-purple-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Opt-in ({optinCount})
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="bg-[#07090E] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-400"
          >
            <option value="all">Tutti gli stati</option>
            <option value="draft">Bozza (draft)</option>
            <option value="ready">Pronta per deploy (ready)</option>
            <option value="published">Pubblicata su Pages</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0D121D] border border-slate-800/80">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-white">Nessun progetto trovato</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
              ? 'Nessun progetto corrisponde ai filtri impostati. Prova a reimpostare i criteri di ricerca.'
              : 'Non hai ancora creato progetti per landing page.'}
          </p>
          <button
            onClick={onNewProject}
            className="mt-6 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Crea Primo Progetto</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const isSeller = project.brief.landingType === 'seller';
            const isPublished = project.cloudflare?.status === 'success' || project.status === 'published';
            const auditScore = project.auditResults?.score ?? null;
            const aesthetic = project.designPlan?.aesthetic || project.brief.stylePreferences?.aesthetic || 'standard';

            return (
              <div
                key={project.id}
                className="group p-6 rounded-3xl bg-[#0D121D] hover:bg-[#111726] border border-slate-800/80 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between shadow-xl relative overflow-hidden"
              >
                {/* Top Badge Row */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`text-[11px] font-mono font-medium px-2.5 py-1 rounded-full uppercase border ${
                        isSeller
                          ? 'bg-blue-950/60 border-blue-500/30 text-blue-300'
                          : 'bg-purple-950/60 border-purple-500/30 text-purple-300'
                      }`}
                    >
                      {isSeller ? 'Seller Landing' : 'Opt-in / Booking'}
                    </span>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase border flex items-center gap-1.5 ${
                        isPublished
                          ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                          : project.status === 'ready'
                          ? 'bg-amber-950/60 border-amber-500/30 text-amber-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isPublished
                            ? 'bg-emerald-400'
                            : project.status === 'ready'
                            ? 'bg-amber-400'
                            : 'bg-slate-500'
                        }`}
                      ></span>
                      {isPublished ? 'Cloudflare Live' : project.status}
                    </span>
                  </div>

                  {/* Business Title & Industry */}
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                    {project.brief.businessName}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    {project.brief.industry} &bull; {project.brief.geographicArea || 'Italia'}
                  </p>

                  <div className="mt-3 p-3 rounded-xl bg-[#07090E] border border-slate-800/80 text-xs text-slate-300 line-clamp-2">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Offerta Chiave</span>
                    {project.brief.primaryOffer}
                  </div>

                  {/* Aesthetic and Audit indicators */}
                  <div className="flex items-center gap-2 mt-4 text-[11px] font-mono text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {(aesthetic || 'standard').replace(/_/g, ' ')}
                    </span>
                    {auditScore !== null && (
                      <span className={`px-2 py-0.5 rounded ${
                        auditScore >= 80
                          ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/20'
                          : auditScore >= 50
                          ? 'bg-amber-950/50 text-amber-300 border border-amber-500/20'
                          : 'bg-red-950/50 text-red-300 border border-red-500/20'
                      }`}>
                        Audit {auditScore}/100
                      </span>
                    )}
                  </div>

                  {/* Cloudflare live link if published */}
                  {project.cloudflare?.productionUrl && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px] font-mono">URL Cloudflare:</span>
                      <a
                        href={project.cloudflare.productionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono text-[11px] truncate max-w-[180px]"
                        title={project.cloudflare.productionUrl}
                      >
                        <span className="truncate">{project.cloudflare.productionUrl?.replace('https://', '') || ''}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onExportZip(project.id)}
                      className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Scarica pacchetto Astro autonomo (.ZIP)"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(project.id, project.brief.businessName)}
                      disabled={deletingId === project.id}
                      className="p-2 rounded-lg hover:bg-red-950/40 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Elimina progetto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectProject(project)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-amber-400 hover:text-black text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Apri Studio Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
