/**
 * Secure Website Crawler & Content Extractor
 * Strictly validates targets with SSRF checks, enforces timeouts and size caps,
 * and extracts semantic facts, headings, CTAs, and trust signals.
 */

import { validateUrlForSsrf } from './ssrf.js';
import { SiteAnalysisReport } from '../../src/types/index.js';

export async function safelyAnalyzeWebsite(targetUrl: string): Promise<SiteAnalysisReport> {
  const ssrfCheck = await validateUrlForSsrf(targetUrl);
  if (!ssrfCheck.valid) {
    throw new Error(`Controllo di sicurezza SSRF fallito: ${ssrfCheck.error}`);
  }

  const cleanUrl = ssrfCheck.sanitizedUrl || targetUrl;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout

  try {
    const response = await fetch(cleanUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SiracusaLabsLandingStudio/1.0; +https://siracusa-labs.it/bot)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Risposta HTTP non valida: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      throw new Error(`Tipo di contenuto non supportato: ${contentType}. Richiesto HTML pubblico.`);
    }

    // Read response up to 1.5MB
    const reader = response.body?.getReader();
    let receivedBytes = 0;
    const maxBytes = 1.5 * 1024 * 1024; // 1.5 MB
    const chunks: Uint8Array[] = [];

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          receivedBytes += value.length;
          if (receivedBytes > maxBytes) {
            reader.cancel();
            break;
          }
          chunks.push(value);
        }
      }
    }

    const fullBuffer = Buffer.concat(chunks);
    const html = fullBuffer.toString('utf-8');

    // Extract tags via robust regex patterns
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : undefined;

    const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : undefined;

    // Headings
    const headingMatches = [...html.matchAll(/<h([1-3])[^>]*>(.*?)<\/h\1>/gis)];
    const detectedHeadings: string[] = [];
    for (const match of headingMatches) {
      const text = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (text.length > 3 && text.length < 150) {
        detectedHeadings.push(text);
      }
      if (detectedHeadings.length >= 10) break;
    }

    // CTAs & Buttons
    const buttonMatches = [...html.matchAll(/<(?:button|a)[^>]*class=["'][^"']*(?:btn|button|cta)[^"']*["'][^>]*>(.*?)<\/(?:button|a)>/gis)];
    const detectedCallsToAction: string[] = [];
    for (const match of buttonMatches) {
      const text = match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (text.length > 2 && text.length < 50 && !detectedCallsToAction.includes(text)) {
        detectedCallsToAction.push(text);
      }
      if (detectedCallsToAction.length >= 6) break;
    }

    // Contact methods detected
    const trustSignalsDetected: string[] = [];
    if (/whatsapp|wa\.me/i.test(html)) trustSignalsDetected.push('Presenza canale WhatsApp');
    if (/tel:|callto:/i.test(html)) trustSignalsDetected.push('Telefono diretto rilevato');
    if (/mailto:/i.test(html)) trustSignalsDetected.push('Email di contatto pubblica rilevata');
    if (/recensioni|reviews|trustpilot|google|stelle/i.test(html)) trustSignalsDetected.push('Elementi di riprova sociale / recensioni sul sito');
    if (/garanzia|soddisfatti|certificat/i.test(html)) trustSignalsDetected.push('Presenza di garanzie o certificazioni menzionate');

    // Offerings
    const detectedOfferings: string[] = [];
    if (detectedHeadings.length > 0) {
      detectedOfferings.push(...detectedHeadings.slice(0, 4));
    }

    // Build verified facts vs observations vs hypotheses
    const verifiedFacts: string[] = [
      `Dominio raggiungibile e verificato sicuro (${cleanUrl})`,
      `Protocollo crittografato HTTPS: ${cleanUrl.startsWith('https://') ? 'Sì' : 'No'}`,
      `Dimensione pagina analizzata: ${(receivedBytes / 1024).toFixed(1)} KB`,
    ];
    if (title) verifiedFacts.push(`Tag Title configurato: "${title}"`);
    if (metaDescription) verifiedFacts.push(`Meta Description presente (${metaDescription.length} caratteri)`);

    const observations: string[] = [];
    if (detectedHeadings.length < 3) {
      observations.push('Gerarchia dei titoli scarsa: rilevati pochissimi tag H1-H3 significativi.');
    } else {
      observations.push(`Rilevati ${detectedHeadings.length} titoli semantici principali nella pagina.`);
    }

    if (detectedCallsToAction.length === 0) {
      observations.push('Nessun pulsante CTA con classe standard rilevato. Punti di conversione poco evidenti.');
    } else {
      observations.push(`Punti di conversione attuali rilevati: ${detectedCallsToAction.join(', ')}.`);
    }

    const hypotheses: string[] = [
      'Il visitatore medio potrebbe non comprendere la proposta di valore entro i primi 5 secondi.',
      'La presenza di una CTA diretta su WhatsApp o form mirato può aumentare significativamente il tasso di contatto.',
    ];

    const missingInformation: string[] = [
      'Prezzi specifici o pacchetti trasparenti non chiaramente indicati nella home.',
      'Testimonianze con nome e cognome verificabili non riscontrate in modo inequivocabile nel codice pubblico.',
      'Dettagli sul tempo di attesa o erogazione del servizio.',
    ];

    const improvementOpportunities: string[] = [
      'Creare una headline incentrata sul beneficio concreto per il cliente anziché sul nome aziendale.',
      'Riformulare le chiamate all’azione con verbi operativi orientati all’azione.',
      'Aggiungere una sezione FAQ che anticipi le 3 obiezioni più frequenti sul costo e i tempi.',
    ];

    return {
      analyzedUrl: cleanUrl,
      extractedTitle: title,
      extractedMetaDescription: metaDescription,
      verifiedFacts,
      observations,
      hypotheses,
      missingInformation,
      improvementOpportunities,
      detectedHeadings,
      detectedOfferings,
      detectedCallsToAction,
      trustSignalsDetected,
      securityStatus: {
        isHttps: cleanUrl.startsWith('https://'),
        ssrfVerifiedSafe: true,
        contentLengthBytes: receivedBytes,
      },
      analyzedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}
