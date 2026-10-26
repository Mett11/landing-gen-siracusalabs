/**
 * Editor Tab: Site Analysis & Research
 * Displays verified facts, observations, hypotheses, missing info, and improvement opportunities.
 */

import React, { useState } from 'react';
import { Project, SiteAnalysisReport } from '../../types/index.js';
import { api } from '../../services/api.js';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileQuestion,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface AnalysisTabProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => Promise<void>;
}

export const AnalysisTab: React.FC<AnalysisTabProps> = ({
  project,
  onUpdateProject,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [urlInput, setUrlInput] = useState(project.brief.websiteUrl || '');
  const [error, setError] = useState<string | null>(null);

  const report = project.analysisReport;

  const handleRunAnalysis = async () => {
    if (!urlInput.trim()) return;
    setAnalyzing(true);
    setError(null);
    try {
      const newReport = await api.analyzeWebsite(urlInput.trim());
      await onUpdateProject({
        brief: {
          ...project.brief,
          websiteUrl: urlInput.trim(),
        },
        analysisReport: newReport,
      });
    } catch (err: any) {
      setError(err.message || 'Analisi fallita');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Target URL Card */}
      <div className="p-6 rounded-3xl bg-[#0D121D] border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-400" />
              <span>Analisi Sito Web & Funnel di Acquisizione</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Crawler sicuro protetto contro attacchi SSRF (blocco indirizzi privati, timeout 8s, max 1.5MB).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> SSRF Hardened
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://www.dominio-attivita.it"
            className="flex-1 bg-[#080B12] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
          />
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing || !urlInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer"
          >
            {analyzing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span>{analyzing ? 'Analisi in corso...' : 'Avvia Scansione Sicura'}</span>
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {report ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fatti Verificati */}
          <div className="p-6 rounded-3xl bg-[#0D121D] border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Fatti Verificati sul Sito</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {report.verifiedFacts.map((fact, i) => (
                <li key={i} className="flex items-start gap-2 bg-[#080B12] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 font-bold">&bull;</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Osservazioni */}
          <div className="p-6 rounded-3xl bg-[#0D121D] border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-blue-400 font-mono text-xs uppercase font-bold">
              <Search className="w-4 h-4" />
              <span>Osservazioni Tecniche & Funnel</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {report.observations.map((obs, i) => (
                <li key={i} className="flex items-start gap-2 bg-[#080B12] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-blue-400 font-bold">&bull;</span>
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ipotesi & Opportunità */}
          <div className="p-6 rounded-3xl bg-[#0D121D] border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase font-bold">
              <Lightbulb className="w-4 h-4" />
              <span>Opportunità di Miglioramento CRO</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {report.improvementOpportunities.map((opp, i) => (
                <li key={i} className="flex items-start gap-2 bg-[#080B12] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-amber-400 font-bold">&bull;</span>
                  <span>{opp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Informazioni Mancanti */}
          <div className="p-6 rounded-3xl bg-[#0D121D] border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase font-bold">
              <FileQuestion className="w-4 h-4" />
              <span>Informazioni Mancanti da Integrare</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {report.missingInformation.map((info, i) => (
                <li key={i} className="flex items-start gap-2 bg-[#080B12] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-purple-400 font-bold">&bull;</span>
                  <span>{info}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-[#0D121D] border border-slate-800 text-xs text-slate-400">
          Nessuna scansione effettuata finora. Inserisci l'URL del sito esistente e clicca "Avvia Scansione Sicura", oppure procedi direttamente con la definizione strategica.
        </div>
      )}
    </div>
  );
};
