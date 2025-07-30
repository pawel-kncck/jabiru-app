import { describe, it, expect, vi, beforeEach } from 'vitest';
import { filesService } from './files';
import api from './api';

vi.mock('./api');

describe('filesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('uploads a file successfully', async () => {
      const mockFile = new File(['test data'], 'test.csv', { type: 'text/csv' });
      const mockResponse = {
        id: '123',
        filename: 'test.csv',
        path: 'project-123/test.csv',
        size: 9,
        mime_type: 'text/csv',
        project_id: 'project-123',
        uploaded_by: 'user-123',
        created_at: '2025-07-30T12:00:00Z'
      };
      
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse });
      
      const result = await filesService.uploadFile('project-123', mockFile);
      
      expect(api.post).toHaveBeenCalledWith(
        '/projects/project-123/files',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: expect.any(Function)
        })
      );
      
      expect(result).toEqual(mockResponse);
    });
  });

  describe('listProjectFiles', () => {
    it('lists project files', async () => {
      const mockResponse = {
        files: [
          {
            id: '123',
            filename: 'test.csv',
            path: 'project-123/test.csv',
            size: 1024,
            mime_type: 'text/csv',
            project_id: 'project-123',
            uploaded_by: 'user-123',
            created_at: '2025-07-30T12:00:00Z'
          }
        ],
        total: 1
      };
      
      vi.mocked(api.get).mockResolvedValue({ data: mockResponse });
      
      const result = await filesService.listProjectFiles('project-123');
      
      expect(api.get).toHaveBeenCalledWith(
        '/projects/project-123/files',
        { params: { skip: 0, limit: 100 } }
      );
      
      expect(result).toEqual(mockResponse);
    });
    
    it('lists files with pagination', async () => {
      const mockResponse = { files: [], total: 0 };
      
      vi.mocked(api.get).mockResolvedValue({ data: mockResponse });
      
      await filesService.listProjectFiles('project-123', 10, 20);
      
      expect(api.get).toHaveBeenCalledWith(
        '/projects/project-123/files',
        { params: { skip: 10, limit: 20 } }
      );
    });
  });

  describe('deleteFile', () => {
    it('deletes a file', async () => {
      vi.mocked(api.delete).mockResolvedValue({});
      
      await filesService.deleteFile('file-123');
      
      expect(api.delete).toHaveBeenCalledWith('/files/file-123');
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(filesService.formatFileSize(0)).toBe('0 Bytes');
      expect(filesService.formatFileSize(1024)).toBe('1 KB');
      expect(filesService.formatFileSize(1048576)).toBe('1 MB');
      expect(filesService.formatFileSize(1073741824)).toBe('1 GB');
      expect(filesService.formatFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('getFileExtension', () => {
    it('gets file extension', () => {
      expect(filesService.getFileExtension('test.csv')).toBe('csv');
      expect(filesService.getFileExtension('file.name.txt')).toBe('txt');
      expect(filesService.getFileExtension('noextension')).toBe('');
    });
  });

  describe('isCSVFile', () => {
    it('checks if file is CSV', () => {
      expect(filesService.isCSVFile('test.csv')).toBe(true);
      expect(filesService.isCSVFile('test.CSV')).toBe(false);
      expect(filesService.isCSVFile('test.txt')).toBe(false);
    });
  });
});