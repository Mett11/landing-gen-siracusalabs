/**
 * AI & Generator Router
 * Orchestrates crawler, Gemini conversion strategist, copywriting, art direction, and audit.
 */

import { Router, Request, Response } from 'express';
import { safelyAnalyzeWebsite } from '../services/crawler.js';
import {
  generateStrategyWithAi,
  generateCopywritingWithAi,
  generateDesignPlanWithAi,
  fetchAvailableGoogleModels,
} from '../services/gemini.js';
import { generateAstroProject } from '../services/astroGenerator.js';
import { runQualityAudit } from '../services/audit.js';
import { BusinessBrief } from '../../src/types/index.js';

export const aiRouter = Router();

// GET /api/ai/models - Live fetch from Google Gemini API
aiRouter.get('/models', async (_req: Request, res: Response) => {
  try {
    const models = await fetchAvailableGoogleModels();
    res.json(models);
  } catch (err: any) {
    res.status(500).json({ error: `Impossibile recuperare i modelli Google: ${err.message}` });
  }
});

// POST /api/ai/analyze-site
aiRouter.post('/analyze-site', async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL del sito richiesto' });
  }

  try {
    const report = await safelyAnalyzeWebsite(url);
    res.json(report);
  } catch (err: any) {
    res.status(422).json({ error: `Analisi non riuscita: ${err.message}` });
  }
});

// POST /api/ai/strategy
aiRouter.post('/strategy', async (req: Request, res: Response) => {
  const { brief, siteReport, model } = req.body;
  if (!brief || !brief.businessName) {
    return res.status(400).json({ error: 'Dati del brief mancanti' });
  }

  try {
    const strategy = await generateStrategyWithAi(brief, siteReport, model);
    res.json(strategy);
  } catch (err: any) {
    res.status(500).json({ error: `Generazione strategia fallita: ${err.message}` });
  }
});

// POST /api/ai/copy
aiRouter.post('/copy', async (req: Request, res: Response) => {
  const { brief, strategy, sectionType, model } = req.body;
  if (!brief || !strategy) {
    return res.status(400).json({ error: 'Brief e strategia approvata richiesti per il copywriting' });
  }

  try {
    const copyPlan = await generateCopywritingWithAi(brief, strategy, sectionType, model);
    res.json(copyPlan);
  } catch (err: any) {
    res.status(500).json({ error: `Generazione copy fallita: ${err.message}` });
  }
});

// POST /api/ai/design
aiRouter.post('/design', async (req: Request, res: Response) => {
  const { brief, strategy, model } = req.body;
  if (!brief) {
    return res.status(400).json({ error: 'Dati brief richiesti per la direzione artistica' });
  }

  try {
    const designPlan = await generateDesignPlanWithAi(brief, strategy, model);
    res.json(designPlan);
  } catch (err: any) {
    res.status(500).json({ error: `Art direction fallita: ${err.message}` });
  }
});

// POST /api/ai/generate-astro
aiRouter.post('/generate-astro', (req: Request, res: Response) => {
  const { brief, strategy, copywriting, designPlan } = req.body;
  if (!brief) {
    return res.status(400).json({ error: 'Brief mancante' });
  }

  try {
    const code = generateAstroProject({ brief, strategy, copywriting, designPlan });
    res.json(code);
  } catch (err: any) {
    res.status(500).json({ error: `Generazione codice Astro fallita: ${err.message}` });
  }
});

// POST /api/ai/audit
aiRouter.post('/audit', (req: Request, res: Response) => {
  const { brief, copywriting, designPlan, astroCode } = req.body;
  if (!brief) {
    return res.status(400).json({ error: 'Brief mancante' });
  }

  try {
    const report = runQualityAudit({ brief, copywriting, designPlan, astroCode });
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: `Audit fallito: ${err.message}` });
  }
});
