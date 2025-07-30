import api from './api';
import type {
  Project,
  ProjectCreate,
  ProjectUpdate,
  ProjectList,
} from '../types/project';

export type { Project, ProjectCreate, ProjectUpdate, ProjectList };

export const projectService = {
  async createProject(data: ProjectCreate): Promise<Project> {
    const response = await api.post<Project>('/projects/', data);
    return response.data;
  },

  async getProjects(skip = 0, limit = 10): Promise<ProjectList> {
    const response = await api.get<ProjectList>('/projects/', {
      params: { skip, limit },
    });
    return response.data;
  },

  async getProject(projectId: string): Promise<Project> {
    const response = await api.get<Project>(`/projects/${projectId}`);
    return response.data;
  },

  async updateProject(
    projectId: string,
    data: ProjectUpdate
  ): Promise<Project> {
    const response = await api.put<Project>(`/projects/${projectId}`, data);
    return response.data;
  },

  async deleteProject(projectId: string): Promise<void> {
    await api.delete(`/projects/${projectId}`);
  },
};
