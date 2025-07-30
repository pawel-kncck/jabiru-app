import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectService } from '../services/projects';
import { filesService } from '../services/files';
import type { FileInfo } from '../services/files';
import { canvasService } from '../services/canvas';
import type { Canvas } from '../services/canvas';
import { FileUpload } from '../components/FileUpload';
import { DataPreview } from '../components/DataPreview';
import type { Project } from '../services/projects';

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);
  const [showCreateCanvas, setShowCreateCanvas] = useState(false);
  const [canvasName, setCanvasName] = useState('');
  const [creatingCanvas, setCreatingCanvas] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const [projectData, filesData, canvasesData] = await Promise.all([
        projectService.getProject(projectId),
        filesService.listProjectFiles(projectId),
        canvasService.listCanvases(projectId),
      ]);

      setProject(projectData);
      setFiles(filesData.files);
      setCanvases(canvasesData.canvases);
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
      setFiles(files.filter((f) => f.id !== fileId));
    } catch (err) {
      alert('Failed to delete file');
      console.error(err);
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleCreateCanvas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canvasName.trim() || !projectId) return;

    try {
      setCreatingCanvas(true);
      const newCanvas = await canvasService.createCanvas(projectId, {
        name: canvasName.trim(),
      });
      setCanvases([...canvases, newCanvas]);
      setCanvasName('');
      setShowCreateCanvas(false);
    } catch (err) {
      alert('Failed to create canvas');
      console.error(err);
    } finally {
      setCreatingCanvas(false);
    }
  };

  const handleDeleteCanvas = async (canvasId: string) => {
    if (!window.confirm('Are you sure you want to delete this canvas?')) {
      return;
    }

    try {
      await canvasService.deleteCanvas(canvasId);
      setCanvases(canvases.filter((c) => c.id !== canvasId));
    } catch (err) {
      alert('Failed to delete canvas');
      console.error(err);
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
        <button className="back-button" onClick={() => navigate('/projects')}>
          ← Back to Projects
        </button>
        <h1>{project.name}</h1>
        {project.description && (
          <p className="project-description">{project.description}</p>
        )}
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
            <p className="no-files">
              No files uploaded yet. Upload a CSV file to get started!
            </p>
          ) : (
            <div className="files-list">
              {files.map((file) => (
                <div key={file.id} className="file-item">
                  <div className="file-info">
                    <span className="file-icon">📄</span>
                    <div className="file-details">
                      <h3>{file.filename}</h3>
                      <p>
                        {filesService.formatFileSize(file.size)} • Uploaded{' '}
                        {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="file-actions">
                    {filesService.isCSVFile(file.filename) && (
                      <button
                        className="button-secondary"
                        onClick={() => setPreviewFileId(file.id)}
                      >
                        Preview
                      </button>
                    )}
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

        <section className="canvases-section">
          <div className="section-header">
            <h2>Canvases ({canvases.length})</h2>
            <button
              className="button-primary"
              onClick={() => setShowCreateCanvas(!showCreateCanvas)}
            >
              {showCreateCanvas ? 'Cancel' : 'New Canvas'}
            </button>
          </div>

          {showCreateCanvas && (
            <form className="create-canvas-form" onSubmit={handleCreateCanvas}>
              <input
                type="text"
                placeholder="Canvas name"
                value={canvasName}
                onChange={(e) => setCanvasName(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={creatingCanvas}
                className="button-primary"
              >
                {creatingCanvas ? 'Creating...' : 'Create Canvas'}
              </button>
            </form>
          )}

          {canvases.length === 0 ? (
            <p className="no-canvases">
              No canvases yet. Create a canvas to start analyzing your data!
            </p>
          ) : (
            <div className="canvases-grid">
              {canvases.map((canvas) => (
                <div key={canvas.id} className="canvas-card">
                  <h3>{canvas.name}</h3>
                  <p className="canvas-meta">
                    Created {new Date(canvas.created_at).toLocaleDateString()}
                  </p>
                  <div className="canvas-actions">
                    <button
                      className="button-primary"
                      onClick={() => navigate(`/canvas/${canvas.id}`)}
                    >
                      Open
                    </button>
                    <button
                      className="button-danger"
                      onClick={() => handleDeleteCanvas(canvas.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {previewFileId && (
        <DataPreview
          fileId={previewFileId}
          onClose={() => setPreviewFileId(null)}
        />
      )}
    </div>
  );
}
