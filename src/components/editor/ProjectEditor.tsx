/**
 * Project Studio Editor Container
 * Orchestrates navigation across the 7 production stages, snapshots, and exports.
 */

import React, { useState } from 'react';
import { Project, ProjectVersion } from '../../types/index.js';
import { api } from '../../services/api.js';
import { AnalysisTab } from './AnalysisTab.js';
import { StrategyTab } from './StrategyTab.js';
import { CopywritingTab } from './CopywritingTab.js';
import { DesignTab } from './DesignTab.js';
import { PreviewTab } from './PreviewTab.js';
import { AuditTab } from './AuditTab.js';
import { CloudflareTab } from './CloudflareTab.js';
import {
  Search,
  Target,
  FileText,
  Palette,
  Eye,
  ShieldCheck,
  Cloud,
  Save,
  Download,
  History,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface ProjectEditorProps {
  project: Project;
  onUpdateProject: (updatedProject: Project) => void;
  onBackToDashboard: () => void;
  onOpenCloudflareModal: () => void;
  onExportZip: (projectId: string) => void;
}

export type EditorTabType =
  | 'analysis'
  | 'strategy'
  | 'copywriting'
  | 'design'
  | 'preview'
  | 'audit'
  | 'cloudflare';

export const ProjectEditor: React.FC<ProjectEditorProps> = ({
  project,
  onUpdateProject,
  onBackToDashboard,
  onOpenCloudflareModal,
  onExportZip,
}) => {
  const [activeTab, setActiveTab] = useState<EditorTabType>('strategy');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionDescription, setVersionDescription] = useState('');

  // Handle generic partial updates
  const handlePartialUpdate = async (updated: Partial<Project>) => {
    setSaving(true);
    try {
      const saved = await api.updateProject(project.id, updated);
      onUpdateProject(saved);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert(`Errore salvataggio: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSnapshot = async () => {
    try {
      const v = await api.createVersion(project.id, versionDescription || 'Salvataggio manuale');
      const refreshed = await api.getProject(project.id);
      onUpdateProject(refreshed);
      setShowVersionModal(false);
      setVersionDescription('');
      alert(`Snapshot versione #${v.versionNumber} salvato con successo.`);
    } catch (err: any) {
      alert(`Errore creazione versione: ${err.message}`);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (confirm('Sei sicuro di voler ripristinare questa versione precedente? I contenuti attuali verranno sovrascritti.')) {
      try {
        const restored = await api.restoreVersion(project.id, versionId);
        onUpdateProject(restored);
        alert('Versione ripristinata con successo.');
      } catch (err: any) {
        alert(`Errore ripristino: ${err.message}`);
      }
    }
  };

  const tabs: { id: EditorTabType; label: string; icon: any; countBadge?: string | number }[] = [
    { id: 'analysis', label: '1. Analisi', icon: Search },
    { id: 'strategy', label: '2. Strategia', icon: Target, countBadge: project.strategy?.approved ? 'OK' : undefined },
    { id: 'copywriting', label: '3. Copywriting', icon: FileText, countBadge: project.copywriting?.sections?.length },
    { id: 'design', label: '4. Design', icon: Palette },
    { id: 'preview', label: '5. Anteprima', icon: Eye },
    { id: 'audit', label: '6. SEO & Audit', icon: ShieldCheck, countBadge: `${project.auditResults?.score ?? 0}` },
    { id: 'cloudflare', label: '7. Pubblicazione', icon: Cloud, countBadge: project.cloudflare?.status === 'success' ? 'LIVE' : undefined },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* Sub-Header Bar */}
      <div className="p-6 rounded-3xl bg-[#0D121D] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={onBackToDashboard}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard Progetti</span>
            </button>
            <span className="text-slate-600">&bull;</span>
            <span className="text-xs font-mono uppercase text-amber-400">
              {project.brief.landingType === 'seller' ? 'Seller Landing' : 'Opt-in / Booking'}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">
            {project.brief.businessName}
          </h1>

          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Slug: <span className="text-slate-300">{project.brief.slug}</span> &bull; Settore: {project.brief.industry}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Versions Dropdown / Snapshot */}
          <div className="relative">
            <button
              onClick={() => setShowVersionModal(!showVersionModal)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Cronologia versioni salvate"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Versioni ({project.versions?.length || 0})</span>
            </button>

            {showVersionModal && (
              <div className="absolute right-0 mt-2 w-80 bg-[#080B12] border border-slate-700 rounded-2xl p-4 shadow-2xl z-50 text-xs">
                <div className="font-bold text-white mb-2 flex items-center justify-between">
                  <span>Versioni del Progetto</span>
                  <span className="text-[10px] text-slate-400 font-mono">Snapshot</span>
                </div>

                <div className="mb-3 space-y-2">
                  <input
                    type="text"
                    value={versionDescription}
                    onChange={(e) => setVersionDescription(e.target.value)}
                    placeholder="Descrizione snapshot..."
                    className="w-full bg-[#0D121D] border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                  <button
                    onClick={handleCreateSnapshot}
                    className="w-full py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded-lg text-xs"
                  >
                    Salva Nuovo Snapshot
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-slate-800/80">
                  {(project.versions || []).map((ver) => (
                    <div key={ver.versionId} className="pt-2 flex items-center justify-between">
                      <div>
                        <div className="font-mono text-white text-[11px] font-bold">
                          v{ver.versionNumber}: {ver.description}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(ver.createdAt).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRestoreVersion(ver.versionId)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-300 font-mono"
                      >
                        Ripristina
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onExportZip(project.id)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Scarica codice Astro standalone in archivio ZIP"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Esporta ZIP</span>
          </button>

          <button
            onClick={() => handlePartialUpdate({})}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {saveSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saveSuccess ? 'Salvato' : 'Salva Stato'}</span>
          </button>

          <button
            onClick={() => setActiveTab('cloudflare')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/15 hover:brightness-110 cursor-pointer"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Pubblica</span>
          </button>
        </div>
      </div>

      {/* Primary Stage Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-amber-400 text-black font-bold shadow-lg shadow-amber-500/15'
                  : 'bg-[#0D121D] text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.countBadge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-black text-amber-400 font-bold' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {tab.countBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'analysis' && (
          <AnalysisTab project={project} onUpdateProject={handlePartialUpdate} />
        )}

        {activeTab === 'strategy' && (
          <StrategyTab
            project={project}
            onUpdateProject={handlePartialUpdate}
            onProceedToCopy={() => setActiveTab('copywriting')}
          />
        )}

        {activeTab === 'copywriting' && (
          <CopywritingTab
            project={project}
            onUpdateProject={handlePartialUpdate}
            onProceedToDesign={() => setActiveTab('design')}
          />
        )}

        {activeTab === 'design' && (
          <DesignTab
            project={project}
            onUpdateProject={handlePartialUpdate}
            onProceedToPreview={() => setActiveTab('preview')}
          />
        )}

        {activeTab === 'preview' && (
          <PreviewTab project={project} onExportZip={onExportZip} />
        )}

        {activeTab === 'audit' && (
          <AuditTab
            project={project}
            onUpdateProject={handlePartialUpdate}
            onProceedToDeploy={() => setActiveTab('cloudflare')}
          />
        )}

        {activeTab === 'cloudflare' && (
          <CloudflareTab
            project={project}
            onUpdateProject={handlePartialUpdate}
            onOpenSettingsModal={onOpenCloudflareModal}
            onExportZip={onExportZip}
          />
        )}
      </div>
    </div>
  );
};
