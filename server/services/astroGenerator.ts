/**
 * Standalone Astro Project Code Generator
 * Generates modular, production-ready Astro 4+ files with semantic HTML, custom CSS tokens,
 * structured JSON-LD data, and responsive components.
 */

import {
  AstroProjectCode,
  BusinessBrief,
  ConversionStrategy,
  CopywritingPlan,
  CopywritingSection,
  DesignPlan,
} from '../../src/types/index.js';

export function generateAstroProject(params: {
  brief: BusinessBrief;
  strategy?: ConversionStrategy;
  copywriting?: CopywritingPlan;
  designPlan?: DesignPlan;
}): AstroProjectCode {
  const { brief, strategy, copywriting, designPlan } = params;

  const defaultThemeColors = {
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

  const theme = designPlan?.themeColors || defaultThemeColors;
  const typography = designPlan?.typography || {
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300..700&display=swap',
    headingWeight: '700',
    typeScaleRatio: '1.25',
  };
  const visualLayout = designPlan?.visualLayout || {
    heroLayout: 'split_statement',
    containerWidth: 'max-w-6xl',
    borderRadius: 'rounded-2xl',
    verticalSpacing: 'py-24',
    buttonStyle: 'geometric_sharp',
  };
  const cardStyle = designPlan?.cardStyle || 'bordered';
  const motion = designPlan?.motionTokens || {
    personality: 'premium',
    signatureEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    durationQuick: '150ms',
    durationStandard: '400ms',
    durationSlow: '700ms',
    ambientStyle: 'subtle_float',
    cardHoverEffect: 'lift_shadow',
  };

  const sections: CopywritingSection[] = copywriting?.sections || [
    {
      id: 'hero',
      type: 'hero',
      eyebrow: brief.industry.toUpperCase(),
      headline: brief.primaryOffer || `Soluzioni di eccellenza per ${brief.targetAudience}`,
      subheadline: `Percorso ad alta specializzazione per ${brief.businessGoal} senza compromessi sulla qualità.`,
      ctaText: brief.primaryCtaLabel || 'Richiedi Consulenza',
      ctaSecondaryText: brief.secondaryCtaLabel || 'Scopri il Metodo',
      badge: 'Disponibilità Selezionata',
    },
  ];

  // Helper for CTA link
  const primaryHref = brief.primaryCtaDestination || '#contatto';
  const ctaTarget = primaryHref.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : '';

  // 1. package.json
  const packageJson = JSON.stringify(
    {
      name: brief.slug || 'siracusa-landing-project',
      type: 'module',
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'astro dev',
        start: 'astro dev',
        build: 'astro build',
        preview: 'astro preview',
        astro: 'astro',
      },
      dependencies: {
        astro: '^4.16.18',
        '@astrojs/tailwind': '^5.1.5',
        tailwindcss: '^3.4.17',
      },
    },
    null,
    2
  );

  // 2. astro.config.mjs
  const astroConfig = `import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  site: '${brief.desiredSubdomain ? `https://${brief.desiredSubdomain}.pages.dev` : 'https://siracusa-labs.pages.dev'}',
  output: 'static',
});
`;

  // 3. global.css with motion design tokens and archetype-specific physics
  const btnRadius =
    visualLayout.buttonStyle === 'pill'
      ? '9999px'
      : visualLayout.buttonStyle === 'geometric_sharp' || visualLayout.buttonStyle === 'hard_shadow'
      ? '0px'
      : visualLayout.buttonStyle === 'terminal_cli'
      ? '4px'
      : visualLayout.borderRadius || '16px';

  const cardRadius =
    cardStyle === 'raw_brutalist'
      ? '0px'
      : cardStyle === 'terminal_box'
      ? '4px'
      : visualLayout.borderRadius || '20px';

  const globalCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-bg: ${theme.background};
  --color-fg: ${theme.foreground};
  --color-card: ${theme.card};
  --color-card-fg: ${theme.cardForeground};
  --color-primary: ${theme.primary};
  --color-primary-fg: ${theme.primaryForeground};
  --color-accent: ${theme.accent};
  --color-muted: ${theme.muted};
  --color-border: ${theme.border};
  --font-heading: '${typography.headingFont}', serif;
  --font-body: '${typography.bodyFont}', sans-serif;
  --motion-easing: ${motion.signatureEasing};
  --motion-dur-quick: ${motion.durationQuick};
  --motion-dur-std: ${motion.durationStandard};
  --motion-dur-slow: ${motion.durationSlow};
  --btn-radius: ${btnRadius};
  --card-radius: ${cardRadius};
}

body {
  background-color: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-body);
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  letter-spacing: -0.02em;
}

/* Studio Button Physics Grounded in Disney Principles (Anticipation & Squash/Stretch) */
.studio-btn-primary {
  background-color: var(--color-primary);
  color: var(--color-primary-fg);
  font-weight: 600;
  border-radius: var(--btn-radius);
  transition: all var(--motion-dur-quick) var(--motion-easing);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  ${visualLayout.buttonStyle === 'geometric_sharp' ? 'text-transform: uppercase; letter-spacing: 0.08em;' : ''}
  ${visualLayout.buttonStyle === 'hard_shadow' ? 'box-shadow: 4px 4px 0px var(--color-accent); border: 2px solid var(--color-fg); font-weight: 800;' : ''}
  ${visualLayout.buttonStyle === 'kintsugi_gold' ? 'background: linear-gradient(135deg, var(--color-primary) 0%, #F5E5A4 50%, var(--color-primary) 100%); box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3);' : ''}
  ${visualLayout.buttonStyle === 'terminal_cli' ? 'font-family: var(--font-heading); border: 1px solid var(--color-primary); box-shadow: 0 0 15px rgba(0, 255, 157, 0.2);' : ''}
}

.studio-btn-primary:hover {
  filter: brightness(1.12);
  ${visualLayout.buttonStyle === 'hard_shadow' ? 'transform: translate(-2px, -2px); box-shadow: 6px 6px 0px var(--color-accent);' : 'transform: translateY(-2px);'}
}

.studio-btn-primary:active {
  ${visualLayout.buttonStyle === 'hard_shadow' ? 'transform: translate(2px, 2px); box-shadow: 2px 2px 0px var(--color-accent);' : 'transform: scale(0.97);'}
}

.studio-btn-secondary {
  border: 1px solid var(--color-border);
  color: var(--color-fg);
  font-weight: 500;
  border-radius: var(--btn-radius);
  background-color: rgba(255, 255, 255, 0.03);
  transition: all var(--motion-dur-quick) var(--motion-easing);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.studio-btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.08);
  border-color: var(--color-muted);
  transform: translateY(-1px);
}

/* Card Treatments */
.studio-card {
  background-color: var(--color-card);
  color: var(--color-card-fg);
  border-radius: var(--card-radius);
  border: 1px solid var(--color-border);
  transition: all var(--motion-dur-std) var(--motion-easing);
  ${cardStyle === 'raw_brutalist' ? 'border: 2px solid var(--color-border); box-shadow: 4px 4px 0px #1a1a1a;' : ''}
  ${cardStyle === 'glassmorphism' ? 'backdrop-filter: blur(16px); background-color: rgba(12, 21, 36, 0.7);' : ''}
  ${cardStyle === 'velvet_glow' ? 'box-shadow: 0 15px 35px -10px rgba(190, 18, 60, 0.15);' : ''}
}

.studio-card:hover {
  ${motion.cardHoverEffect === 'lift_shadow' ? 'transform: translateY(-4px); box-shadow: 0 20px 30px -10px rgba(0,0,0,0.4);' : ''}
  ${motion.cardHoverEffect === 'border_glow' ? 'border-color: var(--color-accent); box-shadow: 0 0 20px rgba(245, 158, 11, 0.15);' : ''}
  ${motion.cardHoverEffect === 'hard_pop' ? 'transform: translate(-3px, -3px); box-shadow: 6px 6px 0px var(--color-primary);' : ''}
  ${motion.cardHoverEffect === 'glass_shine' ? 'border-color: rgba(255, 255, 255, 0.25);' : ''}
}

/* Ambient Layer Animations */
@keyframes studioAmbientFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

@keyframes studioAmbientPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.02); opacity: 0.92; }
}

@keyframes studioZenBreathe {
  0%, 100% { transform: scale(1); opacity: 0.95; }
  50% { transform: scale(1.015); opacity: 1; }
}

.animate-studio-float {
  animation: studioAmbientFloat 6s ease-in-out infinite;
}

.animate-studio-pulse {
  animation: studioAmbientPulse 4s ease-in-out infinite;
}

.animate-studio-zen {
  animation: studioZenBreathe 8s ease-in-out infinite;
}
`;

  // 4. Layout.astro
  const pageTitle = `${brief.serviceToPromote || brief.businessName} | ${brief.businessName}`;
  const metaDesc = `${brief.businessName} — ${brief.primaryOffer}. ${brief.targetAudience} a ${brief.geographicArea || 'Italia'}.`;
  const schemaJson = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': brief.landingType === 'optin' ? 'ProfessionalService' : 'LocalBusiness',
      name: brief.businessName,
      description: metaDesc,
      address: {
        '@type': 'PostalAddress',
        addressLocality: brief.geographicArea || 'Italia',
        addressCountry: 'IT',
      },
      makesOffer: {
        '@type': 'Offer',
        name: brief.serviceToPromote,
        description: brief.primaryOffer,
      },
    },
    null,
    2
  );

  const layoutAstro = `---
interface Props {
  title?: string;
  description?: string;
}

const {
  title = "${pageTitle.replace(/"/g, '\\"')}",
  description = "${metaDesc.replace(/"/g, '\\"')}"
} = Astro.props;
---

<!doctype html>
<html lang="it" class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="${typography.googleFontsUrl}" rel="stylesheet">
    <link rel="stylesheet" href="/src/styles/global.css" />
    <script type="application/ld+json">
${schemaJson}
    </script>
  </head>
  <body class="min-h-screen flex flex-col selection:bg-blue-600 selection:text-white">
    <slot />
  </body>
</html>
`;

  // Components collection
  const components: Record<string, string> = {};

  // Hero.astro
  const heroData = sections.find((s) => s.type === 'hero') || sections[0];
  const hasHeroImage = Boolean(heroData.heroImage);
  components['Hero.astro'] = `---
// Sezione Hero ad alta conversione & direzione artistica editoriale
---

<header class="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[var(--color-border)]">
  <div class="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--color-accent),transparent_70%)]"></div>
  <div class="max-w-6xl mx-auto px-6 relative z-10">
    <div class="flex items-center justify-between pb-8 mb-10 border-b border-[var(--color-border)]/60">
      <div class="font-serif text-2xl tracking-tight font-bold text-[var(--color-fg)]">
        ${brief.businessName}
      </div>
      <div class="text-xs uppercase tracking-widest text-[var(--color-muted)] font-mono flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        ${brief.geographicArea || 'Siracusa, Sicilia'}
      </div>
    </div>

    <div class="grid grid-cols-1 ${hasHeroImage ? 'lg:grid-cols-12 gap-12 items-center' : ''}">
      <div class="${hasHeroImage ? 'lg:col-span-7' : 'max-w-3xl'}">
        ${
          heroData.badge || heroData.eyebrow
            ? `<div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider mb-6 bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-accent)] shadow-sm">
                <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse"></span>
                ${heroData.badge || heroData.eyebrow}
              </div>`
            : ''
        }

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--color-card-fg)] leading-[1.1] mb-6">
          ${heroData.headline}
        </h1>

        <p class="text-lg sm:text-xl text-[var(--color-muted)] leading-relaxed mb-10 max-w-2xl">
          ${heroData.subheadline || ''}
        </p>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <a href="${primaryHref}" ${ctaTarget} class="studio-btn-primary px-8 py-4 rounded-xl text-base">
            ${heroData.ctaText || brief.primaryCtaLabel || 'Inizia Ora'}
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </a>

          ${
            heroData.ctaSecondaryText
              ? `<a href="#menu" class="studio-btn-secondary px-8 py-4 rounded-xl text-base">
                  ${heroData.ctaSecondaryText}
                </a>`
              : ''
          }
        </div>

        ${
          heroData.guaranteeText
            ? `<p class="mt-5 text-xs text-[var(--color-muted)] font-mono flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                ${heroData.guaranteeText}
              </p>`
            : ''
        }
      </div>

      ${
        hasHeroImage
          ? `<div class="lg:col-span-5">
              <div class="relative rounded-3xl overflow-hidden border border-[var(--color-border)] shadow-2xl group">
                <img
                  src="${heroData.heroImage}"
                  alt="${brief.businessName}"
                  class="w-full h-[460px] object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                  <span class="text-xs font-mono uppercase tracking-widest text-amber-300 mb-1">
                    ${brief.industry} • ${brief.geographicArea || 'Ortigia'}
                  </span>
                  <div class="text-white font-serif text-lg font-bold">
                    ${brief.serviceToPromote}
                  </div>
                </div>
              </div>
            </div>`
          : ''
      }
    </div>
  </div>
</header>
`;

  // ProblemAgitation.astro
  const problemData = sections.find((s) => s.type === 'problem_agitation');
  components['ProblemAgitation.astro'] = `---
// Analisi del problema e punti critici
---

<section id="problema" class="py-20 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
      <div class="md:col-span-5">
        <span class="text-xs font-mono uppercase tracking-widest text-red-400">
          ${problemData?.eyebrow || 'L’OSTACOLO'}
        </span>
        <h2 class="text-3xl md:text-4xl font-bold mt-2 text-[var(--color-card-fg)]">
          ${problemData?.headline || 'La realtà che frena i risultati'}
        </h2>
        <p class="mt-4 text-[var(--color-muted)] text-base leading-relaxed">
          ${problemData?.subheadline || 'Spesso ci si scontra con promesse generiche e processi lenti che non tutelano i tuoi standard.'}
        </p>
      </div>

      <div class="md:col-span-7 space-y-4">
        ${(
          problemData?.bulletPoints || [
            'Mancanza di trasparenza nei tempi e nei costi effettivi',
            'Soluzioni preconfezionate che non tengono conto del tuo contesto specifico',
            'Difficoltà a comunicare direttamente con chi esegue il lavoro',
          ]
        )
          .map(
            (point, idx) => `
          <div class="p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] flex items-start gap-4">
            <span class="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/10 text-red-400 font-mono text-xs flex items-center justify-center font-bold">
              0${idx + 1}
            </span>
            <p class="text-sm md:text-base text-[var(--color-fg)] pt-1">
              ${point}
            </p>
          </div>
        `
          )
          .join('\n')}
      </div>
    </div>
  </div>
</section>
`;

  // SolutionValue.astro
  const solutionData = sections.find((s) => s.type === 'solution_value');
  components['SolutionValue.astro'] = `---
// Proposta di valore e differenziatori
---

<section id="dettagli" class="py-24 bg-[var(--color-card)]/40 border-b border-[var(--color-border)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="max-w-2xl mb-16">
      <span class="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)]">
        ${solutionData?.eyebrow || 'LA DIFFERENZA REALE'}
      </span>
      <h2 class="text-3xl md:text-4xl font-bold mt-2 text-[var(--color-card-fg)]">
        ${solutionData?.headline || 'Un approccio rigoroso, misurabile e personalizzato'}
      </h2>
      <p class="mt-4 text-[var(--color-muted)] text-lg">
        ${solutionData?.subheadline || 'Ogni fase è progettata per massimizzare la chiarezza e ridurre ogni frizione operativa.'}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      ${(
        solutionData?.bulletPoints || [
          'Analisi preliminare accurata prima di qualunque impegno vincolante.',
          'Interlocutore dedicato con esperienza verticale nel settore.',
          'Consegne puntuali e documentazione trasparente di ogni passaggio.',
        ]
      )
        .map(
          (benefit, i) => `
        <div class="p-8 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] flex flex-col justify-between hover:border-[var(--color-accent)]/50 transition-colors">
          <div>
            <div class="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center mb-6 font-mono font-bold">
              ${i + 1}
            </div>
            <h3 class="text-lg font-bold text-[var(--color-card-fg)] mb-3">
              ${benefit.split(':')[0] || 'Vantaggio tangibile'}
            </h3>
            <p class="text-sm text-[var(--color-muted)] leading-relaxed">
              ${benefit.includes(':') ? benefit.split(':')[1] : benefit}
            </p>
          </div>
        </div>
      `
        )
        .join('\n')}
    </div>
  </div>
</section>
`;

  // HowItWorks.astro
  const howData = sections.find((s) => s.type === 'how_it_works');
  components['HowItWorks.astro'] = `---
// Processo di lavoro step-by-step
---

<section class="py-24 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center max-w-xl mx-auto mb-16">
      <span class="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)]">IL METODO</span>
      <h2 class="text-3xl md:text-4xl font-bold mt-2 text-[var(--color-card-fg)]">
        ${howData?.headline || 'Come lavoriamo insieme'}
      </h2>
      <p class="mt-4 text-[var(--color-muted)]">Tre passaggi lineari per ottenere il risultato concordato.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
      ${(
        howData?.bulletPoints || [
          '1. Primo contatto e allineamento degli obiettivi',
          '2. Definizione del piano d’azione e tempistiche',
          '3. Esecuzione e verifica del risultato',
        ]
      )
        .map(
          (step, idx) => `
        <div class="relative p-8 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)]">
          <div class="text-xs font-mono text-[var(--color-accent)] mb-4">FASE 0${idx + 1}</div>
          <h3 class="text-lg font-bold text-[var(--color-card-fg)] mb-2">${step}</h3>
          <p class="text-sm text-[var(--color-muted)]">Nessuna sorpresa, ogni passaggio è concordato per iscritto.</p>
        </div>
      `
        )
        .join('\n')}
    </div>
  </div>
</section>
`;

  // OfferPricing or OptinForm depending on type
  if (brief.landingType === 'optin') {
    components['OptinForm.astro'] = `---
// Form di candidatura / prenotazione qualificato
---

<section id="contatto" class="py-24 bg-[var(--color-card)]/50 border-b border-[var(--color-border)]">
  <div class="max-w-4xl mx-auto px-6">
    <div class="text-center mb-12">
      <span class="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)]">CANDIDATURA DIRETTA</span>
      <h2 class="text-3xl md:text-4xl font-bold mt-2 text-[var(--color-card-fg)]">
        Prenota la tua sessione strategica
      </h2>
      <p class="mt-4 text-[var(--color-muted)] max-w-lg mx-auto">
        Compila i dettagli essenziali per verificare la disponibilità e preparare una proposta su misura.
      </p>
    </div>

    <div class="bg-[var(--color-card)] p-8 md:p-12 rounded-3xl border border-[var(--color-border)] shadow-xl">
      <form action="${brief.primaryCtaDestination || '/api/lead'}" method="POST" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-mono uppercase text-[var(--color-muted)] mb-2">Nome e Cognome *</label>
            <input required type="text" name="name" class="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-accent)]" placeholder="es. Mario Rossi" />
          </div>
          <div>
            <label class="block text-xs font-mono uppercase text-[var(--color-muted)] mb-2">Email Aziendale *</label>
            <input required type="email" name="email" class="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-accent)]" placeholder="mario@azienda.it" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-mono uppercase text-[var(--color-muted)] mb-2">Telefono / WhatsApp *</label>
            <input required type="tel" name="phone" class="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-accent)]" placeholder="+39 340 0000000" />
          </div>
          <div>
            <label class="block text-xs font-mono uppercase text-[var(--color-muted)] mb-2">Attività o Settore</label>
            <input type="text" name="company" class="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-accent)]" placeholder="es. Studio Medico" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-mono uppercase text-[var(--color-muted)] mb-2">Obiettivo principale o richiesta</label>
          <textarea rows="3" name="notes" class="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-accent)]" placeholder="Descrivi brevemente cosa vorresti realizzare..."></textarea>
        </div>

        <div class="flex items-start gap-3 pt-2">
          <input required type="checkbox" id="privacy" class="mt-1 accent-[var(--color-primary)]" />
          <label for="privacy" class="text-xs text-[var(--color-muted)]">
            Accetto il trattamento dei dati personali secondo l'informativa privacy di ${brief.businessName}.
          </label>
        </div>

        <button type="submit" class="studio-btn-primary w-full py-4 rounded-xl text-base font-semibold">
          Invia Richiesta di Prenotazione
        </button>
      </form>
    </div>
  </div>
</section>
`;
  } else {
    // Seller offer & pricing
    const offerData = sections.find((s) => s.type === 'offer_pricing');
    components['OfferPricing.astro'] = `---
// Offerta e pacchetti trasparenti
---

<section id="offerta" class="py-24 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center max-w-2xl mx-auto mb-16">
      <span class="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)]">L'OFFERTA</span>
      <h2 class="text-3xl md:text-4xl font-bold mt-2 text-[var(--color-card-fg)]">
        ${offerData?.headline || 'Opzioni chiare, senza costi nascosti'}
      </h2>
      <p class="mt-4 text-[var(--color-muted)]">
        ${offerData?.subheadline || 'Scegli la modalità più adatta alle esigenze della tua attività.'}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      ${(
        offerData?.pricingCards || [
          {
            name: 'Consulenza Dedicata',
            price: 'Su Preventivo',
            features: ['Diagnosi preliminare completa', 'Piano strategico operativo', 'Supporto diretto via WhatsApp'],
            ctaText: 'Richiedi Preventivo',
            isPopular: true,
          },
        ]
      )
        .map(
          (card) => `
        <div class="p-8 rounded-3xl bg-[var(--color-card)] border ${card.isPopular ? 'border-[var(--color-accent)] shadow-2xl relative' : 'border-[var(--color-border)]'} flex flex-col justify-between">
          <div>
            ${card.isPopular ? `<span class="absolute -top-3 right-8 bg-[var(--color-accent)] text-black text-[10px] font-mono uppercase font-bold px-3 py-1 rounded-full">Scelta Consigliata</span>` : ''}
            <h3 class="text-xl font-bold text-[var(--color-card-fg)] mb-2">${card.name}</h3>
            <div class="text-2xl font-bold text-[var(--color-fg)] mb-6 font-mono">${card.price}</div>
            <ul class="space-y-3 mb-8">
              ${card.features
                .map(
                  (f) => `
                <li class="flex items-center text-sm text-[var(--color-muted)] gap-2">
                  <svg class="w-4 h-4 text-[var(--color-accent)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  ${f}
                </li>
              `
                )
                .join('')}
            </ul>
          </div>
          <a href="${primaryHref}" ${ctaTarget} class="${card.isPopular ? 'studio-btn-primary' : 'studio-btn-secondary'} w-full py-3.5 rounded-xl text-center text-sm">
            ${card.ctaText}
          </a>
        </div>
      `
        )
        .join('\n')}
    </div>
  </div>
</section>
`;
  }

  // Faq.astro
  const faqData = sections.find((s) => s.type === 'faq');
  components['Faq.astro'] = `---
// Domande Frequenti e gestione obiezioni
---

<section class="py-24 bg-[var(--color-card)]/30 border-b border-[var(--color-border)]">
  <div class="max-w-4xl mx-auto px-6">
    <div class="text-center mb-16">
      <span class="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)]">CHIAREZZA</span>
      <h2 class="text-3xl md:text-4xl font-bold mt-2 text-[var(--color-card-fg)]">
        ${faqData?.headline || 'Domande Frequenti'}
      </h2>
    </div>

    <div class="space-y-4">
      ${(
        faqData?.faqItems || [
          {
            question: 'Quali sono le tempistiche previste per avviare il servizio?',
            answer: 'Normalmente completiamo la fase di pianificazione e avvio entro 7-10 giorni lavorativi dalla conferma.',
          },
          {
            question: 'Come posso richiedere assistenza durante il percorso?',
            answer: 'Avrai un canale diretto prioritario per comunicare in modo rapido e senza intermediari.',
          },
        ]
      )
        .map(
          (item) => `
        <details class="group p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] [&_svg]:open:-rotate-180">
          <summary class="flex justify-between items-center cursor-pointer list-none font-bold text-base text-[var(--color-card-fg)]">
            ${item.question}
            <svg class="w-5 h-5 transition-transform duration-200 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </summary>
          <p class="mt-4 text-sm text-[var(--color-muted)] leading-relaxed border-t border-[var(--color-border)] pt-4">
            ${item.answer}
          </p>
        </details>
      `
        )
        .join('\n')}
    </div>
  </div>
</section>
`;

  // FinalCta.astro
  const finalCtaData = sections.find((s) => s.type === 'final_cta') || heroData;
  components['FinalCta.astro'] = `---
// Chiamata all'azione finale
---

<section class="py-24 bg-[var(--color-bg)] text-center relative overflow-hidden">
  <div class="max-w-4xl mx-auto px-6 relative z-10">
    <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-card-fg)] tracking-tight mb-6">
      ${finalCtaData.headline || 'Pronto a fare il prossimo passo?'}
    </h2>
    <p class="text-lg text-[var(--color-muted)] max-w-xl mx-auto mb-10">
      ${finalCtaData.subheadline || `Parla direttamente con ${brief.businessName} e scopri la soluzione più adatta a te.`}
    </p>

    <a href="${primaryHref}" ${ctaTarget} class="studio-btn-primary px-10 py-5 rounded-2xl text-lg font-bold">
      ${finalCtaData.ctaText || brief.primaryCtaLabel || 'Richiedi Informazioni'}
    </a>
  </div>
</section>

<footer class="py-12 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
  <div class="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--color-muted)] gap-4">
    <div>&copy; ${new Date().getFullYear()} ${brief.businessName}. Tutti i diritti riservati.</div>
    <div class="font-mono">Realizzato con Siracusa Labs Landing Studio</div>
  </div>
</footer>
`;

  // MenuShowcase.astro (Gastronomic & Food/Hospitality Showcase)
  const menuData = sections.find((s) => s.type === 'menu_showcase');
  if (menuData) {
    components['MenuShowcase.astro'] = `---
// Selezione Gastronomica & Percorso Degustazione
---

<section id="menu" class="py-24 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center max-w-2xl mx-auto mb-16">
      <span class="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)]">
        ${menuData.eyebrow || 'PROPOSTA GASTRONOMICA'}
      </span>
      <h2 class="text-3xl md:text-5xl font-bold mt-2 text-[var(--color-card-fg)]">
        ${menuData.headline || 'I Nostri Percorsi di Stagione'}
      </h2>
      <p class="mt-4 text-[var(--color-muted)] text-base md:text-lg">
        ${menuData.subheadline || 'Creazioni che celebrano la biodiversità del territorio siciliano con tecniche contemporanee.'}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      ${(
        menuData.menuItems || [
          {
            name: 'Caponata Contemporanea di Ortigia',
            description: 'Melanzane nostrane glassate all’agrodolce di Nero d’Avola, mandorle tostate di Avola e cialda di basilico.',
            price: '€18',
            dietaryTag: '100% Vegetale',
            provenance: 'Verdure biologiche da coltivatori locali',
            imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
          },
          {
            name: 'Spaghettone ai Limoni Femminello & Pistacchio',
            description: 'Pasta trafilata in bronzo, emulsione di limone candito IGP di Siracusa, crumble di pistacchio di Raffadali.',
            price: '€22',
            dietaryTag: 'Signature Dish',
            provenance: 'Limoni IGP Siracusa',
            imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
          },
          {
            name: 'Millefoglie all’Arancia Rossa & Mandorla',
            description: 'Sfoglia croccante caramellata, crema chantilly all’arancia tarocco e riduzione di passito di Noto.',
            price: '€14',
            dietaryTag: 'Dolce d’Autore',
            provenance: 'Agrumi della Val di Noto',
            imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
          },
        ]
      )
        .map(
          (item) => `
        <div class="group p-6 rounded-3xl bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/60 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl">
          ${
            item.imageUrl
              ? `<div class="relative h-48 -mx-6 -mt-6 mb-5 overflow-hidden">
                  <img src="${item.imageUrl}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  ${
                    item.dietaryTag
                      ? `<span class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold bg-black/75 backdrop-blur-md text-amber-300 border border-amber-500/30">
                          ${item.dietaryTag}
                        </span>`
                      : ''
                  }
                </div>`
              : ''
          }
          <div>
            <div class="flex items-baseline justify-between gap-4 mb-2">
              <h3 class="text-xl font-bold text-[var(--color-card-fg)] group-hover:text-[var(--color-accent)] transition-colors">
                ${item.name}
              </h3>
              <span class="text-lg font-mono font-bold text-[var(--color-accent)] flex-shrink-0">
                ${item.price}
              </span>
            </div>
            <p class="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
              ${item.description}
            </p>
          </div>
          ${
            item.provenance
              ? `<div class="pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-muted)] font-mono flex items-center gap-1.5">
                  <span class="text-[var(--color-accent)]">&#9670;</span>
                  ${item.provenance}
                </div>`
              : ''
          }
        </div>
      `
        )
        .join('\n')}
    </div>
  </div>
</section>
`;
  }

  // ExperienceStory.astro (Narrative & Philosophy)
  const storyData = sections.find((s) => s.type === 'experience_story');
  if (storyData) {
    components['ExperienceStory.astro'] = `---
// La Storia & Filosofia dell'Esperienza
---

<section id="filosofia" class="py-24 bg-[var(--color-card)]/50 border-b border-[var(--color-border)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-6 space-y-6">
        <span class="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)]">
          ${storyData.eyebrow || 'FILOSOFIA & TERRITORIO'}
        </span>
        <h2 class="text-3xl md:text-5xl font-bold text-[var(--color-card-fg)] leading-tight">
          ${storyData.headline || 'Un viaggio sensoriale nella Sicilia autentica'}
        </h2>
        <p class="text-base md:text-lg text-[var(--color-muted)] leading-relaxed">
          ${storyData.subheadline || ''}
        </p>

        ${
          storyData.quote
            ? `<blockquote class="p-6 rounded-2xl bg-[var(--color-bg)] border-l-4 border-[var(--color-accent)] border-[var(--color-border)] italic text-[var(--color-fg)] text-base">
                "${storyData.quote}"
                ${
                  storyData.quoteAuthor
                    ? `<footer class="mt-2 text-xs font-mono not-italic text-[var(--color-muted)]">— ${storyData.quoteAuthor}</footer>`
                    : ''
                }
              </blockquote>`
            : ''
        }

        <div class="space-y-3 pt-2">
          ${(storyData.bulletPoints || []).map((pt) => `
            <div class="flex items-start gap-3 text-sm text-[var(--color-fg)]">
              <span class="w-5 h-5 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">&#10003;</span>
              <span>${pt}</span>
            </div>
          `).join('\n')}
        </div>
      </div>

      <div class="lg:col-span-6">
        <div class="relative rounded-3xl overflow-hidden border border-[var(--color-border)] shadow-2xl">
          <img
            src="${storyData.heroImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80'}"
            alt="Esperienza culinaria ad Ortigia"
            class="w-full h-[450px] object-cover"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
            <div class="text-white">
              <span class="text-xs font-mono uppercase tracking-widest text-amber-300 block mb-1">Ortigia • Siracusa</span>
              <p class="text-sm font-medium opacity-90">Ingredienti colti al mattino e trasformati per la serata.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
`;
  }

  // ReservationWidget.astro (Direct Table / VIP Booking)
  const resData = sections.find((s) => s.type === 'reservation_widget');
  if (resData) {
    components['ReservationWidget.astro'] = `---
// Modulo Prenotazione Tavolo Esclusivo
---

<section id="prenota" class="py-24 bg-[var(--color-card)]/50 border-b border-[var(--color-border)]">
  <div class="max-w-4xl mx-auto px-6">
    <div class="text-center mb-12">
      <span class="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)]">
        ${resData.eyebrow || 'RISERVA IL TUO TAVOLO'}
      </span>
      <h2 class="text-3xl md:text-5xl font-bold mt-2 text-[var(--color-card-fg)]">
        ${resData.headline || 'Prenota la tua Esperienza ad Ortigia'}
      </h2>
      <p class="mt-4 text-[var(--color-muted)] max-w-xl mx-auto">
        ${resData.subheadline || 'Disponibilità limitata per garantire l’intimità e la migliore cura di ogni ospite.'}
      </p>
    </div>

    <div class="bg-[var(--color-card)] p-8 md:p-12 rounded-3xl border border-[var(--color-border)] shadow-2xl">
      <form action="${brief.primaryCtaDestination || '/api/reservation'}" method="POST" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-mono uppercase text-[var(--color-muted)] mb-2">Nome e Cognome *</label>
            <input required type="text" name="name" class="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-accent)]" placeholder="es. Elena Conti" />
          </div>
          <div>
            <label class="block text-xs font-mono uppercase text-[var(--color-muted)] mb-2">Telefono / WhatsApp *</label>
            <input required type="tel" name="phone" class="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-accent)]" placeholder="+39 340 0000000" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-xs font-mono uppercase text-[var(--color-muted)] mb-2">Data *</label>
            <input required type="date" name="date" class="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-accent)]" />
          </div>
          <div>
            <label class="block text-xs font-mono uppercase text-[var(--color-muted)] mb-2">Orario *</label>
            <select name="timeSlot" class="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-accent)]">
              ${(resData.reservationConfig?.timeSlots || ['19:30', '20:15', '21:00', '21:45']).map((slot) => `<option value="${slot}">${slot}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-xs font-mono uppercase text-[var(--color-muted)] mb-2">Numero Ospiti *</label>
            <select name="guests" class="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-accent)]">
              <option value="2">2 persone</option>
              <option value="3">3 persone</option>
              <option value="4">4 persone</option>
              <option value="5+">5+ persone (richiede conferma)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-mono uppercase text-[var(--color-muted)] mb-2">Intolleranze, Preferenze o Occasione Speciale</label>
          <textarea rows="2" name="notes" class="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-accent)]" placeholder="es. Compleanno, tavolo con vista, preferenze dietetiche..."></textarea>
        </div>

        <button type="submit" class="studio-btn-primary w-full py-4 rounded-xl text-base font-semibold">
          ${resData.ctaText || 'Conferma e Richiedi Disponibilità'}
        </button>

        <p class="text-center text-xs text-[var(--color-muted)] font-mono">
          ${resData.reservationConfig?.cancellationPolicy || 'Cancellazione gratuita fino a 4 ore prima.'}
        </p>
      </form>
    </div>
  </div>
</section>
`;
  }

  // AtmosphereGallery.astro (Photography & Ambiance)
  const galleryData = sections.find((s) => s.type === 'atmosphere_gallery');
  if (galleryData) {
    components['AtmosphereGallery.astro'] = `---
// Atmosfera & Galleria Immagini
---

<section class="py-24 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center max-w-2xl mx-auto mb-16">
      <span class="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)]">
        ${galleryData.eyebrow || 'ATMOSFERA'}
      </span>
      <h2 class="text-3xl md:text-5xl font-bold mt-2 text-[var(--color-card-fg)]">
        ${galleryData.headline || 'Scorci e Momenti a Ortigia'}
      </h2>
      <p class="mt-4 text-[var(--color-muted)] text-base">
        ${galleryData.subheadline || 'Dalla terrazza con vista sul Golfo ai tavoli illuminati a lume di candela.'}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      ${(
        galleryData.mediaImages || [
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        ]
      )
        .map(
          (imgUrl, i) => `
        <div class="rounded-2xl overflow-hidden border border-[var(--color-border)] group relative h-72">
          <img src="${imgUrl}" alt="Atmosfera ${i + 1}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      `
        )
        .join('\n')}
    </div>
  </div>
</section>
`;
  }

  // 5. index.astro - Dynamically assembled from available components in structured sequence
  const componentOrder = [
    'Hero.astro',
    'MenuShowcase.astro',
    'ExperienceStory.astro',
    'ProblemAgitation.astro',
    'SolutionValue.astro',
    'HowItWorks.astro',
    'ReservationWidget.astro',
    brief.landingType === 'optin' ? 'OptinForm.astro' : 'OfferPricing.astro',
    'AtmosphereGallery.astro',
    'Faq.astro',
    'FinalCta.astro',
  ];

  const activeComponents = componentOrder.filter((name) => Boolean(components[name]));
  const importsStr = activeComponents
    .map((name) => `import ${name.replace('.astro', '')} from '../components/${name}';`)
    .join('\n');
  const tagsStr = activeComponents
    .map((name) => `    <${name.replace('.astro', '')} />`)
    .join('\n');

  const indexAstro = `---
import Layout from '../layouts/Layout.astro';
${importsStr}
---

<Layout>
  <main>
${tagsStr}
  </main>
</Layout>
`;

  // 6. robots.txt
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${brief.desiredSubdomain ? `https://${brief.desiredSubdomain}.pages.dev/sitemap.xml` : 'https://siracusa-labs.pages.dev/sitemap.xml'}
`;

  // 7. sitemap.xml
  const targetSiteUrl = brief.desiredSubdomain
    ? `https://${brief.desiredSubdomain}.pages.dev`
    : 'https://siracusa-labs.pages.dev';
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${targetSiteUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

  return {
    packageJson,
    astroConfig,
    indexAstro,
    layoutAstro,
    globalCss,
    components,
    robotsTxt,
    sitemapXml,
  };
}
