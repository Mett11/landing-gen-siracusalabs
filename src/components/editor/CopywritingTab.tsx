/**
 * Editor Tab: Section-by-Section Copywriting Studio
 * Allows granular editing, regeneration of single sections, and strict avoidance of AI clichés.
 */

import React, { useState } from 'react';
import { Project, CopywritingPlan, CopywritingSection } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useModel } from '../../context/ModelContext.js';
import {
  FileText,
  Sparkles,
  RefreshCw,
  Edit3,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CopywritingTabProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => Promise<void>;
  onProceedToDesign: () => void;
}

export const CopywritingTab: React.FC<CopywritingTabProps> = ({
  project,
  onUpdateProject,
  onProceedToDesign,
}) => {
  const { selectedModel } = useModel();
  const [generating, setGenerating] = useState(false);
  const [regeneratingSectionId, setRegeneratingSectionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>('hero');

  const copy = project.copywriting;

  const handleGenerateAll = async () => {
    if (!project.strategy) {
      alert('È necessario definire prima la strategia nella scheda precedente.');
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const newCopy = await api.generateCopywriting(project.brief, project.strategy, undefined, selectedModel);
      await onUpdateProject({
        copywriting: newCopy,
        status: 'in_review',
      });
    } catch (err: any) {
      setError(err.message || 'Generazione copy fallita');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateSingleSection = async (section: CopywritingSection) => {
    if (!project.strategy) return;
    setRegeneratingSectionId(section.id);
    try {
      const refreshedPlan = await api.generateCopywriting(project.brief, project.strategy, section.type, selectedModel);
      const replacement = refreshedPlan.sections.find((s) => s.type === section.type) || refreshedPlan.sections[0];

      if (replacement && copy) {
        const updatedSections = copy.sections.map((s) =>
          s.id === section.id ? { ...replacement, id: section.id } : s
        );
        await onUpdateProject({
          copywriting: {
            ...copy,
            sections: updatedSections,
            lastEditedAt: new Date().toISOString(),
          },
        });
      }
    } catch (err: any) {
      alert(`Errore rigenerazione sezione: ${err.message}`);
    } finally {
      setRegeneratingSectionId(null);
    }
  };

  const handleUpdateSectionField = async (sectionId: string, field: string, value: any) => {
    if (!copy) return;
    const updatedSections = copy.sections.map((s) => {
      if (s.id === sectionId) {
        return { ...s, [field]: value };
      }
      return s;
    });

    await onUpdateProject({
      copywriting: {
        ...copy,
        sections: updatedSections,
        lastEditedAt: new Date().toISOString(),
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="p-6 rounded-3xl bg-[#0D121D] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase text-amber-400 flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4" />
            <span>Copywriting Diretto & Persuasivo</span>
          </div>
          <h3 className="text-base font-bold text-white">
            Contenuti ad Alta Specificità (Nessun Cliché AI)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Testi orientati alla credibilità e al beneficio per il cliente. Modificabili blocco per blocco.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateAll}
            disabled={generating}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
          >
            {generating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{copy ? 'Rigenera Tutti i Contenuti' : 'Genera Contenuti con AI'}</span>
          </button>

          {copy && (
            <button
              onClick={onProceedToDesign}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all cursor-pointer"
            >
              Passa alla Direzione Artistica
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
          {error}
        </div>
      )}

      {/* Sections Accordion / Cards */}
      {copy && copy.sections.length > 0 ? (
        <div className="space-y-4">
          {copy.sections.map((section, idx) => {
            const isExpanded = expandedSectionId === section.id;
            const isRegeneratingThis = regeneratingSectionId === section.id;

            return (
              <div
                key={section.id}
                className="rounded-3xl bg-[#0D121D] border border-slate-800 overflow-hidden transition-all"
              >
                {/* Section Header Accordion Bar */}
                <div
                  onClick={() => setExpandedSectionId(isExpanded ? null : section.id)}
                  className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 font-mono text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                        {section.type.toUpperCase()}
                      </span>
                      <h4 className="text-sm font-bold text-white line-clamp-1">
                        {section.headline || `Sezione ${section.type}`}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleRegenerateSingleSection(section)}
                      disabled={isRegeneratingThis}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Rigenera solo questa sezione con AI"
                    >
                      {isRegeneratingThis ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 text-amber-400" />
                      )}
                      <span>Rigenera Sezione</span>
                    </button>

                    <button
                      onClick={() => setExpandedSectionId(isExpanded ? null : section.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Section Form (when expanded) */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-800/80 space-y-4 bg-[#0A0E17]/60">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.eyebrow !== undefined && (
                        <div>
                          <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                            Eyebrow / Sopratitolo
                          </label>
                          <input
                            type="text"
                            value={section.eyebrow || ''}
                            onChange={(e) => handleUpdateSectionField(section.id, 'eyebrow', e.target.value)}
                            className="w-full bg-[#07090E] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      )}

                      {section.badge !== undefined && (
                        <div>
                          <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                            Badge / Pill Di Fiducia
                          </label>
                          <input
                            type="text"
                            value={section.badge || ''}
                            onChange={(e) => handleUpdateSectionField(section.id, 'badge', e.target.value)}
                            className="w-full bg-[#07090E] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                        Headline / Titolo Principale
                      </label>
                      <textarea
                        rows={2}
                        value={section.headline}
                        onChange={(e) => handleUpdateSectionField(section.id, 'headline', e.target.value)}
                        className="w-full bg-[#07090E] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {section.subheadline !== undefined && (
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                          Sottotitolo / Descrizione
                        </label>
                        <textarea
                          rows={2}
                          value={section.subheadline || ''}
                          onChange={(e) => handleUpdateSectionField(section.id, 'subheadline', e.target.value)}
                          className="w-full bg-[#07090E] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    )}

                    {/* Image URL if available */}
                    {section.heroImage !== undefined && (
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                          URL Immagine Principale (Fotografia ad alta risoluzione)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={section.heroImage || ''}
                            onChange={(e) => handleUpdateSectionField(section.id, 'heroImage', e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="flex-1 bg-[#07090E] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                          />
                          {section.heroImage && (
                            <img src={section.heroImage} alt="Preview" className="w-9 h-9 rounded-lg object-cover border border-slate-700" />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quote & Author if present */}
                    {section.quote !== undefined && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                            Citazione / Visione
                          </label>
                          <input
                            type="text"
                            value={section.quote || ''}
                            onChange={(e) => handleUpdateSectionField(section.id, 'quote', e.target.value)}
                            className="w-full bg-[#07090E] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                            Autore Citazione (es. Chef Patron)
                          </label>
                          <input
                            type="text"
                            value={typeof section.quoteAuthor === 'string' ? section.quoteAuthor : section.quoteAuthor?.name || ''}
                            onChange={(e) => handleUpdateSectionField(section.id, 'quoteAuthor', e.target.value)}
                            className="w-full bg-[#07090E] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    )}

                    {/* Menu Items (for food & hospitality) */}
                    {section.menuItems && section.menuItems.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <label className="block text-[11px] font-mono uppercase text-amber-400 font-bold">
                          Piatti Signature / Proposta Gastronomica ({section.menuItems.length} portate)
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                          {section.menuItems.map((item, mIdx) => (
                            <div key={mIdx} className="p-3 rounded-xl bg-[#07090E] border border-slate-800 space-y-2">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  value={item.name}
                                  placeholder="Nome Piatto"
                                  onChange={(e) => {
                                    const updated = [...section.menuItems!];
                                    updated[mIdx] = { ...item, name: e.target.value };
                                    handleUpdateSectionField(section.id, 'menuItems', updated);
                                  }}
                                  className="sm:col-span-2 bg-[#0B0F19] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold"
                                />
                                <input
                                  type="text"
                                  value={item.price}
                                  placeholder="Prezzo (es. €22)"
                                  onChange={(e) => {
                                    const updated = [...section.menuItems!];
                                    updated[mIdx] = { ...item, price: e.target.value };
                                    handleUpdateSectionField(section.id, 'menuItems', updated);
                                  }}
                                  className="bg-[#0B0F19] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-mono"
                                />
                              </div>
                              <input
                                type="text"
                                value={item.description}
                                placeholder="Descrizione ingredienti e preparazione"
                                onChange={(e) => {
                                  const updated = [...section.menuItems!];
                                  updated[mIdx] = { ...item, description: e.target.value };
                                  handleUpdateSectionField(section.id, 'menuItems', updated);
                                }}
                                className="w-full bg-[#0B0F19] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bullet Points */}
                    {section.bulletPoints && (
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                          Punti Chiave / Elenco Benefici (uno per riga)
                        </label>
                        <textarea
                          rows={3}
                          value={section.bulletPoints.join('\n')}
                          onChange={(e) =>
                            handleUpdateSectionField(
                              section.id,
                              'bulletPoints',
                              e.target.value.split('\n').filter((l) => l.trim().length > 0)
                            )
                          }
                          className="w-full bg-[#07090E] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    )}

                    {/* CTA text */}
                    {section.ctaText !== undefined && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                            Testo Pulsante CTA
                          </label>
                          <input
                            type="text"
                            value={section.ctaText}
                            onChange={(e) => handleUpdateSectionField(section.id, 'ctaText', e.target.value)}
                            className="w-full bg-[#07090E] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        {section.guaranteeText !== undefined && (
                          <div>
                            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                              Micro-copy Garanzia / Riprova
                            </label>
                            <input
                              type="text"
                              value={section.guaranteeText || ''}
                              onChange={(e) => handleUpdateSectionField(section.id, 'guaranteeText', e.target.value)}
                              className="w-full bg-[#07090E] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-[#0D121D] border border-slate-800">
          <p className="text-xs text-slate-400 mb-4">
            Nessun testo generato al momento. Clicca sul pulsante sottostante per redigere i contenuti della landing page.
          </p>
          <button
            onClick={handleGenerateAll}
            disabled={generating}
            className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Genera Copywriting Completo</span>
          </button>
        </div>
      )}
    </div>
  );
};
