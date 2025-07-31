import api from './api';
import type {
  Project,
  ProjectCreate,
  ProjectUpdate,
  ProjectList,
} from '../types/project';

export type { Project, ProjectCreate, ProjectUpdate, ProjectList };

export const projectsService = {
  async createProject(data: ProjectCreate): Promise<Project> {
    const response = await api.post<Project>('/projects/', data);
    return response.data;
  },

  async getProjects(skip = 0, limit = 10): Promise<{ data: Project[] }> {
    const response = await api.get<ProjectList>('/projects/', {
      params: { skip, limit },
    });
    return { data: response.data.projects };
  },

  async getProject(projectId: number): Promise<{ data: Project }> {
    const response = await api.get<Project>(`/projects/${projectId}`);
    return { data: response.data };
  },

  async updateProject(
    projectId: number,
    data: ProjectUpdate
  ): Promise<Project> {
    const response = await api.put<Project>(`/projects/${projectId}`, data);
    return response.data;
  },

  async deleteProject(projectId: number): Promise<void> {
    await api.delete(`/projects/${projectId}`);
  },
};
