import api from './api';

export interface Canvas {
  id: string;
  name: string;
  project_id: string;
  content_json: {
    blocks: any[];
    version: string;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CanvasCreate {
  name: string;
}

export interface CanvasUpdate {
  name?: string;
  content_json?: {
    blocks: any[];
    version: string;
  };
}

export interface CanvasList {
  canvases: Canvas[];
  total: number;
}

export const canvasService = {
  async createCanvas(projectId: string, data: CanvasCreate): Promise<Canvas> {
    const response = await api.post<Canvas>(
      `/projects/${projectId}/canvases`,
      data
    );
    return response.data;
  },

  async listCanvases(
    projectId: string,
    skip = 0,
    limit = 100
  ): Promise<CanvasList> {
    const response = await api.get<CanvasList>(
      `/projects/${projectId}/canvases`,
      {
        params: { skip, limit },
      }
    );
    return response.data;
  },

  async getCanvas(canvasId: string): Promise<Canvas> {
    const response = await api.get<Canvas>(`/canvases/${canvasId}`);
    return response.data;
  },

  async updateCanvas(
    canvasId: string,
    data: CanvasUpdate
  ): Promise<Canvas> {
    const response = await api.put<Canvas>(`/canvases/${canvasId}`, data);
    return response.data;
  },

  async deleteCanvas(canvasId: string): Promise<void> {
    await api.delete(`/canvases/${canvasId}`);
  },

  // Helper function to auto-save canvas content
  async saveCanvasContent(
    canvasId: string,
    blocks: any[]
  ): Promise<Canvas> {
    return this.updateCanvas(canvasId, {
      content_json: {
        blocks,
        version: '1.0',
      },
    });
  },
};