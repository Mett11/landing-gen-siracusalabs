/**
 * Editor Tab: Art Direction, Visual Systems & Motion Physics
 * Defines aesthetic archetype (12 curated anti-AI slop styles), color tokens,
 * Google Fonts pairings, and motion design tokens based on Disney/LottieFiles principles.
 */

import React, { useState, useEffect } from 'react';
import { Project, DesignPlan, AestheticArchetype } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useModel } from '../../context/ModelContext.js';
import {
  AESTHETIC_PRESETS,
  PRIMARY_ARCHETYPES_LIST,
  AestheticPreset,
} from '../../data/aestheticArchetypes.js';
import {
  Palette,
  Sparkles,
  RefreshCw,
  Type,
  Check,
  Eye,
  Activity,
  Zap,
  Sliders,
  Layers,
  ShieldCheck,
  Play,
  RotateCcw,
} from 'lucide-react';

interface DesignTabProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => Promise<void>;
  onProceedToPreview: () => void;
}

type ArchetypeFilter = 'all' | 'luxury_editorial' | 'craft_hospitality' | 'tech_precision' | 'brutalist_radical' | 'artistic_cultural';

export const DesignTab: React.FC<DesignTabProps> = ({
  project,
  onUpdateProject,
  onProceedToPreview,
}) => {
  const { selectedModel } = useModel();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<ArchetypeFilter>('all');
  const [btnTestPressed, setBtnTestPressed] = useState(false);

  const design = project.designPlan;

  // Dynamically load Google Fonts for the active archetype
  useEffect(() => {
    if (design?.typography?.googleFontsUrl) {
      const linkId = 'studio-active-google-fonts';
      let link = document.getElementById(linkId) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      link.href = design.typography.googleFontsUrl;
    }
  }, [design?.typography?.googleFontsUrl]);

  const handleGenerateDesign = async () => {
    setGenerating(true);
    setError(null);
    try {
      const newDesign = await api.generateDesignPlan(project.brief, project.strategy, selectedModel);
      const newAstroCode = await api.generateAstroCode({
        brief: project.brief,
        strategy: project.strategy,
        copywriting: project.copywriting,
        designPlan: newDesign,
      });

      await onUpdateProject({
        designPlan: newDesign,
        astroCode: newAstroCode,
      });
    } catch (err: any) {
      setError(err.message || 'Generazione design fallita');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectAesthetic = async (aestheticKey: AestheticArchetype) => {
    if (!design) return;
    const preset = AESTHETIC_PRESETS[aestheticKey];
    if (!preset) return;

    const newDesign: DesignPlan = {
      ...design,
      ...preset.designPlan,
    };

    // Compile new Astro project files reflecting this new aesthetic
    const newAstroCode = await api.generateAstroCode({
      brief: project.brief,
      strategy: project.strategy,
      copywriting: project.copywriting,
      designPlan: newDesign,
    });

    await onUpdateProject({
      designPlan: newDesign,
      astroCode: newAstroCode,
    });
  };

  const handleUpdateColor = async (colorKey: keyof DesignPlan['themeColors'], value: string) => {
    if (!design) return;
    const updatedTheme = { ...(design.themeColors || {}), [colorKey]: value };
    const updatedDesign: DesignPlan = {
      ...design,
      themeColors: updatedTheme,
      visualLayout: {
        heroLayout: design.visualLayout?.heroLayout || 'split_statement',
        containerWidth: design.visualLayout?.containerWidth || 'max-w-6xl',
        borderRadius: design.visualLayout?.borderRadius || 'rounded-2xl',
        verticalSpacing: design.visualLayout?.verticalSpacing || 'py-24',
        buttonStyle: design.visualLayout?.buttonStyle || 'geometric_sharp',
      },
    };

    const newAstroCode = await api.generateAstroCode({
      brief: project.brief,
      strategy: project.strategy,
      copywriting: project.copywriting,
      designPlan: updatedDesign,
    });

    await onUpdateProject({
      designPlan: updatedDesign,
      astroCode: newAstroCode,
    });
  };

  const currentPreset = (design?.aesthetic && AESTHETIC_PRESETS[design.aesthetic]) || AESTHETIC_PRESETS.editorial_luxury;
  const motion = design?.motionTokens || currentPreset.designPlan.motionTokens;

  const filteredPresets = PRIMARY_ARCHETYPES_LIST.filter((p) => {
    if (categoryFilter === 'all') return true;
    return p.category === categoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-[#0D121D] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase text-amber-400 flex items-center gap-2 mb-1">
            <Palette className="w-4 h-4" />
            <span>Direzione Artistica & Motion Systems • Anti-AI Slop</span>
          </div>
          <h3 className="text-base font-bold text-white">
            12 Archetipi Visivi Autentici & Fisica del Movimento
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Tipografia su misura Google Fonts, palette cromatiche ad alto contrasto e cinetica ispirata ai 12 Principi Disney.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateDesign}
            disabled={generating}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
          >
            {generating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Riprogetta con AI Studio</span>
          </button>

          <button
            onClick={onProceedToPreview}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Vedi Anteprima Live</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
          {error}
        </div>
      )}

      {/* Archetypes Selector */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Scegli Direzione Artistica ({filteredPresets.length} stili disponibili)
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Ogni archetipo adotta un'identità grafica autentica e bandisce i cliché visivi AI (no pillole statiche, no gradienti fucsia generici).
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#090C14] rounded-xl border border-slate-800 text-xs">
            {[
              { id: 'all', label: 'Tutti (12)' },
              { id: 'luxury_editorial', label: 'Luxury & Haute (3)' },
              { id: 'craft_hospitality', label: 'Craft & Food (2)' },
              { id: 'tech_precision', label: 'Tech & CLI (2)' },
              { id: 'brutalist_radical', label: 'Brutalist & Pop (2)' },
              { id: 'artistic_cultural', label: 'Wabi-Sabi & Heritage (3)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setCategoryFilter(f.id as ArchetypeFilter)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                  categoryFilter === f.id
                    ? 'bg-slate-800 text-amber-400 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 12 Archetypes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPresets.map((preset) => {
            const isSelected = design?.aesthetic === preset.id;
            const colors = preset.designPlan.themeColors;
            const typo = preset.designPlan.typography;
            const m = preset.designPlan.motionTokens;

            return (
              <div
                key={preset.id}
                onClick={() => handleSelectAesthetic(preset.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden group ${
                  isSelected
                    ? 'bg-[#111726] border-amber-400 shadow-xl shadow-amber-500/10 ring-1 ring-amber-400/30'
                    : 'bg-[#0D121D] border-slate-800 hover:border-slate-700 hover:bg-[#101524]'
                }`}
              >
                {/* Header row */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-0.5">
                        {preset.category.replace('_', ' ')}
                      </span>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                        <span>{preset.name}</span>
                      </h4>
                    </div>

                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-700 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    )}
                  </div>

                  <p className="text-xs text-amber-400/90 font-medium mb-1.5">{preset.subtitle}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{preset.brandWorld}</p>

                  {/* Typography Specimen */}
                  <div className="p-3 rounded-xl bg-[#07090E] border border-slate-800/80 mb-3 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-slate-500">Pairing Font Google</div>
                      <div className="text-xs font-semibold text-white">
                        {typo.headingFont} <span className="text-slate-500">+</span> {typo.bodyFont}
                      </div>
                    </div>
                    <div className="text-2xl font-serif text-slate-300 font-bold px-2">
                      Aa
                    </div>
                  </div>

                  {/* Color Palette Swatches */}
                  <div className="space-y-1.5 mb-3">
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      Palette Cromatica
                    </div>
                    <div className="flex items-center gap-2">
                      {[
                        { color: colors.background, title: `Background: ${colors.background}` },
                        { color: colors.card, title: `Card: ${colors.card}` },
                        { color: colors.primary, title: `Primary CTA: ${colors.primary}` },
                        { color: colors.accent, title: `Accent: ${colors.accent}` },
                        { color: colors.border, title: `Border: ${colors.border}` },
                      ].map((c, i) => (
                        <div
                          key={i}
                          title={c.title}
                          style={{ backgroundColor: c.color }}
                          className="w-5 h-5 rounded-md border border-white/20 shadow-sm"
                        />
                      ))}
                      <span className="text-[10px] font-mono text-slate-500 ml-auto">5 Tokens</span>
                    </div>
                  </div>
                </div>

                {/* Bottom tags: Motion & Anti-slop */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>{m?.personality?.toUpperCase() || 'PREMIUM'}</span>
                    </span>
                    <span className="text-slate-400">{m?.durationStandard || '400ms'}</span>
                  </div>

                  <div className="text-[10px] text-slate-400/90 leading-tight bg-[#07090E] p-2 rounded-lg border border-slate-800/60">
                    <span className="text-amber-400/90 font-semibold block mb-0.5">Anti-Slop Restraint:</span>
                    {preset.antiSlopDifferentiator}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motion Design System & Interactive Physics Inspector */}
      {motion && (
        <div className="p-6 rounded-3xl bg-[#0D121D] border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
            <div>
              <div className="text-xs font-mono uppercase text-amber-400 flex items-center gap-1.5 mb-1">
                <Activity className="w-4 h-4" />
                <span>Motion System Cinetico & Fisica delle Micro-Interazioni</span>
              </div>
              <h4 className="text-base font-bold text-white">
                Principi di Animazione: {currentPreset.name} ({motion.personality.toUpperCase()})
              </h4>
            </div>

            <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
              Regola 1/3 di Schermo & Stagger &lt; 500ms
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Layer 1: Emotional Intent & Timing */}
            <div className="p-4 rounded-2xl bg-[#080B12] border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                1. Emotional Intent & Curve
              </span>
              <div className="text-sm font-bold text-white capitalize">{motion.personality} Archetype</div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                Easing: <code className="text-amber-400">{motion.signatureEasing}</code>
              </p>
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Quick: {motion.durationQuick}</span>
                <span>Std: {motion.durationStandard}</span>
                <span>Slow: {motion.durationSlow}</span>
              </div>
            </div>

            {/* Layer 2: Ambient Motion & Layers */}
            <div className="p-4 rounded-2xl bg-[#080B12] border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                2. Livelli di Movimento
              </span>
              <div className="text-sm font-bold text-white capitalize">
                Ambient: {motion.ambientStyle.replace('_', ' ')}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tre livelli simultanei: Primario (azione CTA), Secondario (ombre e feedback), Ambientale (respiro luce 10-20% energia).
              </p>
              <div className="pt-1 text-[11px] font-mono text-emerald-400">
                Hover Card: {motion.cardHoverEffect.replace('_', ' ')}
              </div>
            </div>

            {/* Layer 3: Interactive Button Physics Playground */}
            <div className="p-4 rounded-2xl bg-[#080B12] border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  3. Test Micro-Interazione Pulsante
                </span>
                <p className="text-[11px] text-slate-400 mb-3">
                  Clicca o passa il mouse per testare la fisica di anticipazione e rilascio ({design?.visualLayout?.buttonStyle || 'geometric_sharp'}):
                </p>
              </div>

              <div className="flex items-center justify-center py-2">
                <button
                  type="button"
                  onMouseDown={() => setBtnTestPressed(true)}
                  onMouseUp={() => setBtnTestPressed(false)}
                  onMouseLeave={() => setBtnTestPressed(false)}
                  style={{
                    backgroundColor: design?.themeColors?.primary || '#D4AF37',
                    color: design?.themeColors?.primaryForeground || '#000000',
                    transition: `all ${motion.durationQuick} ${motion.signatureEasing}`,
                    transform: btnTestPressed ? 'scale(0.96)' : 'scale(1)',
                    boxShadow: btnTestPressed
                      ? 'none'
                      : `0 8px 20px -4px ${(design?.themeColors?.primary || '#D4AF37')}66`,
                    borderRadius:
                      design?.visualLayout?.buttonStyle === 'pill'
                        ? '9999px'
                        : design?.visualLayout?.buttonStyle === 'geometric_sharp'
                        ? '0px'
                        : '12px',
                  }}
                  className="px-5 py-2.5 font-bold text-xs flex items-center gap-2 cursor-pointer select-none active:brightness-90 hover:brightness-110"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{btnTestPressed ? 'Squash & Press (-4%)' : 'Hover & Anticipation'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Colors & Typography Cards */}
      {design && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Color Tokens Customizer */}
          <div className="p-6 rounded-3xl bg-[#0D121D] border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Palette Cromatica Personalizzata</span>
            </h4>

            <div className="space-y-3">
              {[
                { key: 'background', label: 'Background Primario' },
                { key: 'card', label: 'Superficie Card' },
                { key: 'primary', label: 'Colore Primario CTA' },
                { key: 'accent', label: 'Colore Accento / Evidenza' },
                { key: 'border', label: 'Bordi e Divisori' },
              ].map(({ key, label }) => {
                const currentColor = (design.themeColors as any)?.[key] || '#000000';
                return (
                  <div key={key} className="flex items-center justify-between bg-[#080B12] p-3 rounded-2xl border border-slate-800">
                    <span className="text-xs text-slate-300 font-mono">{label}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentColor}
                        onChange={(e) => handleUpdateColor(key as any, e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-slate-400">{currentColor}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Typography & Layout */}
          <div className="p-6 rounded-3xl bg-[#0D121D] border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Type className="w-4 h-4 text-amber-400" />
              <span>Composizione Tipografica & Layout</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div className="bg-[#080B12] p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-400">Font Heading</div>
                <div className="text-sm font-bold text-white font-serif">{design.typography?.headingFont || 'Playfair Display'}</div>
              </div>

              <div className="bg-[#080B12] p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-400">Font Body</div>
                <div className="text-sm font-semibold text-white">{design.typography?.bodyFont || 'Plus Jakarta Sans'}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#080B12] p-3.5 rounded-2xl border border-slate-800">
                  <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">Layout Hero</div>
                  <div className="text-xs font-mono text-amber-400 capitalize">
                    {(design.visualLayout?.heroLayout || 'split_statement').replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="bg-[#080B12] p-3.5 rounded-2xl border border-slate-800">
                  <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">Stile Pulsante</div>
                  <div className="text-xs font-mono text-emerald-400 capitalize">
                    {(design.visualLayout?.buttonStyle || 'geometric_sharp').replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
