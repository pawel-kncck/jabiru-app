import api from './api';
import type { FileMetadata, FilePreviewResponse, ColumnStatistics } from '../types/file';

export const filesService = {
  async uploadFile(file: File, projectId: number): Promise<FileMetadata> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId.toString());
    
    const response = await api.post<FileMetadata>(
      `/files/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        },
      }
    );
    
    return response.data;
  },

  async getProjectFiles(projectId: number): Promise<{ data: FileMetadata[] }> {
    const response = await api.get<FileMetadata[]>(
      `/files/project/${projectId}`
    );
    
    return { data: response.data };
  },

  async deleteFile(fileId: number): Promise<void> {
    await api.delete(`/files/${fileId}`);
  },

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  },

  isCSVFile(filename: string): boolean {
    return this.getFileExtension(filename) === 'csv';
  },

  async getFilePreview(fileId: number, rows = 100): Promise<FilePreviewResponse> {
    const response = await api.get<FilePreviewResponse>(`/files/${fileId}/preview`, {
      params: { rows },
    });
    return response.data;
  },

  async getColumnStatistics(fileId: number, columnName: string): Promise<ColumnStatistics> {
    const response = await api.get<ColumnStatistics>(
      `/files/${fileId}/column-stats/${columnName}`
    );
    return response.data;
  },
};