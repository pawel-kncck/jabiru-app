import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectService } from '../services/projects';
import { filesService, FileInfo } from '../services/files';
import { FileUpload } from '../components/FileUpload';
import type { Project } from '../services/projects';

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const [projectData, filesData] = await Promise.all([
        projectService.getProject(projectId),
        filesService.listProjectFiles(projectId)
      ]);
      
      setProject(projectData);
      setFiles(filesData.files);
    } catch (err) {
      setError('Failed to load project data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploadSuccess = () => {
    loadProjectData();
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }
    
    try {
      setDeletingFileId(fileId);
      await filesService.deleteFile(fileId);
      setFiles(files.filter(f => f.id !== fileId));
    } catch (err) {
      alert('Failed to delete file');
      console.error(err);
    } finally {
      setDeletingFileId(null);
    }
  };

  if (loading) {
    return <div className="loading">Loading project...</div>;
  }

  if (error || !project) {
    return (
      <div className="error">
        <p>{error || 'Project not found'}</p>
        <button onClick={() => navigate('/projects')}>Back to Projects</button>
      </div>
    );
  }

  return (
    <div className="project-detail">
      <div className="project-header">
        <button 
          className="back-button"
          onClick={() => navigate('/projects')}
        >
          ← Back to Projects
        </button>
        <h1>{project.name}</h1>
        {project.description && <p className="project-description">{project.description}</p>}
      </div>

      <div className="project-content">
        <section className="file-upload-section">
          <h2>Upload Data</h2>
          <FileUpload 
            projectId={project.id}
            onUploadSuccess={handleFileUploadSuccess}
          />
        </section>

        <section className="files-section">
          <h2>Uploaded Files ({files.length})</h2>
          {files.length === 0 ? (
            <p className="no-files">No files uploaded yet. Upload a CSV file to get started!</p>
          ) : (
            <div className="files-list">
              {files.map(file => (
                <div key={file.id} className="file-item">
                  <div className="file-info">
                    <span className="file-icon">📄</span>
                    <div className="file-details">
                      <h3>{file.filename}</h3>
                      <p>
                        {filesService.formatFileSize(file.size)} • 
                        Uploaded {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button 
                      className="button-secondary"
                      onClick={() => console.log('Preview:', file.id)}
                    >
                      Preview
                    </button>
                    <button 
                      className="button-danger"
                      onClick={() => handleDeleteFile(file.id)}
                      disabled={deletingFileId === file.id}
                    >
                      {deletingFileId === file.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}