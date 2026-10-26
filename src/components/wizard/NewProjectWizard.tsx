/**
 * Progressive Project Creation Wizard
 * Gathers business data, runs safe SSRF website analysis, and configures conversion goals.
 */

import React, { useState } from 'react';
import { BusinessBrief, LandingType, SiteAnalysisReport, AestheticArchetype } from '../../types/index.js';
import { PRIMARY_ARCHETYPES_LIST } from '../../data/aestheticArchetypes.js';
import { api } from '../../services/api.js';
import {
  X,
  Sparkles,
  Globe,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Search,
  Check,
  Building,
  Target,
  FileText,
  Palette,
} from 'lucide-react';

interface NewProjectWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (brief: BusinessBrief, siteReport?: SiteAnalysisReport) => Promise<void>;
}

export const NewProjectWizard: React.FC<NewProjectWizardProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzingSite, setAnalyzingSite] = useState<boolean>(false);
  const [crawlerError, setCrawlerError] = useState<string | null>(null);
  const [siteReport, setSiteReport] = useState<SiteAnalysisReport | null>(null);

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [socialUrls, setSocialUrls] = useState('');
  const [industry, setIndustry] = useState('');
  const [serviceToPromote, setServiceToPromote] = useState('');
  const [landingType, setLandingType] = useState<LandingType>('seller');
  const [businessGoal, setBusinessGoal] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [geographicArea, setGeographicArea] = useState('');
  const [primaryOffer, setPrimaryOffer] = useState('');
  const [realBenefitsText, setRealBenefitsText] = useState('');
  const [primaryCtaLabel, setPrimaryCtaLabel] = useState('Richiedi Consulenza');
  const [primaryCtaType, setPrimaryCtaType] = useState<'whatsapp' | 'phone' | 'form' | 'calendar' | 'checkout'>('whatsapp');
  const [primaryCtaDestination, setPrimaryCtaDestination] = useState('https://wa.me/393400000000');
  const [contactMethod, setContactMethod] = useState<'whatsapp' | 'phone' | 'form' | 'calendar' | 'email'>('whatsapp');
  
  // Materials
  const [logoAvailable, setLogoAvailable] = useState(true);
  const [hasRealPhotos, setHasRealPhotos] = useState(true);
  const [hasVerifiedTestimonials, setHasVerifiedTestimonials] = useState(false);
  const [reviewsCount, setReviewsCount] = useState<number>(12);
  const [customNotes, setCustomNotes] = useState('');

  // Style
  const [aesthetic, setAesthetic] = useState<AestheticArchetype>('editorial_luxury');
  const [tone, setTone] = useState<'autorevole' | 'diretto' | 'esclusivo' | 'caldo_umano' | 'scientifico'>('autorevole');
  const [desiredSubdomain, setDesiredSubdomain] = useState('');

  if (!isOpen) return null;

  // Handle live site analysis
  const handleAnalyzeSite = async () => {
    if (!websiteUrl || !websiteUrl.trim()) return;
    setAnalyzingSite(true);
    setCrawlerError(null);
    try {
      const report = await api.analyzeWebsite(websiteUrl.trim());
      setSiteReport(report);
      // Auto-populate detected fields if empty
      if (!industry && report.detectedHeadings.length > 0) {
        setIndustry(report.detectedHeadings[0].slice(0, 40));
      }
      if (!serviceToPromote && report.extractedTitle) {
        setServiceToPromote(report.extractedTitle.split('|')[0].trim());
      }
      if (!primaryOffer && report.extractedMetaDescription) {
        setPrimaryOffer(report.extractedMetaDescription.slice(0, 100));
      }
    } catch (err: any) {
      setCrawlerError(err.message || 'Analisi del sito non riuscita');
    } finally {
      setAnalyzingSite(false);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const slug = (desiredSubdomain || businessName)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const benefits = realBenefitsText
        ? realBenefitsText.split('\n').map((s) => s.trim()).filter(Boolean)
        : ['Esperienza pluriennale verificata', 'Assistenza diretta senza intermediari'];

      const brief: BusinessBrief = {
        businessName: businessName.trim(),
        slug,
        industry: industry.trim(),
        websiteUrl: websiteUrl.trim() || undefined,
        socialUrls: socialUrls ? socialUrls.split(',').map((s) => s.trim()) : undefined,
        serviceToPromote: serviceToPromote.trim(),
        landingType,
        businessGoal: businessGoal.trim() || (landingType === 'seller' ? 'Vendita diretta e preventivi' : 'Prenotazione call e lead qualificati'),
        targetAudience: targetAudience.trim() || 'Clienti privati e professionisti esigenti',
        geographicArea: geographicArea.trim() || 'Italia',
        primaryOffer: primaryOffer.trim() || `Servizio professionale di ${serviceToPromote}`,
        realBenefits: benefits,
        primaryCtaLabel: primaryCtaLabel.trim(),
        primaryCtaType,
        primaryCtaDestination: primaryCtaDestination.trim(),
        contactMethod,
        availableMaterials: {
          logoAvailable,
          hasRealPhotos,
          reviewsCount,
          hasVerifiedTestimonials,
          customNotes: customNotes.trim() || undefined,
        },
        stylePreferences: {
          aesthetic,
          tone,
        },
        desiredSubdomain: slug,
      };

      await onProjectCreated(brief, siteReport || undefined);
      onClose();
    } catch (err: any) {
      alert(`Errore creazione progetto: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0D121D] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Wizard Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-[#080B12]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-black flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Nuova Landing Page</h2>
              <div className="text-xs text-slate-400 font-mono">
                Fase {step} di 4 &mdash;{' '}
                {step === 1 && 'Dati Essenziali & Analisi'}
                {step === 2 && 'Obiettivo & Tipologia Landing'}
                {step === 3 && 'Offerta & Percorso di Conversione'}
                {step === 4 && 'Direzione Artistica & Stile'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="p-6 flex-1 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Nome dell'attività o del brand *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value);
                    if (!desiredSubdomain) {
                      setDesiredSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="es. Studio Legale Bonetti, Officina Del Gusto, Dott. Bianchi"
                  className="w-full bg-[#080B12] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>URL del sito esistente (opzionale)</span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Crawler sicuro con protezione SSRF
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://www.azienda.it"
                    className="flex-1 bg-[#080B12] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAnalyzeSite}
                    disabled={analyzingSite || !websiteUrl}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    {analyzingSite ? (
                      <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>Analizza Sito</span>
                      </>
                    )}
                  </button>
                </div>
                {crawlerError && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {crawlerError}
                  </p>
                )}
                {siteReport && (
                  <div className="mt-3 p-3.5 rounded-xl bg-[#080B12] border border-emerald-500/30 text-xs text-slate-300 space-y-1.5">
                    <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Analisi completata con successo ({siteReport.analyzedUrl})
                    </div>
                    {siteReport.extractedTitle && (
                      <div><strong className="text-white">Title:</strong> {siteReport.extractedTitle}</div>
                    )}
                    {siteReport.detectedHeadings.length > 0 && (
                      <div className="text-[11px] text-slate-400">
                        Rilevati {siteReport.detectedHeadings.length} titoli e {siteReport.detectedCallsToAction.length} CTA attuali.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                    Settore di riferimento *
                  </label>
                  <input
                    type="text"
                    required
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="es. Odontoiatria specialistica, Sartoria lusso"
                    className="w-full bg-[#080B12] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                    Area Geografica di riferimento *
                  </label>
                  <input
                    type="text"
                    required
                    value={geographicArea}
                    onChange={(e) => setGeographicArea(e.target.value)}
                    placeholder="es. Milano Centro, Roma Parioli, Tutta Italia"
                    className="w-full bg-[#080B12] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
                  Tipologia di Landing Page *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => {
                      setLandingType('seller');
                      setPrimaryCtaLabel('Richiedi Preventivo WhatsApp');
                      setPrimaryCtaType('whatsapp');
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      landingType === 'seller'
                        ? 'bg-blue-950/40 border-blue-400 text-white shadow-lg shadow-blue-500/10'
                        : 'bg-[#080B12] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm text-white flex items-center justify-between">
                      <span>Seller Landing</span>
                      {landingType === 'seller' && <Check className="w-4 h-4 text-blue-400" />}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Presentazione di offerte e servizi, richieste di preventivo, contatti WhatsApp diretti e pricing chiaro.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setLandingType('optin');
                      setPrimaryCtaLabel('Prenota Check-up Gratuito');
                      setPrimaryCtaType('form');
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      landingType === 'optin'
                        ? 'bg-purple-950/40 border-purple-400 text-white shadow-lg shadow-purple-500/10'
                        : 'bg-[#080B12] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm text-white flex items-center justify-between">
                      <span>Opt-in / Call booking</span>
                      {landingType === 'optin' && <Check className="w-4 h-4 text-purple-400" />}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Acquisizione lead qualificati, prenotazione chiamate conoscitive o appuntamenti e form mirato.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Servizio specifico da promuovere *
                </label>
                <input
                  type="text"
                  required
                  value={serviceToPromote}
                  onChange={(e) => setServiceToPromote(e.target.value)}
                  placeholder="es. Allineamento dentale invisibile con scansione 3D"
                  className="w-full bg-[#080B12] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Pubblico target ideale *
                </label>
                <input
                  type="text"
                  required
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="es. Adulti 25-50 anni che desiderano un sorriso perfetto senza apparecchi metallici"
                  className="w-full bg-[#080B12] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Offerta Principale & Proposta di Valore *
                </label>
                <textarea
                  rows={2}
                  required
                  value={primaryOffer}
                  onChange={(e) => setPrimaryOffer(e.target.value)}
                  placeholder="es. Prima visita specialistica con scansione 3D e simulazione estetica immediata del risultato"
                  className="w-full bg-[#080B12] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Vantaggi e differenziatori reali (uno per riga) *
                </label>
                <textarea
                  rows={3}
                  value={realBenefitsText}
                  onChange={(e) => setRealBenefitsText(e.target.value)}
                  placeholder="Nessuna impronta tradizionale sgradevole&#10;Certificazione Invisalign Diamond con oltre 700 casi&#10;Finanziamento a tasso zero senza anticipo"
                  className="w-full bg-[#080B12] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                    Testo CTA Principale *
                  </label>
                  <input
                    type="text"
                    required
                    value={primaryCtaLabel}
                    onChange={(e) => setPrimaryCtaLabel(e.target.value)}
                    placeholder="es. Prenota Check-up 3D"
                    className="w-full bg-[#080B12] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                    Destinazione CTA *
                  </label>
                  <input
                    type="text"
                    required
                    value={primaryCtaDestination}
                    onChange={(e) => setPrimaryCtaDestination(e.target.value)}
                    placeholder="https://wa.me/39... o /api/lead"
                    className="w-full bg-[#080B12] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Canale di Contatto Principale *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs font-mono">
                  {(['whatsapp', 'phone', 'form', 'calendar', 'email'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setContactMethod(method)}
                      className={`p-2.5 rounded-xl border capitalize transition-colors cursor-pointer ${
                        contactMethod === method
                          ? 'bg-amber-400 text-black border-amber-400 font-bold'
                          : 'bg-[#080B12] text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
                  Direzione Artistica Desiderata
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto pr-1 text-xs">
                  {PRIMARY_ARCHETYPES_LIST.map((preset) => {
                    const isSelected = aesthetic === preset.id;
                    const c = preset.designPlan.themeColors;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => setAesthetic(preset.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-950/40 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                            : 'bg-[#080B12] border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-[#0c101a]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">{preset.name}</span>
                            {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
                          </div>
                          <div className="text-[11px] text-amber-400/90 font-medium">{preset.subtitle}</div>
                          <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                            {preset.designPlan.typography.headingFont} + {preset.designPlan.typography.bodyFont}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-slate-800/80">
                          <div style={{ backgroundColor: c.background }} className="w-3.5 h-3.5 rounded border border-white/20" title="Background" />
                          <div style={{ backgroundColor: c.card }} className="w-3.5 h-3.5 rounded border border-white/20" title="Card" />
                          <div style={{ backgroundColor: c.primary }} className="w-3.5 h-3.5 rounded border border-white/20" title="Primary" />
                          <div style={{ backgroundColor: c.accent }} className="w-3.5 h-3.5 rounded border border-white/20" title="Accent" />
                          <span className="text-[9px] font-mono text-slate-500 ml-auto uppercase">{preset.designPlan.motionTokens?.personality}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Sottodominio Cloudflare Pages desiderato
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={desiredSubdomain}
                    onChange={(e) => setDesiredSubdomain(e.target.value)}
                    placeholder="mio-brand-landing"
                    className="flex-1 bg-[#080B12] border border-slate-700/80 rounded-l-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <span className="bg-slate-800 border border-slate-700/80 border-l-0 rounded-r-xl px-3 py-2.5 text-xs font-mono text-slate-400">
                    .pages.dev
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#080B12] border border-slate-800/80 space-y-2">
                <div className="text-xs font-mono uppercase text-slate-400">Verifica Materiali Disponibili</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasRealPhotos}
                      onChange={(e) => setHasRealPhotos(e.target.checked)}
                      className="rounded accent-amber-400"
                    />
                    <span className="text-slate-300">Fotografie reali azienda</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasVerifiedTestimonials}
                      onChange={(e) => setHasVerifiedTestimonials(e.target.checked)}
                      className="rounded accent-amber-400"
                    />
                    <span className="text-slate-300">Testimonianze verificate</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="px-6 py-4 bg-[#080B12] border-t border-slate-800/80 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Indietro</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              type="button"
              disabled={step === 1 && !businessName.trim()}
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <span>Continua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading || !businessName.trim()}
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Genera Progetto Studio</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
