import api from '../services/api';

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
}

export interface ProjectList {
  projects: Project[];
  total: number;
}

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
