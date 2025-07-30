import api from './api';

export interface FileInfo {
  id: string;
  filename: string;
  path: string;
  size: number;
  mime_type: string | null;
  project_id: string;
  uploaded_by: string;
  created_at: string;
}

export interface FileListResponse {
  files: FileInfo[];
  total: number;
}

export const filesService = {
  async uploadFile(projectId: string, file: File): Promise<FileInfo> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<FileInfo>(
      `/projects/${projectId}/files`,
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

  async listProjectFiles(
    projectId: string,
    skip = 0,
    limit = 100
  ): Promise<FileListResponse> {
    const response = await api.get<FileListResponse>(
      `/projects/${projectId}/files`,
      {
        params: { skip, limit },
      }
    );
    
    return response.data;
  },

  async deleteFile(fileId: string): Promise<void> {
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
};