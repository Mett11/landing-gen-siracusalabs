/**
 * Editor Tab: Cloudflare Pages Deployment & Custom Domain
 * Manages dedicated Cloudflare Pages project, direct deploy, DNS instructions, and deploy history.
 */

import React, { useState } from 'react';
import { Project, CloudflareDeployInfo } from '../../types/index.js';
import { api } from '../../services/api.js';
import {
  Cloud,
  Rocket,
  Globe,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Download,
  History,
  Shield,
  Layers,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';

interface CloudflareTabProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => Promise<void>;
  onOpenSettingsModal: () => void;
  onExportZip: (projectId: string) => void;
}

export const CloudflareTab: React.FC<CloudflareTabProps> = ({
  project,
  onUpdateProject,
  onOpenSettingsModal,
  onExportZip,
}) => {
  const [deploying, setDeploying] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [customDomainInput, setCustomDomainInput] = useState(project.cloudflare?.customDomain || '');
  const [copiedTarget, setCopiedTarget] = useState(false);

  const cloudflare = project.cloudflare;
  const isDeployBlocked = project.auditResults && !project.auditResults.passed;

  const handleDeploy = async () => {
    if (isDeployBlocked) {
      alert('Il deploy è bloccato da problemi critici nell’audit. Risolvili nella scheda SEO & Audit prima di procedere.');
      return;
    }

    if (!confirm(`Confermi il deploy della landing "${project.brief.businessName}" su Cloudflare Pages (progetto: ${cloudflare.projectName})?`)) {
      return;
    }

    setDeploying(true);
    setDeployError(null);
    try {
      const res = await api.deployToCloudflare({
        projectId: project.id,
        customDomain: customDomainInput.trim() || undefined,
        overrideProjectName: cloudflare.projectName,
      });

      if (!res.success && res.error) {
        setDeployError(res.error);
      }

      await onUpdateProject({
        cloudflare: res.project,
        status: res.success ? 'published' : 'error',
      });
    } catch (err: any) {
      setDeployError(err.message || 'Errore durante la pubblicazione su Cloudflare');
    } finally {
      setDeploying(false);
    }
  };

  const copyCname = () => {
    navigator.clipboard.writeText(`${cloudflare.projectName}.pages.dev`);
    setCopiedTarget(true);
    setTimeout(() => setCopiedTarget(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Deploy Status Hero */}
      <div className="p-6 rounded-3xl bg-[#0D121D] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase text-amber-400 flex items-center gap-2 mb-1">
            <Cloud className="w-4 h-4" />
            <span>Cloudflare Pages &bull; Progetto Dedicato</span>
          </div>
          <h3 className="text-base font-bold text-white">
            Pubblicazione & Gestione Domini
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ogni landing possiede un progetto Pages indipendente con SSL gratuito, rete globale Anycast e anteprime illimitate.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenSettingsModal}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Configura Credenziali API
          </button>

          <button
            onClick={handleDeploy}
            disabled={deploying || isDeployBlocked}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:brightness-110 text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-40 cursor-pointer"
          >
            {deploying ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Rocket className="w-4 h-4" />
            )}
            <span>{deploying ? 'Deploy in corso...' : 'Pubblica su Cloudflare Pages'}</span>
          </button>
        </div>
      </div>

      {isDeployBlocked && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>
            Deploy temporaneamente bloccato: sono presenti controlli bloccanti non superati nella scheda <strong>SEO & Audit</strong>. Correggi i testi o i dati prima di pubblicare.
          </span>
        </div>
      )}

      {deployError && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
          <strong className="block font-semibold mb-1">Dettaglio Errore Cloudflare:</strong>
          {deployError}
        </div>
      )}

      {/* Production & Project Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Details */}
        <div className="p-6 rounded-3xl bg-[#0D121D] border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            <span>Coordinate del Progetto Pages</span>
          </h4>

          <div className="space-y-3 text-xs">
            <div className="bg-[#080B12] p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
              <span className="font-mono text-slate-400">Nome Progetto Pages</span>
              <span className="font-mono font-bold text-white">{cloudflare.projectName}</span>
            </div>

            <div className="bg-[#080B12] p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
              <span className="font-mono text-slate-400">URL Predefinito</span>
              <span className="font-mono text-amber-400">https://{cloudflare.projectName}.pages.dev</span>
            </div>

            {cloudflare.productionUrl && (
              <div className="bg-emerald-950/30 p-3 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                <span className="font-mono text-emerald-300">Stato Pubblicazione</span>
                <a
                  href={cloudflare.productionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-bold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Online su Cloudflare</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Custom Domain Settings */}
        <div className="p-6 rounded-3xl bg-[#0D121D] border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Collegamento Dominio / Sottodominio</span>
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                Dominio o Sottodominio Personalizzato (opzionale)
              </label>
              <input
                type="text"
                value={customDomainInput}
                onChange={(e) => setCustomDomainInput(e.target.value)}
                placeholder="es. promo.azienda.it o www.nuovosito.it"
                className="w-full bg-[#080B12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-[#080B12] border border-slate-800 text-[11px] space-y-1.5">
              <div className="text-slate-300 font-semibold">Istruzioni Configurazione DNS:</div>
              <p className="text-slate-400">
                Aggiungi un record DNS di tipo <strong className="text-white">CNAME</strong> presso il tuo registrar di dominio:
              </p>
              <div className="bg-black/60 p-2.5 rounded-xl font-mono text-[11px] flex items-center justify-between text-amber-300 border border-white/5">
                <span>Target CNAME: {cloudflare.projectName}.pages.dev</span>
                <button
                  onClick={copyCname}
                  className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                  title="Copia target CNAME"
                >
                  {copiedTarget ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment History Table */}
      <div className="p-6 rounded-3xl bg-[#0D121D] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <span>Cronologia Versioni Distribuite</span>
          </h4>
          <button
            onClick={() => onExportZip(project.id)}
            className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-mono"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Scarica Archivio ZIP Standalone</span>
          </button>
        </div>

        {cloudflare.history && cloudflare.history.length > 0 ? (
          <div className="divide-y divide-slate-800 rounded-2xl border border-slate-800 overflow-hidden bg-[#080B12]">
            {cloudflare.history.map((dep, idx) => (
              <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        dep.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'
                      }`}
                    ></span>
                    <span className="font-mono text-white font-semibold">{dep.deploymentId}</span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="text-slate-400 font-mono">
                      {new Date(dep.timestamp).toLocaleString('it-IT')}
                    </span>
                  </div>
                  <p className="text-slate-400">{dep.commitMessage}</p>
                </div>

                {dep.url && (
                  <a
                    href={dep.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start sm:self-auto text-amber-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                  >
                    <span>{dep.url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-[#080B12] border border-slate-800 text-xs text-slate-400">
            Nessun deployment registrato per questo progetto. Clicca &quot;Pubblica su Cloudflare Pages&quot; per effettuare il primo deploy.
          </div>
        )}
      </div>
    </div>
  );
};
