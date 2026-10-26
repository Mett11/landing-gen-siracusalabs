/**
 * Editor Tab: SEO, Security & Quality Audit System
 * Categorizes issues into blocking, warnings, and passed checks to enforce conversion excellence.
 */

import React, { useState } from 'react';
import { Project, QualityAuditReport, AuditCheck } from '../../types/index.js';
import { api } from '../../services/api.js';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Info,
  ArrowRight,
  Lock,
} from 'lucide-react';

interface AuditTabProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => Promise<void>;
  onProceedToDeploy: () => void;
}

export const AuditTab: React.FC<AuditTabProps> = ({
  project,
  onUpdateProject,
  onProceedToDeploy,
}) => {
  const [running, setRunning] = useState(false);

  const report = project.auditResults;

  const handleRunAudit = async () => {
    setRunning(true);
    try {
      const newReport = await api.runAudit({
        brief: project.brief,
        copywriting: project.copywriting,
        designPlan: project.designPlan,
        astroCode: project.astroCode,
      });

      await onUpdateProject({
        auditResults: newReport,
      });
    } catch (err: any) {
      alert(`Errore esecuzione audit: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const blockingChecks = report?.checks.filter((c) => c.severity === 'blocking' && c.status === 'fail') || [];
  const warningChecks = report?.checks.filter((c) => c.severity === 'warning' && c.status === 'warn') || [];
  const passedChecks = report?.checks.filter((c) => c.status === 'pass') || [];

  return (
    <div className="space-y-6">
      {/* Score Header */}
      <div className="p-6 rounded-3xl bg-[#0D121D] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-bold text-lg border ${
              (report?.score ?? 0) >= 80
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                : (report?.score ?? 0) >= 50
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-400'
                : 'bg-red-950/40 border-red-500/40 text-red-400'
            }`}
          >
            <span>{report?.score ?? 0}</span>
            <span className="text-[9px] uppercase font-sans font-normal text-slate-400">Punti</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Audit Tecnico, SEO & CRO</h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase border ${
                  report?.passed
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/60 border-red-500/40 text-red-300'
                }`}
              >
                {report?.passed ? 'Deploy Autorizzato' : 'Deploy Bloccato'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {report?.passed
                ? 'Nessun problema bloccante riscontrato. Il codice rispetta gli standard di produzione.'
                : 'Sono presenti errori bloccanti. Risolvili per abilitare la pubblicazione su Cloudflare Pages.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunAudit}
            disabled={running}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
            <span>Riesegui Controlli</span>
          </button>

          {report?.passed && (
            <button
              onClick={onProceedToDeploy}
              className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Procedi a Pubblicazione</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Summary Counts Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0D121D] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">Errori Bloccanti</div>
            <div className="text-xl font-bold text-red-400">{blockingChecks.length}</div>
          </div>
          <ShieldAlert className="w-6 h-6 text-red-400" />
        </div>

        <div className="p-4 rounded-2xl bg-[#0D121D] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">Avvisi di Qualità</div>
            <div className="text-xl font-bold text-amber-400">{warningChecks.length}</div>
          </div>
          <AlertTriangle className="w-6 h-6 text-amber-400" />
        </div>

        <div className="p-4 rounded-2xl bg-[#0D121D] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">Controlli Superati</div>
            <div className="text-xl font-bold text-emerald-400">{passedChecks.length}</div>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        </div>
      </div>

      {/* Detailed Checks List */}
      <div className="space-y-4">
        {/* Blocking Checks */}
        {blockingChecks.length > 0 && (
          <div className="p-6 rounded-3xl bg-red-950/20 border border-red-500/30 space-y-3">
            <h4 className="text-xs font-mono uppercase font-bold text-red-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Problemi Bloccanti ({blockingChecks.length}) &mdash; Deploy Non Consentito</span>
            </h4>
            <div className="space-y-2">
              {blockingChecks.map((check) => (
                <div key={check.id} className="p-4 rounded-2xl bg-[#080B12] border border-red-500/30 text-xs">
                  <div className="font-bold text-white mb-1">{check.name}</div>
                  <p className="text-red-300 mb-2">{check.message}</p>
                  {check.recommendation && (
                    <div className="text-[11px] text-slate-400 bg-black/40 p-2 rounded-lg font-mono">
                      &rarr; Azione richiesta: {check.recommendation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {warningChecks.length > 0 && (
          <div className="p-6 rounded-3xl bg-amber-950/20 border border-amber-500/30 space-y-3">
            <h4 className="text-xs font-mono uppercase font-bold text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Avvisi Importanti ({warningChecks.length})</span>
            </h4>
            <div className="space-y-2">
              {warningChecks.map((check) => (
                <div key={check.id} className="p-4 rounded-2xl bg-[#080B12] border border-amber-500/30 text-xs">
                  <div className="font-bold text-white mb-1">{check.name}</div>
                  <p className="text-amber-300 mb-2">{check.message}</p>
                  {check.recommendation && (
                    <div className="text-[11px] text-slate-400 bg-black/40 p-2 rounded-lg font-mono">
                      &rarr; Suggerimento: {check.recommendation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Passed Checks */}
        {passedChecks.length > 0 && (
          <div className="p-6 rounded-3xl bg-[#0D121D] border border-slate-800 space-y-3">
            <h4 className="text-xs font-mono uppercase font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Controlli Superati ({passedChecks.length})</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {passedChecks.map((check) => (
                <div key={check.id} className="p-3 rounded-xl bg-[#080B12] border border-slate-800 flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">&#10003;</span>
                  <div>
                    <div className="font-semibold text-white">{check.name}</div>
                    <div className="text-[11px] text-slate-400">{check.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
