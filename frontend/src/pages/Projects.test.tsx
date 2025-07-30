import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Projects from './Projects';
import { AuthContext } from '../contexts/AuthContext';
import { projectService } from '../services/projects';

// Mock the project service
vi.mock('../services/projects', () => ({
  projectService: {
    getProjects: vi.fn(),
    createProject: vi.fn(),
    deleteProject: vi.fn(),
  },
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockProjects = [
  {
    id: '1',
    name: 'Project 1',
    description: 'Description 1',
    owner_id: '123',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Project 2',
    description: null,
    owner_id: '123',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
];

const renderWithAuth = (component: React.ReactElement) => {
  const authValue = {
    user: { id: '123', username: 'testuser', email: 'test@example.com' },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  };

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authValue}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Projects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(projectService.getProjects).mockImplementation(() => new Promise(() => {}));
    renderWithAuth(<Projects />);
    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
  });

  it('should display projects after loading', async () => {
    vi.mocked(projectService.getProjects).mockResolvedValue({
      projects: mockProjects,
      total: 2,
    });

    renderWithAuth(<Projects />);

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
      expect(screen.getByText('Total Projects: 2')).toBeInTheDocument();
    });
  });

  it('should display no projects message when empty', async () => {
    vi.mocked(projectService.getProjects).mockResolvedValue({
      projects: [],
      total: 0,
    });

    renderWithAuth(<Projects />);

    await waitFor(() => {
      expect(screen.getByText("You don't have any projects yet.")).toBeInTheDocument();
      expect(screen.getByText('Click "New Project" to create your first project!')).toBeInTheDocument();
    });
  });

  it('should toggle create form when New Project button is clicked', async () => {
    vi.mocked(projectService.getProjects).mockResolvedValue({
      projects: [],
      total: 0,
    });

    renderWithAuth(<Projects />);

    await waitFor(() => {
      expect(screen.getByText('New Project')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('New Project'));
    expect(screen.getByText('Create New Project')).toBeInTheDocument();
    expect(screen.getByLabelText('Project Name *')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();
  });

  it('should create a new project', async () => {
    const newProject = {
      id: '3',
      name: 'New Project',
      description: 'New Description',
      owner_id: '123',
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
    };

    vi.mocked(projectService.getProjects).mockResolvedValue({
      projects: mockProjects,
      total: 2,
    });
    vi.mocked(projectService.createProject).mockResolvedValue(newProject);

    renderWithAuth(<Projects />);

    await waitFor(() => {
      expect(screen.getByText('New Project')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('New Project'));

    const nameInput = screen.getByLabelText('Project Name *');
    const descriptionInput = screen.getByLabelText('Description');

    fireEvent.change(nameInput, { target: { value: 'New Project' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });

    fireEvent.click(screen.getByText('Create Project'));

    await waitFor(() => {
      expect(projectService.createProject).toHaveBeenCalledWith({
        name: 'New Project',
        description: 'New Description',
      });
      expect(screen.getByText('Total Projects: 3')).toBeInTheDocument();
    });
  });

  it('should handle create project error', async () => {
    vi.mocked(projectService.getProjects).mockResolvedValue({
      projects: [],
      total: 0,
    });
    vi.mocked(projectService.createProject).mockRejectedValue(new Error('Failed'));

    renderWithAuth(<Projects />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('New Project'));
    });

    const nameInput = screen.getByLabelText('Project Name *');
    fireEvent.change(nameInput, { target: { value: 'Test' } });
    fireEvent.click(screen.getByText('Create Project'));

    await waitFor(() => {
      expect(screen.getByText('Failed to create project')).toBeInTheDocument();
    });
  });

  it('should delete a project with confirmation', async () => {
    vi.mocked(projectService.getProjects).mockResolvedValue({
      projects: mockProjects,
      total: 2,
    });
    vi.mocked(projectService.deleteProject).mockResolvedValue(undefined);

    // Mock window.confirm
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithAuth(<Projects />);

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this project?');

    await waitFor(() => {
      expect(projectService.deleteProject).toHaveBeenCalledWith('1');
      expect(screen.queryByText('Project 1')).not.toBeInTheDocument();
      expect(screen.getByText('Total Projects: 1')).toBeInTheDocument();
    });

    mockConfirm.mockRestore();
  });

  it('should not delete project when cancelled', async () => {
    vi.mocked(projectService.getProjects).mockResolvedValue({
      projects: mockProjects,
      total: 2,
    });

    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderWithAuth(<Projects />);

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(projectService.deleteProject).not.toHaveBeenCalled();
    expect(screen.getByText('Project 1')).toBeInTheDocument();

    mockConfirm.mockRestore();
  });

  it('should navigate to project details when View is clicked', async () => {
    vi.mocked(projectService.getProjects).mockResolvedValue({
      projects: mockProjects,
      total: 2,
    });

    renderWithAuth(<Projects />);

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/projects/1');
  });

  it('should format dates correctly', async () => {
    vi.mocked(projectService.getProjects).mockResolvedValue({
      projects: mockProjects,
      total: 2,
    });

    renderWithAuth(<Projects />);

    await waitFor(() => {
      expect(screen.getByText(/Created: Jan 1, 2024/)).toBeInTheDocument();
    });
  });
});