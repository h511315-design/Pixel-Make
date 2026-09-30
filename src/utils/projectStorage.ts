import { Grid, SavedProject } from '../types/pixel';
import { TEMPLATES } from '../constants/templates';
import { generateProjectThumbnail } from './pixelMath';

const PROJECTS_STORAGE_KEY = 'pixelcraft_projects_v2';
const ACTIVE_PROJECT_ID_KEY = 'pixelcraft_active_project_id';

/**
 * Initializes default starter projects if none exist
 */
function createDefaultProjects(): SavedProject[] {
  const now = Date.now();
  const starters = TEMPLATES.slice(0, 3);
  return starters.map((t, idx) => ({
    id: `project_default_${t.id}_${idx}`,
    title: t.name,
    width: t.width,
    height: t.height,
    grid: t.data,
    thumbnail: generateProjectThumbnail(t.data, 96),
    createdAt: now - (3 - idx) * 3600000,
    updatedAt: now - (3 - idx) * 3600000,
  }));
}

/**
 * Loads all saved projects from localStorage
 */
export function loadSavedProjects(): SavedProject[] {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) {
      const defaults = createDefaultProjects();
      saveProjectsToStorage(defaults);
      return defaults;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse saved projects from localStorage', err);
  }
  const defaults = createDefaultProjects();
  saveProjectsToStorage(defaults);
  return defaults;
}

/**
 * Persists project list to localStorage
 */
export function saveProjectsToStorage(projects: SavedProject[]): boolean {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    return true;
  } catch (err) {
    console.error('Failed to save projects to localStorage (quota exceeded?)', err);
    return false;
  }
}

/**
 * Get the currently active project ID
 */
export function getActiveProjectId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_PROJECT_ID_KEY);
  } catch {
    return null;
  }
}

/**
 * Set the currently active project ID
 */
export function setActiveProjectId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_PROJECT_ID_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_PROJECT_ID_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Save or update a project
 */
export function upsertProject(
  projectData: {
    id?: string;
    title: string;
    width: number;
    height: number;
    grid: Grid;
  },
  existingProjects: SavedProject[]
): { savedProject: SavedProject; updatedList: SavedProject[] } {
  const now = Date.now();
  const thumbnail = generateProjectThumbnail(projectData.grid, 96);

  if (projectData.id) {
    const index = existingProjects.findIndex(p => p.id === projectData.id);
    if (index >= 0) {
      const updatedProject: SavedProject = {
        ...existingProjects[index],
        title: projectData.title.trim() || '未命名作品',
        width: projectData.width,
        height: projectData.height,
        grid: projectData.grid,
        thumbnail,
        updatedAt: now,
      };

      const updatedList = [...existingProjects];
      updatedList[index] = updatedProject;
      // Bring updated project to top of list
      const reorderedList = [
        updatedProject,
        ...updatedList.filter((_, i) => i !== index),
      ];
      saveProjectsToStorage(reorderedList);
      setActiveProjectId(updatedProject.id);
      return { savedProject: updatedProject, updatedList: reorderedList };
    }
  }

  // Create new project
  const newProject: SavedProject = {
    id: `project_${now}_${Math.random().toString(36).substring(2, 7)}`,
    title: projectData.title.trim() || '未命名作品',
    width: projectData.width,
    height: projectData.height,
    grid: projectData.grid,
    thumbnail,
    createdAt: now,
    updatedAt: now,
  };

  const updatedList = [newProject, ...existingProjects];
  saveProjectsToStorage(updatedList);
  setActiveProjectId(newProject.id);
  return { savedProject: newProject, updatedList };
}

/**
 * Delete a project by ID
 */
export function removeProject(
  id: string,
  existingProjects: SavedProject[]
): SavedProject[] {
  const updatedList = existingProjects.filter(p => p.id !== id);
  saveProjectsToStorage(updatedList);
  if (getActiveProjectId() === id) {
    setActiveProjectId(null);
  }
  return updatedList;
}

/**
 * Duplicate a project
 */
export function duplicateProject(
  id: string,
  existingProjects: SavedProject[]
): { newProject: SavedProject; updatedList: SavedProject[] } | null {
  const target = existingProjects.find(p => p.id === id);
  if (!target) return null;

  const now = Date.now();
  const clonedGrid = target.grid.map(row => [...row]);
  const newProject: SavedProject = {
    id: `project_${now}_${Math.random().toString(36).substring(2, 7)}`,
    title: `${target.title} (副本)`,
    width: target.width,
    height: target.height,
    grid: clonedGrid,
    thumbnail: target.thumbnail,
    createdAt: now,
    updatedAt: now,
  };

  const updatedList = [newProject, ...existingProjects];
  saveProjectsToStorage(updatedList);
  return { newProject, updatedList };
}

/**
 * Rename a project
 */
export function renameProject(
  id: string,
  newTitle: string,
  existingProjects: SavedProject[]
): SavedProject[] {
  const updatedList = existingProjects.map(p => {
    if (p.id === id) {
      return {
        ...p,
        title: newTitle.trim() || '未命名作品',
        updatedAt: Date.now(),
      };
    }
    return p;
  });
  saveProjectsToStorage(updatedList);
  return updatedList;
}

/**
 * Export single project as downloadable JSON / .pixelcraft file
 */
export function downloadProjectFile(project: SavedProject): void {
  const payload = {
    app: 'PixelCraft',
    version: '1.0',
    type: 'pixelcraft_single_project',
    project,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = project.title.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'pixel-project';
  a.download = `${safeName}.pixelcraft`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export all projects backup
 */
export function downloadAllProjectsBackup(projects: SavedProject[]): void {
  const payload = {
    app: 'PixelCraft',
    version: '1.0',
    type: 'pixelcraft_all_projects_backup',
    exportedAt: new Date().toISOString(),
    count: projects.length,
    projects,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `pixelcraft-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse uploaded file into single project or backup array
 */
export function parseImportedProjectFile(
  content: string
): { type: 'single'; project: SavedProject } | { type: 'backup'; projects: SavedProject[] } | null {
  try {
    const data = JSON.parse(content);
    // Single project format
    if (data.type === 'pixelcraft_single_project' && data.project && Array.isArray(data.project.grid)) {
      return { type: 'single', project: data.project };
    }
    // Backup format
    if (data.type === 'pixelcraft_all_projects_backup' && Array.isArray(data.projects)) {
      return { type: 'backup', projects: data.projects };
    }
    // Generic direct SavedProject format
    if (data.grid && Array.isArray(data.grid) && typeof data.width === 'number' && typeof data.height === 'number') {
      const now = Date.now();
      const proj: SavedProject = {
        id: data.id || `project_${now}_${Math.random().toString(36).substring(2, 7)}`,
        title: data.title || '匯入作品',
        width: data.width,
        height: data.height,
        grid: data.grid,
        thumbnail: data.thumbnail || generateProjectThumbnail(data.grid, 96),
        createdAt: data.createdAt || now,
        updatedAt: now,
      };
      return { type: 'single', project: proj };
    }
  } catch (err) {
    console.error('Failed to parse project file', err);
  }
  return null;
}
