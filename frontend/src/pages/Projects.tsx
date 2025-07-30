import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectService, Project, ProjectCreate } from '../services/projects';

const Projects: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState<ProjectCreate>({
    name: '',
    description: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getProjects();
      setProjects(response.projects);
      setTotal(response.total);
    } catch (err) {
      setError('Failed to load projects');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setCreateLoading(true);
      setError(null);
      const newProject = await projectService.createProject(createFormData);
      setProjects([newProject, ...projects]);
      setTotal(total + 1);
      setShowCreateForm(false);
      setCreateFormData({ name: '', description: '' });
    } catch (err) {
      setError('Failed to create project');
      console.error('Error creating project:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await projectService.deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      setTotal(total - 1);
    } catch (err) {
      setError('Failed to delete project');
      console.error('Error deleting project:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="loading">Loading projects...</div>;
  }

  return (
    <div className="projects-container">
      <h1>My Projects</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="projects-header">
        <p className="projects-count">Total Projects: {total}</p>
        <button 
          className="create-project-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'New Project'}
        </button>
      </div>

      {showCreateForm && (
        <form className="create-project-form" onSubmit={handleCreateProject}>
          <h3>Create New Project</h3>
          <div className="form-group">
            <label htmlFor="project-name">Project Name *</label>
            <input
              id="project-name"
              type="text"
              value={createFormData.name}
              onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
              placeholder="Enter project name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="project-description">Description</label>
            <textarea
              id="project-description"
              value={createFormData.description}
              onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
              placeholder="Enter project description (optional)"
              rows={3}
            />
          </div>
          <button type="submit" disabled={createLoading}>
            {createLoading ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="no-projects">
          <p>You don't have any projects yet.</p>
          <p>Click "New Project" to create your first project!</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <h3>{project.name}</h3>
              {project.description && <p className="project-description">{project.description}</p>}
              <div className="project-meta">
                <span>Created: {formatDate(project.created_at)}</span>
                <span>Updated: {formatDate(project.updated_at)}</span>
              </div>
              <div className="project-actions">
                <button 
                  className="view-btn"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  View
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteProject(project.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;