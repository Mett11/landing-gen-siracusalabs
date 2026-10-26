/**
 * Cloudflare Router
 * Manages secure credentials, connection tests, and Pages deployments.
 */

import { Router, Request, Response } from 'express';
import {
  getCloudflareSettings,
  saveCloudflareSettings,
  getProject,
  saveProject,
} from '../storage/db.js';
import {
  verifyCloudflareCredentials,
  deployToCloudflarePages,
  getDomainDnsInstructions,
} from '../services/cloudflare.js';
import { generateAstroProject } from '../services/astroGenerator.js';
import { runQualityAudit } from '../services/audit.js';

export const cloudflareRouter = Router();

// GET /api/cloudflare/settings - Returns masked credentials
cloudflareRouter.get('/settings', async (_req: Request, res: Response) => {
  try {
    const settings = await getCloudflareSettings();
    const hasToken = Boolean(settings.apiToken && settings.apiToken.trim().length > 0);
    const maskedToken = hasToken
      ? `${settings.apiToken.slice(0, 4)}••••••••${settings.apiToken.slice(-4)}`
      : '';

    res.json({
      accountId: settings.accountId || '',
      hasToken,
      maskedToken,
      baseDomain: settings.baseDomain || 'pages.dev',
      zoneId: settings.zoneId || '',
    });
  } catch (err: any) {
    res.status(500).json({ error: `Errore recupero impostazioni: ${err.message}` });
  }
});

// POST /api/cloudflare/settings - Saves server-side credentials
cloudflareRouter.post('/settings', async (req: Request, res: Response) => {
  try {
    const { accountId, apiToken, baseDomain, zoneId } = req.body;
    const current = await getCloudflareSettings();

    const updated = {
      accountId: accountId !== undefined ? accountId.trim() : current.accountId,
      apiToken: apiToken !== undefined && apiToken.trim().length > 0 ? apiToken.trim() : current.apiToken,
      baseDomain: baseDomain || current.baseDomain || 'pages.dev',
      zoneId: zoneId !== undefined ? zoneId.trim() : current.zoneId,
    };

    await saveCloudflareSettings(updated);

    res.json({
      success: true,
      message: 'Impostazioni Cloudflare salvate con successo sul server.',
      hasToken: Boolean(updated.apiToken && updated.apiToken.length > 0),
    });
  } catch (err: any) {
    res.status(500).json({ error: `Errore salvataggio credenziali: ${err.message}` });
  }
});

// POST /api/cloudflare/verify - Tests connection
cloudflareRouter.post('/verify', async (req: Request, res: Response) => {
  try {
    const { accountId, apiToken } = req.body;
    const settings = await getCloudflareSettings();

    const targetAccountId = accountId || settings.accountId;
    const targetToken = apiToken || settings.apiToken;

    if (!targetAccountId || !targetToken) {
      return res.status(400).json({
        valid: false,
        error: 'Account ID o API Token non impostati. Configurali prima di verificare la connessione.',
      });
    }

    const result = await verifyCloudflareCredentials(targetAccountId, targetToken);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ valid: false, error: err.message });
  }
});

// POST /api/cloudflare/deploy - Deploys landing project to Cloudflare Pages
cloudflareRouter.post('/deploy', async (req: Request, res: Response) => {
  try {
    const { projectId, customDomain, overrideProjectName } = req.body;
    if (!projectId) {
      return res.status(400).json({ error: 'ID Progetto mancante' });
    }

    const project = await getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Progetto non trovato' });
    }

    // 1. Check Quality Audit: BLOCK DEPLOY if blocking errors exist!
    const auditReport = project.auditResults || runQualityAudit({
      brief: project.brief,
      copywriting: project.copywriting,
      designPlan: project.designPlan,
      astroCode: project.astroCode,
    });

    if (!auditReport.passed) {
      const blockingList = auditReport.checks
        .filter((c) => c.severity === 'blocking' && c.status === 'fail')
        .map((c) => c.name)
        .join(', ');

      return res.status(422).json({
        error: `Deploy bloccato dall'audit di qualità. Risolvi i problemi critici prima di pubblicare: ${blockingList}`,
        auditReport,
      });
    }

    // 2. Ensure Astro code is compiled
    const astro = project.astroCode || generateAstroProject({
      brief: project.brief,
      strategy: project.strategy,
      copywriting: project.copywriting,
      designPlan: project.designPlan,
    });

    // 3. Retrieve Cloudflare credentials
    const settings = await getCloudflareSettings();
    if (!settings.accountId || !settings.apiToken) {
      return res.status(400).json({
        error: 'Credenziali Cloudflare mancanti. Inserisci Account ID e API Token nel pannello di configurazione Cloudflare.',
        needsCredentials: true,
      });
    }

    const projectName = (overrideProjectName || project.cloudflare.projectName || project.brief.slug)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/^-+|-+$/g, '');

    // Map all project files into upload payload
    const filesToDeploy: Record<string, string> = {
      'package.json': astro.packageJson,
      'astro.config.mjs': astro.astroConfig,
      'src/pages/index.astro': astro.indexAstro,
      'src/layouts/Layout.astro': astro.layoutAstro,
      'src/styles/global.css': astro.globalCss,
      'public/robots.txt': astro.robotsTxt,
      'public/sitemap.xml': astro.sitemapXml,
    };

    for (const [compName, compCode] of Object.entries(astro.components)) {
      filesToDeploy[`src/components/${compName}`] = compCode;
    }

    // 4. Run deployment to Cloudflare
    const deployResult = await deployToCloudflarePages({
      accountId: settings.accountId,
      apiToken: settings.apiToken,
      projectName,
      files: filesToDeploy,
      customDomain,
    });

    // Update project state
    const now = new Date().toISOString();
    const deploymentId = deployResult.deploymentId || `dep_${Date.now()}`;
    const prodUrl = deployResult.productionUrl || `https://${projectName}.pages.dev`;

    const historyItem = {
      deploymentId,
      timestamp: now,
      url: prodUrl,
      status: deployResult.success ? ('success' as const) : ('failed' as const),
      commitMessage: `Deploy landing ${project.brief.landingType}: ${project.brief.businessName}`,
    };

    project.cloudflare = {
      projectName,
      subdomain: project.brief.desiredSubdomain || projectName,
      customDomain,
      latestDeploymentId: deploymentId,
      productionUrl: prodUrl,
      previewUrl: deployResult.previewUrl || prodUrl,
      deployedAt: now,
      status: deployResult.success ? 'success' : 'failed',
      dnsInstructions: getDomainDnsInstructions(projectName, customDomain),
      history: [historyItem, ...(project.cloudflare.history || [])],
    };

    if (deployResult.success) {
      project.status = 'published';
    }

    await saveProject(project);

    res.json({
      success: deployResult.success,
      project: project.cloudflare,
      error: deployResult.error,
    });
  } catch (err: any) {
    res.status(500).json({ error: `Eccezione durante il deploy: ${err.message}` });
  }
});
