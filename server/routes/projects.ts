/**
 * Projects Router
 * Manages CRUD operations, version snapshots, and standalone Astro project zip exports.
 */

import { Router, Request, Response } from 'express';
import { ZipArchive } from 'archiver';
import {
  listProjects,
  getProject,
  saveProject,
  deleteProject,
  createVersionSnapshot,
  restoreVersionSnapshot,
} from '../storage/db.js';
import { Project, BusinessBrief } from '../../src/types/index.js';
import { generateAstroProject } from '../services/astroGenerator.js';
import { runQualityAudit } from '../services/audit.js';

export const projectsRouter = Router();

// GET /api/projects
projectsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const projects = await listProjects();
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: `Errore caricamento progetti: ${err.message}` });
  }
});

// GET /api/projects/:id
projectsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await getProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Progetto non trovato' });
    }
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: `Errore recupero progetto: ${err.message}` });
  }
});

// POST /api/projects
projectsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const brief: BusinessBrief = req.body.brief;
    if (!brief || !brief.businessName) {
      return res.status(400).json({ error: 'Dati del brief mancanti o incompleti' });
    }

    const cleanSlug = (brief.slug || brief.businessName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newId = `proj_${Date.now()}_${cleanSlug.slice(0, 15)}`;

    const newProject: Project = {
      id: newId,
      brief: {
        ...brief,
        slug: cleanSlug,
      },
      status: 'draft',
      cloudflare: {
        projectName: `${cleanSlug}-landing`,
        subdomain: brief.desiredSubdomain || cleanSlug,
        status: 'none',
        history: [],
      },
      versions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Pre-generate Astro code and initial audit
    const astroCode = generateAstroProject({ brief: newProject.brief });
    newProject.astroCode = astroCode;
    newProject.auditResults = runQualityAudit({
      brief: newProject.brief,
      astroCode,
    });

    const saved = await saveProject(newProject);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: `Errore creazione progetto: ${err.message}` });
  }
});

// PUT /api/projects/:id
projectsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await getProject(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Progetto non trovato' });
    }

    const updatedData: Partial<Project> = req.body;
    const merged: Project = {
      ...existing,
      ...updatedData,
      id: existing.id, // Immutable ID
      updatedAt: new Date().toISOString(),
    };

    // Re-run quality audit if copywriting or code changed
    if (updatedData.copywriting || updatedData.astroCode || updatedData.brief || updatedData.designPlan) {
      merged.auditResults = runQualityAudit({
        brief: merged.brief,
        copywriting: merged.copywriting,
        designPlan: merged.designPlan,
        astroCode: merged.astroCode,
      });
    }

    const saved = await saveProject(merged);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: `Errore aggiornamento progetto: ${err.message}` });
  }
});

// DELETE /api/projects/:id
projectsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const confirmed = req.query.confirmed === 'true';
    if (!confirmed) {
      return res.status(400).json({
        error: 'Cancellazione bloccata: è richiesta conferma esplicita (?confirmed=true).',
      });
    }

    const success = await deleteProject(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Progetto non trovato' });
    }

    res.json({ success: true, message: 'Progetto rimosso definitivamente.' });
  } catch (err: any) {
    res.status(500).json({ error: `Errore eliminazione progetto: ${err.message}` });
  }
});

// POST /api/projects/:id/versions
projectsRouter.post('/:id/versions', async (req: Request, res: Response) => {
  try {
    const { description } = req.body;
    const version = await createVersionSnapshot(req.params.id, description);
    if (!version) {
      return res.status(404).json({ error: 'Progetto non trovato' });
    }
    res.status(201).json(version);
  } catch (err: any) {
    res.status(500).json({ error: `Errore salvataggio versione: ${err.message}` });
  }
});

// POST /api/projects/:id/versions/:versionId/restore
projectsRouter.post('/:id/versions/:versionId/restore', async (req: Request, res: Response) => {
  try {
    const restored = await restoreVersionSnapshot(req.params.id, req.params.versionId);
    if (!restored) {
      return res.status(404).json({ error: 'Progetto o versione non trovata' });
    }
    res.json(restored);
  } catch (err: any) {
    res.status(500).json({ error: `Errore ripristino versione: ${err.message}` });
  }
});

// GET /api/projects/:id/export - Download standalone Astro project ZIP archive
projectsRouter.get('/:id/export', async (req: Request, res: Response) => {
  try {
    const project = await getProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Progetto non trovato' });
    }

    // Ensure Astro code exists
    const astro = project.astroCode || generateAstroProject({
      brief: project.brief,
      strategy: project.strategy,
      copywriting: project.copywriting,
      designPlan: project.designPlan,
    });

    const archive = new ZipArchive({ zlib: { level: 9 } });

    res.attachment(`${project.brief.slug || 'astro-landing'}.zip`);
    archive.pipe(res);

    // Root files
    archive.append(astro.packageJson, { name: 'package.json' });
    archive.append(astro.astroConfig, { name: 'astro.config.mjs' });
    archive.append(astro.indexAstro, { name: 'src/pages/index.astro' });
    archive.append(astro.layoutAstro, { name: 'src/layouts/Layout.astro' });
    archive.append(astro.globalCss, { name: 'src/styles/global.css' });
    archive.append(astro.robotsTxt, { name: 'public/robots.txt' });
    archive.append(astro.sitemapXml, { name: 'public/sitemap.xml' });

    // Components
    for (const [compName, compCode] of Object.entries(astro.components)) {
      archive.append(compCode, { name: `src/components/${compName}` });
    }

    // Build instructions
    const cfProj = project.cloudflare?.projectName || project.brief.slug || 'landing-project';
    const readme = `# ${project.brief.businessName} — Landing Page Astro
Generata con SIRACUSA LABS AI Landing Studio.

## Istruzioni di esecuzione in locale
\`\`\`bash
npm install
npm run dev
\`\`\`

## Build e deploy Cloudflare Pages
\`\`\`bash
npm run build
npx wrangler pages deploy dist --project-name=${cfProj}
\`\`\`
`;
    archive.append(readme, { name: 'README.md' });

    await archive.finalize();
  } catch (err: any) {
    res.status(500).json({ error: `Errore esportazione zip: ${err.message}` });
  }
});
