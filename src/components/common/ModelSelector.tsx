/**
 * Google Gemini Live Model Selector
 * Fetches and displays available Google Gemini models with token limits, recommendations,
 * and allows instant switching for CRO generation, copywriting, and art direction.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useModel } from '../../context/ModelContext.js';
import { Sparkles, ChevronDown, Check, RefreshCw, Cpu, Zap, BrainCircuit, ExternalLink } from 'lucide-react';

interface ModelSelectorProps {
  compact?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ compact = false }) => {
  const { models, selectedModel, setSelectedModel, activeModel, isLoading, refreshModels } = useModel();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (modelId: string) => {
    setSelectedModel(modelId);
    setIsOpen(false);
  };

  const getModelBadge = (id: string) => {
    if (id.includes('2.5-flash')) return { label: 'Flash 2.5 • Rapido & Preciso', color: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40' };
    if (id.includes('2.5-pro')) return { label: 'Pro 2.5 • Massima Creatività', color: 'bg-purple-950/70 text-purple-300 border-purple-500/40' };
    if (id.includes('pro')) return { label: 'Deep Reasoning', color: 'bg-indigo-950/70 text-indigo-300 border-indigo-500/40' };
    if (id.includes('lite')) return { label: 'Ultra-Light', color: 'bg-blue-950/70 text-blue-300 border-blue-500/40' };
    return { label: 'Gemini', color: 'bg-slate-800 text-slate-300 border-slate-700' };
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl transition-all cursor-pointer ${
          compact
            ? 'px-2.5 py-1.5 bg-[#0D121D] hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-200'
            : 'px-4 py-2 bg-[#0D121D] hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 shadow-sm'
        }`}
        title="Seleziona il modello LLM Google Gemini per la generazione"
      >
        <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500/20 to-amber-300/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <Sparkles className="w-3 h-3 animate-pulse" />
        </div>

        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-white">
            <span>{activeModel?.displayName?.split('(')[0]?.trim() || selectedModel}</span>
            {activeModel?.isRecommended && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            )}
          </div>
          {!compact && (
            <span className="text-[9px] text-slate-400 font-mono">Google Generative AI</span>
          )}
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#090D16] border border-slate-700/90 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-[#0D121D] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Modelli Google Gemini
                </div>
                <div className="text-[10px] text-slate-400">
                  {models.length > 0 ? `${models.length} modelli attivi da API` : 'Caricamento modelli...'}
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                refreshModels();
              }}
              disabled={isLoading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Ricarica lista modelli da Google API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>

          {/* List of Models */}
          <div className="p-2 space-y-1.5 max-h-[380px] overflow-y-auto">
            {models.map((model) => {
              const isSelected = model.id === selectedModel;
              const badge = getModelBadge(model.id);

              return (
                <button
                  key={model.id}
                  onClick={() => handleSelect(model.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-sm'
                      : 'bg-[#0B0F19] hover:bg-slate-850 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-amber-400 bg-amber-400 text-black' : 'border-slate-600'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-xs font-semibold truncate ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                        {model.displayName.split('(')[0]?.trim() || model.id}
                      </span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border flex-shrink-0 ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mb-2">
                      {model.description}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                      <span>ID: <code className="text-slate-400">{model.id}</code></span>
                      {model.inputTokenLimit && (
                        <span>• Finestra: {Math.round(model.inputTokenLimit / 1000)}k token</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer notice */}
          <div className="p-3 bg-[#07090E] border-t border-slate-800/80 text-[10px] text-slate-400 font-mono flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400" />
              API: <code>https://generativelanguage.googleapis.com</code>
            </span>
            <span className="text-emerald-400 font-semibold">Live Google SDK</span>
          </div>
        </div>
      )}
    </div>
  );
};
