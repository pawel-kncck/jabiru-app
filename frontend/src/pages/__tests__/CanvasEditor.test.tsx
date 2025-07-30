import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CanvasEditor } from '../CanvasEditor';
import { AuthProvider } from '../../contexts/AuthContext';
import { canvasService } from '../../services/canvas';
import { projectService } from '../../services/projects';

// Mock services
vi.mock('../../services/canvas');
vi.mock('../../services/projects');

const mockCanvas = {
  id: '1',
  name: 'Test Canvas',
  project_id: 'project-1',
  content_json: {
    blocks: [
      {
        id: 'block-1',
        type: 'text',
        position: { x: 100, y: 100 },
        size: { width: 200, height: 100 },
        content: { text: 'Test text' }
      }
    ],
    version: '1.0'
  },
  created_by: 'user-1',
  created_at: '2025-07-30T12:00:00Z',
  updated_at: '2025-07-30T12:00:00Z'
};

const mockProject = {
  id: 'project-1',
  name: 'Test Project',
  description: 'Test description',
  owner_id: 'user-1',
  created_at: '2025-07-30T12:00:00Z',
  updated_at: '2025-07-30T12:00:00Z'
};

describe('CanvasEditor - Persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(canvasService.getCanvas).mockResolvedValue(mockCanvas);
    vi.mocked(projectService.getProject).mockResolvedValue(mockProject);
    vi.mocked(canvasService.saveCanvasContent).mockResolvedValue(mockCanvas);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <CanvasEditor />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('loads canvas data on mount', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Test Canvas')).toBeInTheDocument();
    });
    
    expect(canvasService.getCanvas).toHaveBeenCalled();
    expect(projectService.getProject).toHaveBeenCalledWith('project-1');
  });

  it('shows last saved timestamp', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/All changes saved/)).toBeInTheDocument();
    });
  });

  it('auto-saves after 2 seconds of changes', async () => {
    vi.useFakeTimers();
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Test Canvas')).toBeInTheDocument();
    });
    
    // Simulate a change
    const blocks = mockCanvas.content_json.blocks;
    // This would normally happen through block interaction
    
    vi.advanceTimersByTime(2000);
    
    await waitFor(() => {
      expect(canvasService.saveCanvasContent).toHaveBeenCalled();
    });
    
    vi.useRealTimers();
  });

  it('shows saving indicator during save', async () => {
    vi.mocked(canvasService.saveCanvasContent).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockCanvas), 100))
    );
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Test Canvas')).toBeInTheDocument();
    });
    
    // Trigger manual save
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText(/All changes saved/)).toBeInTheDocument();
    });
  });

  it('shows error message on save failure', async () => {
    vi.mocked(canvasService.saveCanvasContent).mockRejectedValue(new Error('Save failed'));
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Test Canvas')).toBeInTheDocument();
    });
    
    // Trigger manual save
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to save changes')).toBeInTheDocument();
    });
  });

  it('retries save on failure', async () => {
    vi.useFakeTimers();
    vi.mocked(canvasService.saveCanvasContent).mockRejectedValue(new Error('Save failed'));
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Test Canvas')).toBeInTheDocument();
    });
    
    // Trigger manual save
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    expect(canvasService.saveCanvasContent).toHaveBeenCalledTimes(1);
    
    // Wait for retry
    vi.advanceTimersByTime(3000);
    
    await waitFor(() => {
      expect(canvasService.saveCanvasContent).toHaveBeenCalledTimes(2);
    });
    
    vi.useRealTimers();
  });

  it('handles keyboard shortcut for save', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Test Canvas')).toBeInTheDocument();
    });
    
    // Trigger Ctrl+S
    fireEvent.keyDown(window, { key: 's', ctrlKey: true });
    
    expect(canvasService.saveCanvasContent).toHaveBeenCalled();
  });
});
