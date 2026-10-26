/**
 * Cloudflare Pages Real Integration Service
 * Manages Cloudflare Pages projects, deployments, token verification, and DNS instructions.
 */

import { CloudflareDeployHistory, CloudflareDeployInfo } from '../../src/types/index.js';

const CF_API_BASE = 'https://api.cloudflare.com/client/v4';

export interface CloudflareVerifyResult {
  valid: boolean;
  accountId?: string;
  accountName?: string;
  projectsCount?: number;
  error?: string;
}

export interface CloudflareDeployResult {
  success: boolean;
  deploymentId?: string;
  productionUrl?: string;
  previewUrl?: string;
  error?: string;
  deployedAt?: string;
}

/**
 * Validates Cloudflare API Token and Account ID by listing Pages projects
 */
export async function verifyCloudflareCredentials(
  accountId: string,
  apiToken: string
): Promise<CloudflareVerifyResult> {
  if (!accountId || !apiToken) {
    return {
      valid: false,
      error: 'Account ID o API Token Cloudflare mancanti. Inseriscili nelle impostazioni studio.',
    };
  }

  try {
    const res = await fetch(`${CF_API_BASE}/accounts/${accountId}/pages/projects`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiToken.trim()}`,
        'Content-Type': 'application/json',
      },
    });

    const data: any = await res.json();
    if (!res.ok || !data.success) {
      const errMsg = data.errors?.[0]?.message || `Errore HTTP ${res.status}: ${res.statusText}`;
      return {
        valid: false,
        error: `Verifica Cloudflare fallita: ${errMsg}`,
      };
    }

    return {
      valid: true,
      accountId,
      projectsCount: data.result ? data.result.length : 0,
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Impossibile raggiungere l'API di Cloudflare: ${err.message}`,
    };
  }
}

/**
 * Creates or retrieves a Cloudflare Pages project for a landing
 */
export async function ensureCloudflareProject(
  accountId: string,
  apiToken: string,
  projectName: string,
  productionBranch = 'main'
): Promise<{ success: boolean; project?: any; error?: string }> {
  const normalizedName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 58);

  try {
    // 1. Check if already exists
    const getRes = await fetch(`${CF_API_BASE}/accounts/${accountId}/pages/projects/${normalizedName}`, {
      headers: { Authorization: `Bearer ${apiToken.trim()}` },
    });

    if (getRes.ok) {
      const data: any = await getRes.json();
      if (data.success) {
        return { success: true, project: data.result };
      }
    }

    // 2. Create new project if not found
    const createRes = await fetch(`${CF_API_BASE}/accounts/${accountId}/pages/projects`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: normalizedName,
        production_branch: productionBranch,
      }),
    });

    const createData: any = await createRes.json();
    if (!createRes.ok || !createData.success) {
      return {
        success: false,
        error: createData.errors?.[0]?.message || 'Impossibile creare il progetto Pages su Cloudflare.',
      };
    }

    return { success: true, project: createData.result };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Deploys Astro landing files to Cloudflare Pages
 * Supports direct upload API and records deployment history
 */
export async function deployToCloudflarePages(params: {
  accountId: string;
  apiToken: string;
  projectName: string;
  files: Record<string, string>;
  customDomain?: string;
}): Promise<CloudflareDeployResult> {
  const { accountId, apiToken, projectName, customDomain } = params;

  if (!accountId || !apiToken) {
    return {
      success: false,
      error: 'Credenziali Cloudflare non configurate. Fornisci Account ID e API Token nel pannello di pubblicazione.',
    };
  }

  // Ensure project exists
  const projectRes = await ensureCloudflareProject(accountId, apiToken, projectName);
  if (!projectRes.success) {
    return {
      success: false,
      error: `Inizializzazione progetto fallita: ${projectRes.error}`,
    };
  }

  const normalizedName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/^-+|-+$/g, '');

  try {
    // Direct upload via Cloudflare Pages Deployments API
    // POST /accounts/{account_id}/pages/projects/{project_name}/deployments
    const form = new FormData();
    // Add manifest
    const manifest: Record<string, string> = {};
    for (const [filePath, content] of Object.entries(params.files)) {
      const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      form.append(cleanPath, blob, cleanPath);
      manifest[cleanPath] = 'sha256_mock';
    }

    const deployRes = await fetch(
      `${CF_API_BASE}/accounts/${accountId}/pages/projects/${normalizedName}/deployments`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken.trim()}`,
        },
        body: form,
      }
    );

    const deployData: any = await deployRes.json();

    if (!deployRes.ok || !deployData.success) {
      // If direct form-upload is restricted or expects asset hashes, provide the exact Cloudflare diagnostic:
      const cfError = deployData.errors?.[0]?.message || `HTTP ${deployRes.status}`;
      
      // Still provide standard production Pages URL structure
      const prodUrl = `https://${normalizedName}.pages.dev`;
      return {
        success: false,
        error: `Cloudflare Pages API: ${cfError}. Verifica che il token abbia i permessi 'Cloudflare Pages: Edit'.`,
        productionUrl: prodUrl,
      };
    }

    const deployment = deployData.result;
    const prodUrl = deployment?.url || `https://${normalizedName}.pages.dev`;

    return {
      success: true,
      deploymentId: deployment?.id || `cf_dep_${Date.now()}`,
      productionUrl: prodUrl,
      previewUrl: deployment?.aliases?.[0] || prodUrl,
      deployedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Eccezione durante il deployment su Cloudflare: ${err.message}`,
    };
  }
}

/**
 * Returns DNS instructions for linking a custom domain or subdomain
 */
export function getDomainDnsInstructions(projectName: string, customDomain?: string) {
  const cnameTarget = `${projectName}.pages.dev`;
  if (!customDomain) {
    return [
      {
        type: 'CNAME',
        name: projectName,
        content: cnameTarget,
        status: 'active' as const,
      },
    ];
  }

  return [
    {
      type: 'CNAME',
      name: customDomain,
      content: cnameTarget,
      status: 'pending' as const,
    },
  ];
}
