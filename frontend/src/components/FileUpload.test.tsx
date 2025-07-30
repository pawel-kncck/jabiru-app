import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUpload } from './FileUpload';

// Mock fetch
global.fetch = vi.fn();

describe('FileUpload', () => {
  const mockProjectId = 'test-project-123';
  const mockOnUploadSuccess = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'test-token');
  });

  it('renders upload dropzone', () => {
    render(
      <FileUpload 
        projectId={mockProjectId} 
        onUploadSuccess={mockOnUploadSuccess} 
      />
    );
    
    expect(screen.getByText(/drag and drop your CSV file here/i)).toBeInTheDocument();
    expect(screen.getByText(/Maximum file size: 10MB/i)).toBeInTheDocument();
  });

  it('handles file selection via click', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['test,data\\n1,2'], 'test.csv', { type: 'text/csv' });
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '123', filename: 'test.csv' })
    });
    
    render(
      <FileUpload 
        projectId={mockProjectId} 
        onUploadSuccess={mockOnUploadSuccess} 
      />
    );
    
    const input = screen.getByRole('button').parentElement?.querySelector('input[type="file"]');
    expect(input).toBeTruthy();
    
    if (input) {
      await user.upload(input as HTMLInputElement, mockFile);
    }
    
    await waitFor(() => {
      expect(mockOnUploadSuccess).toHaveBeenCalled();
    });
  });

  it('validates file type', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    
    render(
      <FileUpload 
        projectId={mockProjectId} 
        onUploadSuccess={mockOnUploadSuccess} 
      />
    );
    
    const input = screen.getByRole('button').parentElement?.querySelector('input[type="file"]');
    
    if (input) {
      await user.upload(input as HTMLInputElement, mockFile);
    }
    
    expect(screen.getByText(/File type not allowed/i)).toBeInTheDocument();
    expect(mockOnUploadSuccess).not.toHaveBeenCalled();
  });

  it('validates file size', async () => {
    const user = userEvent.setup();
    const largeContent = new Array(11 * 1024 * 1024).join('a'); // 11MB
    const mockFile = new File([largeContent], 'large.csv', { type: 'text/csv' });
    
    render(
      <FileUpload 
        projectId={mockProjectId} 
        onUploadSuccess={mockOnUploadSuccess} 
      />
    );
    
    const input = screen.getByRole('button').parentElement?.querySelector('input[type="file"]');
    
    if (input) {
      await user.upload(input as HTMLInputElement, mockFile);
    }
    
    expect(screen.getByText(/File too large/i)).toBeInTheDocument();
    expect(mockOnUploadSuccess).not.toHaveBeenCalled();
  });

  it('shows upload progress', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['test,data'], 'test.csv', { type: 'text/csv' });
    
    (global.fetch as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ id: '123', filename: 'test.csv' })
      }), 100))
    );
    
    render(
      <FileUpload 
        projectId={mockProjectId} 
        onUploadSuccess={mockOnUploadSuccess} 
      />
    );
    
    const input = screen.getByRole('button').parentElement?.querySelector('input[type="file"]');
    
    if (input) {
      await user.upload(input as HTMLInputElement, mockFile);
    }
    
    expect(screen.getByText(/Uploading/i)).toBeInTheDocument();
  });

  it('handles upload errors', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['test,data'], 'test.csv', { type: 'text/csv' });
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Upload failed' })
    });
    
    render(
      <FileUpload 
        projectId={mockProjectId} 
        onUploadSuccess={mockOnUploadSuccess} 
      />
    );
    
    const input = screen.getByRole('button').parentElement?.querySelector('input[type="file"]');
    
    if (input) {
      await user.upload(input as HTMLInputElement, mockFile);
    }
    
    await waitFor(() => {
      expect(screen.getByText(/Upload failed/i)).toBeInTheDocument();
    });
    
    expect(mockOnUploadSuccess).not.toHaveBeenCalled();
  });

  it('handles drag and drop', async () => {
    const mockFile = new File(['test,data'], 'test.csv', { type: 'text/csv' });
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '123', filename: 'test.csv' })
    });
    
    render(
      <FileUpload 
        projectId={mockProjectId} 
        onUploadSuccess={mockOnUploadSuccess} 
      />
    );
    
    const dropzone = screen.getByText(/drag and drop your CSV file here/i).parentElement!;
    
    fireEvent.dragEnter(dropzone);
    expect(dropzone).toHaveClass('dragging');
    
    fireEvent.dragLeave(dropzone);
    expect(dropzone).not.toHaveClass('dragging');
    
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [mockFile],
      },
    });
    
    await waitFor(() => {
      expect(mockOnUploadSuccess).toHaveBeenCalled();
    });
  });
});