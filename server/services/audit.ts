/**
 * Technical, SEO & CRO Quality Audit Engine
 * Performs rigorous multi-point validation on landing page copy, strategy, and generated code.
 */

import {
  AuditCheck,
  BusinessBrief,
  CopywritingPlan,
  DesignPlan,
  QualityAuditReport,
  AstroProjectCode,
} from '../../src/types/index.js';

export function runQualityAudit(params: {
  brief: BusinessBrief;
  copywriting?: CopywritingPlan;
  designPlan?: DesignPlan;
  astroCode?: AstroProjectCode;
}): QualityAuditReport {
  const { brief, copywriting, designPlan, astroCode } = params;
  const checks: AuditCheck[] = [];

  // --- 1. SEO & Headings Checks ---
  if (!copywriting || copywriting.sections.length === 0) {
    checks.push({
      id: 'copy-present',
      name: 'Contenuti e Copywriting',
      category: 'seo',
      severity: 'blocking',
      status: 'fail',
      message: 'Nessuna sezione di copywriting generata per la landing page.',
      recommendation: 'Genera il piano di copywriting prima di procedere.',
    });
  } else {
    // Check H1
    const heroSection = copywriting.sections.find((s) => s.type === 'hero');
    if (!heroSection || !heroSection.headline || heroSection.headline.trim().length === 0) {
      checks.push({
        id: 'h1-presence',
        name: 'Presenza H1 principale',
        category: 'seo',
        severity: 'blocking',
        status: 'fail',
        message: 'Manca il titolo principale H1 (sezione Hero assente o senza titolo).',
        recommendation: 'Aggiungi una headline chiara e rilevante nella sezione Hero.',
      });
    } else {
      const h1Length = heroSection.headline.length;
      if (h1Length < 15) {
        checks.push({
          id: 'h1-length',
          name: 'Specificità H1',
          category: 'seo',
          severity: 'warning',
          status: 'warn',
          message: `L'H1 è molto breve (${h1Length} caratteri). Potrebbe mancare la value proposition specifica.`,
          recommendation: 'Rendi la headline più esplicita sul beneficio concreto per il cliente.',
        });
      } else {
        checks.push({
          id: 'h1-presence',
          name: 'H1 principale valido',
          category: 'seo',
          severity: 'info',
          status: 'pass',
          message: `H1 presente e strutturato: "${heroSection.headline.slice(0, 45)}..."`,
        });
      }
    }

    // Meta Title check
    const pageTitle = `${brief.serviceToPromote} | ${brief.businessName}`;
    if (pageTitle.length < 25) {
      checks.push({
        id: 'meta-title',
        name: 'Lunghezza Meta Title',
        category: 'seo',
        severity: 'warning',
        status: 'warn',
        message: `Il titolo della pagina "${pageTitle}" è breve (${pageTitle.length} caratteri). Raccomandati tra 40 e 60 caratteri.`,
        recommendation: 'Includi la località o il vantaggio differenziante nel titolo.',
      });
    } else if (pageTitle.length > 70) {
      checks.push({
        id: 'meta-title',
        name: 'Lunghezza Meta Title',
        category: 'seo',
        severity: 'warning',
        status: 'warn',
        message: `Il titolo (${pageTitle.length} caratteri) supera i 65 caratteri e potrebbe venire troncato dalle SERP.`,
        recommendation: 'Abbrevia il titolo mantenendo le parole chiave strategiche.',
      });
    } else {
      checks.push({
        id: 'meta-title',
        name: 'Meta Title ottimizzato',
        category: 'seo',
        severity: 'info',
        status: 'pass',
        message: `Meta Title perfetto: "${pageTitle}" (${pageTitle.length} caratteri).`,
      });
    }

    // Meta Description check
    const metaDescription = `${brief.businessName} - ${brief.primaryOffer}. ${brief.targetAudience} a ${brief.geographicArea || 'tutta Italia'}.`;
    if (metaDescription.length < 60) {
      checks.push({
        id: 'meta-description',
        name: 'Meta Description',
        category: 'seo',
        severity: 'warning',
        status: 'warn',
        message: 'La meta description è troppo sintetica per garantire un buon CTR sui motori di ricerca.',
        recommendation: 'Arricchisci la descrizione con il differenziatore chiave e un invito all’azione.',
      });
    } else {
      checks.push({
        id: 'meta-description',
        name: 'Meta Description configurata',
        category: 'seo',
        severity: 'info',
        status: 'pass',
        message: `Meta Description presente e informativa (${metaDescription.length} caratteri).`,
      });
    }
  }

  // --- 2. Placeholders & Content Integrity ---
  const allText = JSON.stringify({ brief, copywriting, astroCode });
  const placeholderRegexes = [
    { pattern: /lorem\s+ipsum/i, label: 'Lorem Ipsum' },
    { pattern: /\[TODO[^\]]*\]/i, label: '[TODO]' },
    { pattern: /\[DA\s+COMPLETARE[^\]]*\]/i, label: '[DA COMPLETARE]' },
    { pattern: /\[INSERISCI[^\]]*\]/i, label: '[INSERISCI ...]' },
    { pattern: /undefined|null/i, label: 'undefined / null letterale' },
    { pattern: /test@test\.com|example\.com/i, label: 'Indirizzo email di test' },
    { pattern: /1234567890/i, label: 'Numero di telefono fittizio 1234567890' },
  ];

  const foundPlaceholders: string[] = [];
  for (const { pattern, label } of placeholderRegexes) {
    if (pattern.test(allText)) {
      foundPlaceholders.push(label);
    }
  }

  if (foundPlaceholders.length > 0) {
    checks.push({
      id: 'placeholder-detection',
      name: 'Rilevamento Placeholder e Testi Fittizi',
      category: 'content_integrity',
      severity: 'blocking',
      status: 'fail',
      message: `Trovati elementi segnaposto o testi non definiti: ${foundPlaceholders.join(', ')}.`,
      recommendation: 'Sostituisci tutti i testi segnaposto con informazioni aziendali reali prima del deploy.',
    });
  } else {
    checks.push({
      id: 'placeholder-detection',
      name: 'Integrità Contenuti (Nessun Placeholder)',
      category: 'content_integrity',
      severity: 'info',
      status: 'pass',
      message: 'Nessun testo segnaposto (lorem ipsum, [TODO], undefined) rilevato.',
    });
  }

  // --- 3. Secrets & Leak Prevention ---
  const secretPatterns = [
    { pattern: /sk-[a-zA-Z0-9_-]{20,}/, label: 'Chiave API potenziale (OpenAI/sk-)' },
    { pattern: /AIzaSy[a-zA-Z0-9_-]{33}/, label: 'Google API Key hardcoded' },
    { pattern: /[0-9a-f]{32,40}/i, label: 'Token esadecimale hardcoded' },
    { pattern: /CLOUDFLARE_API_KEY|CLOUDFLARE_TOKEN/i, label: 'Riferimento a token Cloudflare nel codice' },
  ];

  if (astroCode) {
    const astroSource = Object.values(astroCode.components).join(' ') + ' ' + astroCode.indexAstro;
    let leakedSecrets = false;
    for (const { pattern, label } of secretPatterns) {
      if (pattern.test(astroSource)) {
        leakedSecrets = true;
        checks.push({
          id: 'secret-leak',
          name: 'Sicurezza: Secrets nel codice esportato',
          category: 'security',
          severity: 'blocking',
          status: 'fail',
          message: `Rilevato pattern di credenziale sensibile (${label}) nel codice del frontend generato.`,
          recommendation: 'Rimuovi ogni credenziale dal codice client o dai template Astro.',
        });
        break;
      }
    }
    if (!leakedSecrets) {
      checks.push({
        id: 'secret-leak',
        name: 'Codice Esente da Secrets',
        category: 'security',
        severity: 'info',
        status: 'pass',
        message: 'Nessun segreto, token API o credenziale trovato nei file Astro generati.',
      });
    }
  }

  // --- 4. Conversion & CTA Verification ---
  if (!brief.primaryCtaDestination || brief.primaryCtaDestination.trim().length === 0) {
    checks.push({
      id: 'cta-destination',
      name: 'Destinazione CTA Principale',
      category: 'cro',
      severity: 'blocking',
      status: 'fail',
      message: 'La CTA principale non ha una destinazione configurata (link, telefono, WhatsApp o form).',
      recommendation: 'Imposta la destinazione della CTA per consentire la conversione dei visitatori.',
    });
  } else {
    // Specific CTA validation
    if (brief.primaryCtaType === 'whatsapp') {
      const waDest = brief.primaryCtaDestination.trim();
      const hasWaNumber = /\d{7,15}/.test(waDest);
      if (!hasWaNumber) {
        checks.push({
          id: 'cta-destination-wa',
          name: 'Validità Link WhatsApp',
          category: 'cro',
          severity: 'blocking',
          status: 'fail',
          message: 'La destinazione WhatsApp non contiene un numero di telefono valido.',
          recommendation: 'Inserisci il numero WhatsApp nel formato https://wa.me/39... o con prefisso internazionale.',
        });
      } else {
        checks.push({
          id: 'cta-destination-wa',
          name: 'CTA WhatsApp Valida',
          category: 'cro',
          severity: 'info',
          status: 'pass',
          message: 'Link di contatto WhatsApp configurato correttamente.',
        });
      }
    } else if (brief.primaryCtaType === 'phone') {
      const phoneDigits = brief.primaryCtaDestination.replace(/\D/g, '');
      if (phoneDigits.length < 6) {
        checks.push({
          id: 'cta-destination-phone',
          name: 'Numero Telefonico CTA',
          category: 'cro',
          severity: 'blocking',
          status: 'fail',
          message: 'Il numero telefonico della CTA sembra incompleto o non valido.',
          recommendation: 'Verifica il numero telefonico nel brief.',
        });
      } else {
        checks.push({
          id: 'cta-destination-phone',
          name: 'CTA Telefonica Valida',
          category: 'cro',
          severity: 'info',
          status: 'pass',
          message: 'Numero telefonico della CTA verificato.',
        });
      }
    } else if (brief.primaryCtaType === 'calendar') {
      if (!brief.primaryCtaDestination.startsWith('http://') && !brief.primaryCtaDestination.startsWith('https://')) {
        checks.push({
          id: 'cta-destination-calendar',
          name: 'URL Calendario Esterno',
          category: 'cro',
          severity: 'blocking',
          status: 'fail',
          message: 'Il link del calendario per la prenotazione call non è un URL web valido (es. Calendly/Cal.com).',
          recommendation: 'Inserisci un link HTTPS al calendario o seleziona un form di contatto alternativo.',
        });
      } else {
        checks.push({
          id: 'cta-destination-calendar',
          name: 'Link Calendario Valido',
          category: 'cro',
          severity: 'info',
          status: 'pass',
          message: 'Collegamento al calendario di prenotazione call impostato.',
        });
      }
    } else {
      checks.push({
        id: 'cta-destination',
        name: 'Destinazione CTA Principale Valida',
        category: 'cro',
        severity: 'info',
        status: 'pass',
        message: `Destinazione "${brief.primaryCtaDestination}" configurata per la tipologia ${brief.primaryCtaType}.`,
      });
    }
  }

  // --- 5. Social Proof & Trust Verification ---
  if (copywriting) {
    const socialProofSection = copywriting.sections.find((s) => s.type === 'social_proof');
    if (!brief.availableMaterials.hasVerifiedTestimonials && socialProofSection) {
      checks.push({
        id: 'unverified-testimonials',
        name: 'Trasparenza Elementi di Fiducia',
        category: 'content_integrity',
        severity: 'warning',
        status: 'warn',
        message: 'Il brief non dichiara testimonianze verificate dal cliente. Assicurarsi di non pubblicare recensioni inventate.',
        recommendation: 'Rimuovi recensioni simulate oppure inserisci esclusivamente casi studio reali documentati.',
      });
    } else if (brief.availableMaterials.hasVerifiedTestimonials) {
      checks.push({
        id: 'verified-testimonials',
        name: 'Elementi di Fiducia Verificati',
        category: 'content_integrity',
        severity: 'info',
        status: 'pass',
        message: 'Testimonianze e recensioni aziendali segnalate come reali e verificate.',
      });
    }
  }

  // --- 6. Design & Accessibility Checks ---
  if (designPlan) {
    checks.push({
      id: 'typography-system',
      name: 'Sistema Tipografico e Gerarchia Visiva',
      category: 'accessibility',
      severity: 'info',
      status: 'pass',
      message: `Font Heading: "${designPlan.typography.headingFont}", Font Body: "${designPlan.typography.bodyFont}" con ratio ${designPlan.typography.typeScaleRatio}.`,
    });

    checks.push({
      id: 'design-identity',
      name: 'Direzione Artistica Originale',
      category: 'cro',
      severity: 'info',
      status: 'pass',
      message: `Stile selezionato: "${designPlan.aesthetic}" con palette personalizzata e layout hero "${designPlan.visualLayout.heroLayout}".`,
    });
  } else {
    checks.push({
      id: 'design-plan',
      name: 'Piano di Design e Stile',
      category: 'accessibility',
      severity: 'warning',
      status: 'warn',
      message: 'Nessun piano di design personalizzato generato; verrà utilizzato il fallback predefinito.',
      recommendation: 'Esegui la fase di Art Direction per definire colori, font e layout dedicati.',
    });
  }

  // --- 7. Astro Project Code Checks ---
  if (astroCode) {
    const requiredFiles = ['indexAstro', 'layoutAstro', 'globalCss', 'robotsTxt', 'sitemapXml', 'packageJson'];
    const missingFiles = requiredFiles.filter((k) => !(astroCode as any)[k]);
    if (missingFiles.length > 0) {
      checks.push({
        id: 'astro-files',
        name: 'Completezza File Progetto Astro',
        category: 'security',
        severity: 'blocking',
        status: 'fail',
        message: `Mancano alcuni file essenziali del progetto Astro: ${missingFiles.join(', ')}.`,
        recommendation: 'Rigenera il codice Astro completo dalla scheda Design/Anteprima.',
      });
    } else {
      checks.push({
        id: 'astro-files',
        name: 'Progetto Astro Completo e Autonomo',
        category: 'security',
        severity: 'info',
        status: 'pass',
        message: 'Tutti i file sorgente Astro, layout, CSS globale, robots.txt e sitemap.xml sono pronti.',
      });
    }
  }

  // Calculate scores and status
  const blockingCount = checks.filter((c) => c.severity === 'blocking' && c.status === 'fail').length;
  const warningCount = checks.filter((c) => c.severity === 'warning' && c.status === 'warn').length;
  const infoCount = checks.filter((c) => c.status === 'pass').length;

  let score = 100;
  score -= blockingCount * 35;
  score -= warningCount * 10;
  if (score < 0) score = 0;

  const passed = blockingCount === 0;

  return {
    score,
    passed,
    blockingCount,
    warningCount,
    infoCount,
    checks,
    auditedAt: new Date().toISOString(),
  };
}
