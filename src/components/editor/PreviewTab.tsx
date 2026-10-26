/**
 * Editor Tab: Interactive Sandbox Preview & Astro Code Inspector
 * Features responsive Desktop/Mobile preview, live theme token rendering, and source code viewer.
 */

import React, { useState, useEffect } from 'react';
import { Project, CopywritingSection } from '../../types/index.js';
import {
  Monitor,
  Smartphone,
  Code,
  Eye,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  FileCode,
} from 'lucide-react';

interface PreviewTabProps {
  project: Project;
  onExportZip: (projectId: string) => void;
}

export const PreviewTab: React.FC<PreviewTabProps> = ({
  project,
  onExportZip,
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [selectedFile, setSelectedFile] = useState<string>('src/pages/index.astro');
  const [copied, setCopied] = useState<boolean>(false);

  const theme = project.designPlan?.themeColors || {
    background: '#0B0F19',
    foreground: '#F3F4F6',
    card: '#111827',
    cardForeground: '#FFFFFF',
    primary: '#3B82F6',
    primaryForeground: '#FFFFFF',
    accent: '#60A5FA',
    muted: '#9CA3AF',
    border: '#1F2937',
  };

  const typography = project.designPlan?.typography || {
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
  };

  const btnStyle = project.designPlan?.visualLayout?.buttonStyle || 'geometric_sharp';
  const cardStyle = project.designPlan?.cardStyle || 'bordered';

  // Dynamically inject Google Fonts for the active archetype in preview
  useEffect(() => {
    if (project.designPlan?.typography?.googleFontsUrl) {
      const linkId = 'studio-preview-google-fonts';
      let link = document.getElementById(linkId) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      link.href = project.designPlan.typography.googleFontsUrl;
    }
  }, [project.designPlan?.typography?.googleFontsUrl]);

  const getBtnStyles = (isSecondary = false): React.CSSProperties => {
    if (isSecondary) {
      return {
        border: `1px solid ${theme.border}`,
        color: theme.foreground,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: btnStyle === 'pill' ? '9999px' : btnStyle === 'geometric_sharp' || btnStyle === 'hard_shadow' ? '0px' : '12px',
        fontFamily: `'${typography.bodyFont}', sans-serif`,
        transition: 'all 0.2s ease',
      };
    }
    if (btnStyle === 'hard_shadow') {
      return {
        backgroundColor: theme.primary,
        color: theme.primaryForeground,
        borderRadius: '0px',
        border: `2px solid ${theme.foreground}`,
        boxShadow: `4px 4px 0px ${theme.accent}`,
        fontFamily: `'${typography.headingFont}', serif`,
        fontWeight: 800,
        textTransform: 'uppercase',
        transition: 'all 0.15s ease',
      };
    }
    if (btnStyle === 'kintsugi_gold') {
      return {
        background: `linear-gradient(135deg, ${theme.primary} 0%, #F5E5A4 50%, ${theme.primary} 100%)`,
        color: '#0A0A0A',
        borderRadius: '10px',
        boxShadow: `0 4px 20px ${theme.primary}40`,
        fontFamily: `'${typography.headingFont}', serif`,
        fontWeight: 700,
        transition: 'all 0.25s ease',
      };
    }
    if (btnStyle === 'terminal_cli') {
      return {
        backgroundColor: '#030708',
        color: theme.primary,
        borderRadius: '4px',
        border: `1px solid ${theme.primary}`,
        boxShadow: `0 0 15px ${theme.primary}40`,
        fontFamily: `'${typography.headingFont}', monospace`,
        fontWeight: 700,
        textTransform: 'uppercase',
        transition: 'all 0.1s ease',
      };
    }
    return {
      backgroundColor: theme.primary,
      color: theme.primaryForeground,
      borderRadius: btnStyle === 'pill' ? '9999px' : btnStyle === 'geometric_sharp' ? '0px' : '14px',
      boxShadow: `0 8px 20px -4px ${theme.primary}50`,
      fontFamily: `'${typography.bodyFont}', sans-serif`,
      textTransform: btnStyle === 'geometric_sharp' ? 'uppercase' : 'none',
      letterSpacing: btnStyle === 'geometric_sharp' ? '0.08em' : 'normal',
      fontWeight: 600,
      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    };
  };

  const getCardStyles = (): React.CSSProperties => {
    if (cardStyle === 'raw_brutalist') {
      return {
        backgroundColor: theme.card,
        borderColor: theme.border,
        color: theme.cardForeground,
        borderRadius: '0px',
        borderWidth: '2px',
        boxShadow: `4px 4px 0px ${theme.accent}40`,
      };
    }
    if (cardStyle === 'glassmorphism') {
      return {
        backgroundColor: 'rgba(12, 21, 36, 0.7)',
        backdropFilter: 'blur(16px)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        color: theme.cardForeground,
      };
    }
    if (cardStyle === 'terminal_box') {
      return {
        backgroundColor: theme.card,
        color: theme.cardForeground,
        borderRadius: '4px',
        borderColor: `${theme.primary}40`,
      };
    }
    if (cardStyle === 'velvet_glow') {
      return {
        backgroundColor: theme.card,
        borderColor: theme.border,
        color: theme.cardForeground,
        borderRadius: '20px',
        boxShadow: '0 15px 35px -10px rgba(190, 18, 60, 0.2)',
      };
    }
    return {
      backgroundColor: theme.card,
      borderColor: theme.border,
      color: theme.cardForeground,
      borderRadius: '20px',
    };
  };

  const sections: CopywritingSection[] = project.copywriting?.sections || [
    {
      id: 'hero',
      type: 'hero',
      headline: project.brief.primaryOffer || 'Soluzioni di eccellenza per la tua attività',
      subheadline: 'Affidati a specialisti verificati per raggiungere i tuoi obiettivi commerciali con metodo e trasparenza.',
      ctaText: project.brief.primaryCtaLabel || 'Richiedi Consulenza',
    },
  ];

  const astroCode = project.astroCode;

  // Compile file list for code viewer
  const fileMap: Record<string, string> = {};
  if (astroCode) {
    fileMap['src/pages/index.astro'] = astroCode.indexAstro;
    fileMap['src/layouts/Layout.astro'] = astroCode.layoutAstro;
    fileMap['src/styles/global.css'] = astroCode.globalCss;
    fileMap['astro.config.mjs'] = astroCode.astroConfig;
    fileMap['package.json'] = astroCode.packageJson;
    fileMap['public/robots.txt'] = astroCode.robotsTxt;
    fileMap['public/sitemap.xml'] = astroCode.sitemapXml;
    for (const [name, content] of Object.entries(astroCode.components)) {
      fileMap[`src/components/${name}`] = content;
    }
  }

  const handleCopyCode = () => {
    const code = fileMap[selectedFile] || '';
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Viewport and ViewMode Switcher */}
      <div className="p-4 rounded-2xl bg-[#0D121D] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Visual vs Code Mode */}
        <div className="flex items-center rounded-xl bg-[#07090E] p-1 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setViewMode('visual')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'visual' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Anteprima Visiva</span>
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'code' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Codice Astro ({Object.keys(fileMap).length} file)</span>
          </button>
        </div>

        {/* Viewport Controls (Desktop vs Mobile) */}
        {viewMode === 'visual' && (
          <div className="flex items-center rounded-xl bg-[#07090E] p-1 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setViewport('desktop')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewport === 'desktop' ? 'bg-amber-400 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop (1440px)</span>
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewport === 'mobile' ? 'bg-amber-400 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile (390px)</span>
            </button>
          </div>
        )}

        <button
          onClick={() => onExportZip(project.id)}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Esporta Progetto Astro (.ZIP)</span>
        </button>
      </div>

      {/* Render Area */}
      {viewMode === 'visual' ? (
        <div className="flex justify-center bg-[#05070B] p-4 md:p-8 rounded-3xl border border-slate-800/80 min-h-[600px] overflow-hidden">
          <div
            style={{
              width: viewport === 'mobile' ? '390px' : '100%',
              maxWidth: viewport === 'mobile' ? '390px' : '100%',
              backgroundColor: theme.background,
              color: theme.foreground,
              borderColor: theme.border,
            }}
            className={`transition-all duration-300 rounded-3xl overflow-hidden border shadow-2xl flex flex-col`}
          >
            {/* Device Status Bar in Mobile */}
            {viewport === 'mobile' && (
              <div className="bg-black/60 px-6 py-2 text-[10px] font-mono text-slate-400 flex items-center justify-between border-b border-white/5">
                <span>09:41</span>
                <span className="flex items-center gap-1">5G &bull; 100%</span>
              </div>
            )}

            {/* Simulated Astro Landing Page Content */}
            <div className="flex-1 overflow-y-auto">
              {sections.map((section, idx) => {
                const isHero = section.type === 'hero';
                const isProblem = section.type === 'problem_agitation';
                const isSolution = section.type === 'solution_value';
                const isOffer = section.type === 'offer_pricing';
                const isOptin = section.type === 'optin_form';
                const isFaq = section.type === 'faq';
                const isFinal = section.type === 'final_cta';

                if (isHero) {
                  const hasHeroImg = Boolean(section.heroImage);
                  return (
                    <header
                      key={section.id}
                      style={{ borderColor: theme.border }}
                      className="px-6 py-12 md:py-20 border-b relative overflow-hidden"
                    >
                      <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-between pb-8 mb-8 border-b border-white/10">
                          <span className="font-bold text-lg tracking-tight font-serif" style={{ color: theme.cardForeground }}>
                            {project.brief.businessName}
                          </span>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            {project.brief.geographicArea || 'Siracusa, Sicilia'}
                          </span>
                        </div>

                        <div className={`grid grid-cols-1 ${hasHeroImg ? 'md:grid-cols-12 gap-8 items-center' : ''}`}>
                          <div className={hasHeroImg ? 'md:col-span-7' : 'max-w-2xl'}>
                            {section.badge && (
                              <div
                                style={{
                                  backgroundColor: theme.card,
                                  borderColor: theme.border,
                                  color: theme.accent,
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider mb-4 border"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                {section.badge}
                              </div>
                            )}

                            <h1
                              style={{
                                color: theme.cardForeground,
                                fontFamily: `'${typography.headingFont}', serif`,
                              }}
                              className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-4"
                            >
                              {section.headline}
                            </h1>

                            <p
                              style={{ fontFamily: `'${typography.bodyFont}', sans-serif` }}
                              className="text-sm md:text-base text-slate-400 leading-relaxed mb-8 max-w-xl"
                            >
                              {section.subheadline}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                              <a
                                href={project.brief.primaryCtaDestination || '#'}
                                style={getBtnStyles(false)}
                                className="px-6 py-3.5 text-xs text-center inline-flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                              >
                                <span>{section.ctaText || project.brief.primaryCtaLabel}</span>
                              </a>
                              {section.ctaSecondaryText && (
                                <a
                                  href="#menu"
                                  style={getBtnStyles(true)}
                                  className="px-6 py-3.5 text-xs text-center inline-flex items-center justify-center"
                                >
                                  {section.ctaSecondaryText}
                                </a>
                              )}
                            </div>

                            {section.guaranteeText && (
                              <p className="mt-4 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                                <span className="text-emerald-400 font-bold">&#10003;</span>
                                {section.guaranteeText}
                              </p>
                            )}
                          </div>

                          {hasHeroImg && (
                            <div className="md:col-span-5">
                              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                                <img
                                  src={section.heroImage}
                                  alt={project.brief.businessName}
                                  className="w-full h-72 md:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-5">
                                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300">
                                    {project.brief.geographicArea || 'Ortigia, Siracusa'}
                                  </span>
                                  <span className="text-xs text-white font-serif font-bold mt-0.5">
                                    {project.brief.serviceToPromote}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </header>
                  );
                }

                if (isProblem) {
                  return (
                    <section
                      key={section.id}
                      style={{ borderColor: theme.border }}
                      className="px-6 py-12 md:py-16 border-b"
                    >
                      <div className="max-w-4xl mx-auto">
                        <span className="text-[10px] font-mono uppercase text-red-400 tracking-wider">
                          {section.eyebrow || 'L’OSTACOLO'}
                        </span>
                        <h2 style={{ color: theme.cardForeground }} className="text-2xl md:text-3xl font-bold mt-1 mb-3">
                          {section.headline}
                        </h2>
                        <p className="text-xs text-slate-400 mb-6">{section.subheadline}</p>

                        <div className="space-y-3">
                          {(section.bulletPoints || []).map((pt, i) => (
                            <div
                              key={i}
                              style={{ backgroundColor: theme.card, borderColor: theme.border }}
                              className="p-4 rounded-2xl border flex items-start gap-3"
                            >
                              <span className="w-6 h-6 rounded-full bg-red-500/10 text-red-400 font-mono text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                                0{i + 1}
                              </span>
                              <p className="text-xs text-slate-200 pt-0.5">{pt}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  );
                }

                if (isSolution) {
                  return (
                    <section
                      key={section.id}
                      style={{ borderColor: theme.border }}
                      className="px-6 py-12 md:py-16 border-b"
                    >
                      <div className="max-w-4xl mx-auto">
                        <span style={{ color: theme.accent }} className="text-[10px] font-mono uppercase tracking-wider">
                          {section.eyebrow || 'LA DIFFERENZA'}
                        </span>
                        <h2 style={{ color: theme.cardForeground }} className="text-2xl md:text-3xl font-bold mt-1 mb-3">
                          {section.headline}
                        </h2>
                        <p className="text-xs text-slate-400 mb-6">{section.subheadline}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {(section.bulletPoints || []).map((pt, i) => (
                            <div
                              key={i}
                              style={{ backgroundColor: theme.card, borderColor: theme.border }}
                              className="p-5 rounded-2xl border flex flex-col justify-between"
                            >
                              <div
                                style={{ color: theme.accent }}
                                className="w-8 h-8 rounded-lg bg-white/5 font-mono text-xs flex items-center justify-center font-bold mb-3"
                              >
                                {i + 1}
                              </div>
                              <p className="text-xs text-slate-200 leading-relaxed">{pt}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  );
                }

                if (isOptin) {
                  return (
                    <section
                      key={section.id}
                      style={{ borderColor: theme.border }}
                      className="px-6 py-12 md:py-16 border-b"
                    >
                      <div className="max-w-xl mx-auto">
                        <div className="text-center mb-6">
                          <span style={{ color: theme.accent }} className="text-[10px] font-mono uppercase tracking-wider">
                            CANDIDATURA DIRETTA
                          </span>
                          <h2 style={{ color: theme.cardForeground }} className="text-2xl font-bold mt-1">
                            {section.headline}
                          </h2>
                          <p className="text-xs text-slate-400 mt-2">{section.subheadline}</p>
                        </div>

                        <div
                          style={{ backgroundColor: theme.card, borderColor: theme.border }}
                          className="p-6 rounded-2xl border space-y-4"
                        >
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                              Nome Completo *
                            </label>
                            <input
                              type="text"
                              disabled
                              placeholder="Mario Rossi"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                              Recapito Telefonico / WhatsApp *
                            </label>
                            <input
                              type="tel"
                              disabled
                              placeholder="+39 340 0000000"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>

                          <button
                            type="button"
                            style={{
                              backgroundColor: theme.primary,
                              color: theme.primaryForeground,
                            }}
                            className="w-full py-3 rounded-xl font-bold text-xs uppercase"
                          >
                            {section.ctaText || 'Invia Richiesta di Prenotazione'}
                          </button>
                        </div>
                      </div>
                    </section>
                  );
                }

                if (isFaq) {
                  return (
                    <section
                      key={section.id}
                      style={{ borderColor: theme.border }}
                      className="px-6 py-12 md:py-16 border-b"
                    >
                      <div className="max-w-3xl mx-auto">
                        <h2 style={{ color: theme.cardForeground }} className="text-xl md:text-2xl font-bold mb-6 text-center">
                          {section.headline}
                        </h2>

                        <div className="space-y-3">
                          {(section.faqItems || []).map((faq, i) => (
                            <div
                              key={i}
                              style={{ backgroundColor: theme.card, borderColor: theme.border }}
                              className="p-4 rounded-xl border text-xs"
                            >
                              <div className="font-bold text-white mb-2">{faq.question}</div>
                              <p className="text-slate-400 leading-relaxed">{faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  );
                }

                if (section.type === 'menu_showcase') {
                  return (
                    <section
                      key={section.id}
                      id="menu"
                      style={{ borderColor: theme.border }}
                      className="px-6 py-12 md:py-16 border-b"
                    >
                      <div className="max-w-5xl mx-auto">
                        <div className="text-center max-w-xl mx-auto mb-10">
                          <span style={{ color: theme.accent }} className="text-[10px] font-mono uppercase tracking-wider">
                            {section.eyebrow || 'PROPOSTA GASTRONOMICA'}
                          </span>
                          <h2 style={{ color: theme.cardForeground }} className="text-2xl md:text-3xl font-bold mt-1 mb-2 font-serif">
                            {section.headline}
                          </h2>
                          <p className="text-xs text-slate-400">{section.subheadline}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {(section.menuItems || []).map((item, i) => (
                            <div
                              key={i}
                              style={{ backgroundColor: theme.card, borderColor: theme.border }}
                              className="rounded-2xl border overflow-hidden flex flex-col justify-between shadow-lg"
                            >
                              {item.imageUrl && (
                                <div className="h-40 relative overflow-hidden">
                                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                  {item.dietaryTag && (
                                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-black/80 text-amber-300 font-bold border border-amber-500/30">
                                      {item.dietaryTag}
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-baseline justify-between gap-2 mb-1">
                                    <h3 style={{ color: theme.cardForeground }} className="text-sm font-bold">
                                      {item.name}
                                    </h3>
                                    <span style={{ color: theme.accent }} className="text-sm font-mono font-bold">
                                      {item.price}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                                    {item.description}
                                  </p>
                                </div>
                                {item.provenance && (
                                  <div className="pt-2 border-t border-white/5 text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                    <span style={{ color: theme.accent }}>&#9670;</span>
                                    {item.provenance}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  );
                }

                if (section.type === 'experience_story') {
                  return (
                    <section
                      key={section.id}
                      style={{ borderColor: theme.border }}
                      className="px-6 py-12 md:py-16 border-b"
                    >
                      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                        <div className="md:col-span-7 space-y-4">
                          <span style={{ color: theme.accent }} className="text-[10px] font-mono uppercase tracking-wider">
                            {section.eyebrow || 'FILOSOFIA & TERRITORIO'}
                          </span>
                          <h2 style={{ color: theme.cardForeground }} className="text-2xl md:text-3xl font-bold font-serif leading-tight">
                            {section.headline}
                          </h2>
                          <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                            {section.subheadline}
                          </p>

                          {section.quote && (
                            <blockquote style={{ borderColor: theme.accent }} className="p-4 rounded-xl bg-white/5 border-l-4 text-xs italic text-slate-200">
                              "{section.quote}"
                              {section.quoteAuthor && (
                                <footer className="mt-1 text-[10px] font-mono not-italic text-slate-400">
                                  — {typeof section.quoteAuthor === 'string' ? section.quoteAuthor : section.quoteAuthor.name}
                                </footer>
                              )}
                            </blockquote>
                          )}

                          <div className="space-y-2 pt-2">
                            {(section.bulletPoints || []).map((pt, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                                <span style={{ color: theme.accent }} className="font-bold">&#10003;</span>
                                <span>{pt}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="md:col-span-5">
                          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl relative">
                            <img
                              src={section.heroImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'}
                              alt="Esperienza"
                              className="w-full h-64 md:h-80 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                              <span className="text-[10px] font-mono text-amber-300 uppercase">Ortigia • Tradizione Culinaria</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                }

                if (section.type === 'reservation_widget') {
                  return (
                    <section
                      key={section.id}
                      id="prenota"
                      style={{ borderColor: theme.border }}
                      className="px-6 py-12 md:py-16 border-b"
                    >
                      <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-8">
                          <span style={{ color: theme.accent }} className="text-[10px] font-mono uppercase tracking-wider">
                            {section.eyebrow || 'RISERVA IL TUO TAVOLO'}
                          </span>
                          <h2 style={{ color: theme.cardForeground }} className="text-2xl font-bold font-serif mt-1">
                            {section.headline}
                          </h2>
                          <p className="text-xs text-slate-400 mt-1">{section.subheadline}</p>
                        </div>

                        <div
                          style={getCardStyles()}
                          className="p-6 md:p-8 space-y-4 shadow-xl"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Nome e Cognome *</label>
                              <input type="text" placeholder="Elena Conti" disabled className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Telefono / WhatsApp *</label>
                              <input type="tel" placeholder="+39 340 0000000" disabled className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Data</label>
                              <input type="date" disabled className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-xs text-white" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Orario</label>
                              <select disabled className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-xs text-white">
                                <option>20:15</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Ospiti</label>
                              <select disabled className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-xs text-white">
                                <option>2 persone</option>
                              </select>
                            </div>
                          </div>

                          <button
                            type="button"
                            style={getBtnStyles(false)}
                            className="w-full py-3.5 text-xs text-center inline-flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                          >
                            <span>{section.ctaText || 'Richiedi Prenotazione Tavolo'}</span>
                          </button>

                          {section.reservationConfig?.cancellationPolicy && (
                            <p className="text-center text-[10px] text-slate-400 font-mono">
                              {section.reservationConfig.cancellationPolicy}
                            </p>
                          )}
                        </div>
                      </div>
                    </section>
                  );
                }

                if (section.type === 'atmosphere_gallery') {
                  return (
                    <section
                      key={section.id}
                      style={{ borderColor: theme.border }}
                      className="px-6 py-12 md:py-16 border-b"
                    >
                      <div className="max-w-5xl mx-auto">
                        <div className="text-center max-w-xl mx-auto mb-8">
                          <span style={{ color: theme.accent }} className="text-[10px] font-mono uppercase tracking-wider">
                            {section.eyebrow || 'ATMOSFERA'}
                          </span>
                          <h2 style={{ color: theme.cardForeground }} className="text-2xl font-bold font-serif mt-1">
                            {section.headline}
                          </h2>
                          <p className="text-xs text-slate-400 mt-1">{section.subheadline}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {(section.mediaImages || []).map((imgUrl, i) => (
                            <div key={i} className="rounded-xl overflow-hidden border border-white/10 h-48 group relative">
                              <img src={imgUrl} alt="Atmosfera" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  );
                }

                if (isFinal) {
                  return (
                    <section
                      key={section.id}
                      style={{ borderColor: theme.border }}
                      className="px-6 py-16 border-b text-center"
                    >
                      <div className="max-w-2xl mx-auto">
                        <h2
                          style={{
                            color: theme.cardForeground,
                            fontFamily: `'${typography.headingFont}', serif`,
                          }}
                          className="text-2xl md:text-3xl font-bold mb-3"
                        >
                          {section.headline}
                        </h2>
                        <p
                          style={{ fontFamily: `'${typography.bodyFont}', sans-serif` }}
                          className="text-xs text-slate-400 mb-6"
                        >
                          {section.subheadline}
                        </p>
                        <a
                          href={project.brief.primaryCtaDestination || '#'}
                          style={getBtnStyles(false)}
                          className="inline-flex px-8 py-3.5 text-xs text-center justify-center items-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                        >
                          <span>{section.ctaText || 'Contattaci'}</span>
                        </a>
                      </div>
                    </section>
                  );
                }

                return null;
              })}

              {/* Footer */}
              <footer style={{ borderColor: theme.border }} className="px-6 py-8 border-t text-center text-[11px] text-slate-500">
                &copy; {new Date().getFullYear()} {project.brief.businessName}. Powered by Siracusa Labs Landing Studio.
              </footer>
            </div>
          </div>
        </div>
      ) : (
        /* Code Viewer Mode */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#0A0E17] p-4 rounded-3xl border border-slate-800">
          {/* File selector sidebar */}
          <div className="md:col-span-4 space-y-1 overflow-y-auto max-h-[600px] pr-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 block px-2 mb-2">
              File Sorgente Astro
            </span>
            {Object.keys(fileMap).map((fileName) => {
              const isSelected = selectedFile === fileName;
              return (
                <button
                  key={fileName}
                  onClick={() => setSelectedFile(fileName)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-black font-bold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{fileName}</span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer Editor */}
          <div className="md:col-span-8 flex flex-col bg-[#05070B] rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-4 py-2.5 bg-[#0D121D] border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">{selectedFile}</span>
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copiato!' : 'Copia File'}</span>
              </button>
            </div>

            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto flex-1 max-h-[550px] leading-relaxed">
              <code>{fileMap[selectedFile] || '// Nessun contenuto'}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
