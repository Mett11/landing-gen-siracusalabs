/**
 * Frontend Typed API Client
 */

import {
  BusinessBrief,
  ConversionStrategy,
  CopywritingPlan,
  DesignPlan,
  Project,
  ProjectVersion,
  SiteAnalysisReport,
  QualityAuditReport,
  CloudflareDeployInfo,
  AstroProjectCode,
  GeminiModelInfo,
} from '../types/index.js';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('siracusa_studio_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Errore HTTP ${response.status}: ${response.statusText}`;
    try {
      const data = await response.json();
      if (data.error) errorMsg = data.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: async (email: string, passwordOrPin?: string) => {
    return request<{ success: boolean; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, passwordOrPin }),
    });
  },

  getMe: async () => {
    return request<{ isAuthenticated: boolean; email?: string; name?: string; role?: string }>('/auth/me');
  },

  logout: async () => {
    return request<{ success: boolean }>('/auth/logout', { method: 'POST' });
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    return request<Project[]>('/projects');
  },

  getProject: async (id: string): Promise<Project> => {
    return request<Project>(`/projects/${id}`);
  },

  createProject: async (brief: BusinessBrief): Promise<Project> => {
    return request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify({ brief }),
    });
  },

  updateProject: async (id: string, data: Partial<Project>): Promise<Project> => {
    return request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteProject: async (id: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/projects/${id}?confirmed=true`, {
      method: 'DELETE',
    });
  },

  createVersion: async (projectId: string, description: string): Promise<ProjectVersion> => {
    return request<ProjectVersion>(`/projects/${projectId}/versions`, {
      method: 'POST',
      body: JSON.stringify({ description }),
    });
  },

  restoreVersion: async (projectId: string, versionId: string): Promise<Project> => {
    return request<Project>(`/projects/${projectId}/versions/${versionId}/restore`, {
      method: 'POST',
    });
  },

  // AI & Generation
  getAvailableModels: async (): Promise<GeminiModelInfo[]> => {
    return request<GeminiModelInfo[]>('/ai/models');
  },

  analyzeWebsite: async (url: string): Promise<SiteAnalysisReport> => {
    return request<SiteAnalysisReport>('/ai/analyze-site', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },

  generateStrategy: async (
    brief: BusinessBrief,
    siteReport?: SiteAnalysisReport,
    model?: string
  ): Promise<ConversionStrategy> => {
    return request<ConversionStrategy>('/ai/strategy', {
      method: 'POST',
      body: JSON.stringify({ brief, siteReport, model }),
    });
  },

  generateCopywriting: async (
    brief: BusinessBrief,
    strategy: ConversionStrategy,
    sectionType?: string,
    model?: string
  ): Promise<CopywritingPlan> => {
    return request<CopywritingPlan>('/ai/copy', {
      method: 'POST',
      body: JSON.stringify({ brief, strategy, sectionType, model }),
    });
  },

  generateDesignPlan: async (
    brief: BusinessBrief,
    strategy?: ConversionStrategy,
    model?: string
  ): Promise<DesignPlan> => {
    return request<DesignPlan>('/ai/design', {
      method: 'POST',
      body: JSON.stringify({ brief, strategy, model }),
    });
  },

  generateAstroCode: async (params: {
    brief: BusinessBrief;
    strategy?: ConversionStrategy;
    copywriting?: CopywritingPlan;
    designPlan?: DesignPlan;
  }): Promise<AstroProjectCode> => {
    return request<AstroProjectCode>('/ai/generate-astro', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  runAudit: async (params: {
    brief: BusinessBrief;
    copywriting?: CopywritingPlan;
    designPlan?: DesignPlan;
    astroCode?: AstroProjectCode;
  }): Promise<QualityAuditReport> => {
    return request<QualityAuditReport>('/ai/audit', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Cloudflare
  getCloudflareSettings: async () => {
    return request<{
      accountId: string;
      hasToken: boolean;
      maskedToken: string;
      baseDomain: string;
      zoneId: string;
    }>('/cloudflare/settings');
  },

  saveCloudflareSettings: async (settings: { accountId: string; apiToken?: string; baseDomain?: string; zoneId?: string }) => {
    return request<{ success: boolean; message: string; hasToken: boolean }>('/cloudflare/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  },

  verifyCloudflare: async (accountId?: string, apiToken?: string) => {
    return request<{ valid: boolean; projectsCount?: number; error?: string }>('/cloudflare/verify', {
      method: 'POST',
      body: JSON.stringify({ accountId, apiToken }),
    });
  },

  deployToCloudflare: async (params: {
    projectId: string;
    customDomain?: string;
    overrideProjectName?: string;
  }): Promise<{ success: boolean; project: CloudflareDeployInfo; error?: string }> => {
    return request<{ success: boolean; project: CloudflareDeployInfo; error?: string }>('/cloudflare/deploy', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};
