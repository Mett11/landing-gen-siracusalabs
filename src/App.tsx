/**
 * SIRACUSA LABS — AI Landing Studio
 * Main Application Orchestrator
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ModelProvider } from './context/ModelContext.js';
import { LoginScreen } from './components/LoginScreen.js';
import { Navbar } from './components/Navbar.js';
import { Dashboard } from './components/Dashboard.js';
import { ProjectEditor } from './components/editor/ProjectEditor.js';
import { NewProjectWizard } from './components/wizard/NewProjectWizard.js';
import { CloudflareSettingsModal } from './components/modals/CloudflareSettingsModal.js';
import { Project, BusinessBrief, SiteAnalysisReport } from './types/index.js';
import { api } from './services/api.js';

function MainApp() {
  const { user, isLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isCloudflareModalOpen, setIsCloudflareModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (user?.isAuthenticated) {
      loadProjects();
    }
  }, [user?.isAuthenticated]);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProjectId(project.id);
  };

  const handleBackToDashboard = () => {
    setSelectedProjectId(null);
  };

  const handleProjectUpdated = (updatedProject: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
  };

  const handleCreateProject = async (brief: BusinessBrief, siteReport?: SiteAnalysisReport) => {
    const newProj = await api.createProject(brief);
    if (siteReport) {
      newProj.analysisReport = siteReport;
    }
    // Also generate initial strategy
    try {
      const initialStrategy = await api.generateStrategy(brief, siteReport);
      newProj.strategy = initialStrategy;
      const initialCopy = await api.generateCopywriting(brief, initialStrategy);
      newProj.copywriting = initialCopy;
      const initialDesign = await api.generateDesignPlan(brief, initialStrategy);
      newProj.designPlan = initialDesign;
      const initialAstro = await api.generateAstroCode({
        brief,
        strategy: initialStrategy,
        copywriting: initialCopy,
        designPlan: initialDesign,
      });
      newProj.astroCode = initialAstro;
      newProj.auditResults = await api.runAudit({
        brief,
        copywriting: initialCopy,
        designPlan: initialDesign,
        astroCode: initialAstro,
      });
      await api.updateProject(newProj.id, newProj);
    } catch (err) {
      console.warn('Initial background generation deferred:', err);
    }

    await loadProjects();
    setSelectedProjectId(newProj.id);
  };

  const handleDeleteProject = async (id: string) => {
    await api.deleteProject(id);
    if (selectedProjectId === id) {
      setSelectedProjectId(null);
    }
    await loadProjects();
  };

  const handleExportZip = (projectId: string) => {
    window.location.href = `/api/projects/${projectId}/export`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user?.isAuthenticated) {
    return <LoginScreen />;
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null;

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar
        currentProject={selectedProject}
        onBackToDashboard={handleBackToDashboard}
        onOpenNewProjectModal={() => setIsWizardOpen(true)}
        onOpenCloudflareModal={() => setIsCloudflareModalOpen(true)}
      />

      <main className="flex-1">
        {selectedProject ? (
          <ProjectEditor
            project={selectedProject}
            onUpdateProject={handleProjectUpdated}
            onBackToDashboard={handleBackToDashboard}
            onOpenCloudflareModal={() => setIsCloudflareModalOpen(true)}
            onExportZip={handleExportZip}
          />
        ) : (
          <Dashboard
            projects={projects}
            onSelectProject={handleSelectProject}
            onNewProject={() => setIsWizardOpen(true)}
            onDeleteProject={handleDeleteProject}
            onExportZip={handleExportZip}
          />
        )}
      </main>

      {/* Creation Wizard Modal */}
      <NewProjectWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onProjectCreated={handleCreateProject}
      />

      {/* Cloudflare Settings Modal */}
      <CloudflareSettingsModal
        isOpen={isCloudflareModalOpen}
        onClose={() => setIsCloudflareModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ModelProvider>
        <MainApp />
      </ModelProvider>
    </AuthProvider>
  );
}
