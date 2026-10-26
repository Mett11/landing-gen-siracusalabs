/**
 * Editor Tab: Strategic Conversion Engine
 * Manages CRO document, ideal customer profile, objections, concepts selection, and approval.
 */

import React, { useState } from 'react';
import { Project, ConversionStrategy, StrategicConcept } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useModel } from '../../context/ModelContext.js';
import {
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface StrategyTabProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => Promise<void>;
  onProceedToCopy: () => void;
}

export const StrategyTab: React.FC<StrategyTabProps> = ({
  project,
  onUpdateProject,
  onProceedToCopy,
}) => {
  const { selectedModel, activeModel } = useModel();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strategy = project.strategy;

  const handleGenerateStrategy = async () => {
    setGenerating(true);
    setError(null);
    try {
      const newStrategy = await api.generateStrategy(project.brief, project.analysisReport, selectedModel);
      await onUpdateProject({
        strategy: newStrategy,
        status: 'strategic_review',
      });
    } catch (err: any) {
      setError(err.message || 'Generazione strategia fallita');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectConcept = async (conceptId: string) => {
    if (!strategy) return;
    const updatedConcepts = strategy.concepts.map((c) => ({
      ...c,
      selected: c.id === conceptId,
    }));
    const chosen = strategy.concepts.find((c) => c.id === conceptId);

    const updatedStrategy: ConversionStrategy = {
      ...strategy,
      concepts: updatedConcepts,
      selectedConceptId: conceptId,
      persuasiveAngle: chosen ? chosen.angle : strategy.persuasiveAngle,
    };

    await onUpdateProject({ strategy: updatedStrategy });
  };

  const handleToggleApproval = async () => {
    if (!strategy) return;
    const newApproval = !strategy.approved;
    const updatedStrategy: ConversionStrategy = {
      ...strategy,
      approved: newApproval,
      approvedAt: newApproval ? new Date().toISOString() : undefined,
    };

    await onUpdateProject({
      strategy: updatedStrategy,
      status: newApproval ? 'generating' : 'strategic_review',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Status */}
      <div className="p-6 rounded-3xl bg-[#0D121D] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase text-amber-400 flex items-center gap-2 mb-1">
            <Target className="w-4 h-4" />
            <span>Motore Strategico CRO</span>
          </div>
          <h3 className="text-base font-bold text-white">
            Strategia di Conversione & Architettura Narrativa
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Analisi del cliente ideale, angoli persuasivi, differenziatori dimostrabili e gestione obiezioni.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerateStrategy}
            disabled={generating}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
          >
            {generating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{strategy ? 'Rigenera con Gemini AI' : 'Genera Strategia AI'}</span>
          </button>

          {strategy && (
            <button
              onClick={handleToggleApproval}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                strategy.approved
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-500/20'
              }`}
            >
              {strategy.approved ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Strategia Approvata</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approva Strategia</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
          {error}
        </div>
      )}

      {/* Strategic Concepts Selection */}
      {strategy?.concepts && strategy.concepts.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Concept Strategici Proposti ({strategy.concepts.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategy.concepts.map((concept) => (
              <div
                key={concept.id}
                onClick={() => handleSelectConcept(concept.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  concept.selected
                    ? 'bg-[#111726] border-amber-400 shadow-xl shadow-amber-500/10'
                    : 'bg-[#0D121D] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-white">{concept.title}</h4>
                  {concept.selected && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400 text-black font-bold">
                      ATTIVO
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 mb-3">{concept.angle}</p>

                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="text-emerald-400 flex items-start gap-1">
                    <span className="font-bold">+</span>
                    <span>Pro: {concept.pros}</span>
                  </div>
                  <div className="text-slate-400 flex items-start gap-1">
                    <span className="font-bold">-</span>
                    <span>Contro: {concept.cons}</span>
                  </div>
                  {concept.recommendedFor && (
                    <div className="text-amber-300 pt-1">
                      Target: {concept.recommendedFor}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Structured Strategy Document */}
      {strategy ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ICP & Problem */}
          <div className="p-6 rounded-3xl bg-[#0D121D] border border-slate-800 space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Profilo del Cliente Ideale (ICP)
              </span>
              <p className="text-xs text-white leading-relaxed bg-[#080B12] p-3 rounded-xl border border-slate-800">
                {strategy.idealCustomerProfile}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-red-400 block mb-1">
                Problema Principale
              </span>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#080B12] p-3 rounded-xl border border-slate-800">
                {strategy.mainProblem}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-400 block mb-1">
                Risultato Desiderato
              </span>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#080B12] p-3 rounded-xl border border-slate-800">
                {strategy.desiredOutcome}
              </p>
            </div>
          </div>

          {/* Value Prop & Differentiators */}
          <div className="p-6 rounded-3xl bg-[#0D121D] border border-slate-800 space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-amber-400 block mb-1">
                Proposta di Valore (Value Proposition)
              </span>
              <p className="text-xs text-white font-semibold leading-relaxed bg-[#080B12] p-3 rounded-xl border border-slate-800">
                {strategy.valueProposition}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Differenziatori Dimostrabili
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {strategy.provableDifferentiators.map((diff, i) => (
                  <li key={i} className="bg-[#080B12] p-2 rounded-xl border border-slate-800 flex items-start gap-2">
                    <span className="text-amber-400 font-bold">&#10003;</span>
                    <span>{diff}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Objections Handlers */}
          <div className="md:col-span-2 p-6 rounded-3xl bg-[#0D121D] border border-slate-800 space-y-4">
            <span className="text-[11px] font-mono uppercase text-slate-400 block">
              Obiezioni Principali & Contro-Argomentazioni
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strategy.mainObjections.map((item, i) => (
                <div key={i} className="bg-[#080B12] p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-red-300">
                    &ldquo;{item.objection}&rdquo;
                  </div>
                  <div className="text-xs text-emerald-300 bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/20">
                    &rarr; {item.counterArgument}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Funnel Path & Narrative Structure */}
          <div className="md:col-span-2 p-6 rounded-3xl bg-[#0D121D] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-slate-400">
                Struttura Narrativa della Pagina ({strategy.narrativeStructure.length} sezioni)
              </span>
              {strategy.approved && (
                <button
                  onClick={onProceedToCopy}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Passa al Copywriting</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {strategy.narrativeStructure.map((sec, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-[#080B12] border border-slate-800">
                  <div className="text-[10px] font-mono text-amber-400 mb-1">
                    SEZIONE {i + 1} &bull; {sec.sectionKey.toUpperCase()}
                  </div>
                  <div className="text-xs font-bold text-white mb-1">{sec.title}</div>
                  <div className="text-[11px] text-slate-400">{sec.objective}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-[#0D121D] border border-slate-800">
          <p className="text-xs text-slate-400 mb-4">
            Nessuna strategia ancora formulata. Clicca sul pulsante sottostante per generare il piano strategico CRO.
          </p>
          <button
            onClick={handleGenerateStrategy}
            disabled={generating}
            className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Genera Strategia di Conversione</span>
          </button>
        </div>
      )}
    </div>
  );
};
