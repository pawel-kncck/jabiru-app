export interface Project {
  id: number;
  name: string;
  description?: string;
  context?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  context?: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  context?: string;
}

export interface ProjectList {
  projects: Project[];
  total: number;
}
