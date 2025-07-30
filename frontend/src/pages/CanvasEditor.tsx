import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { canvasService, Canvas } from '../services/canvas';
import { projectService } from '../services/projects';
import { CanvasArea } from '../components/Canvas/CanvasArea';
import { BlockLibrary } from '../components/Canvas/BlockLibrary';
import { PropertiesPanel } from '../components/Canvas/PropertiesPanel';
import type { Project } from '../services/projects';
import './CanvasEditor.css';

export interface Block {
  id: string;
  type: 'text' | 'chart';
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: any;
}

export function CanvasEditor() {
  const { canvasId } = useParams<{ canvasId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (canvasId) {
      loadCanvas();
    }
  }, [canvasId]);

  const loadCanvas = async () => {
    if (!canvasId) return;
    
    try {
      setLoading(true);
      const canvasData = await canvasService.getCanvas(canvasId);
      setCanvas(canvasData);
      setBlocks(canvasData.content_json.blocks || []);
      setLastSaved(new Date(canvasData.updated_at));
      
      // Load project data
      const projectData = await projectService.getProject(canvasData.project_id);
      setProject(projectData);
    } catch (err) {
      setError('Failed to load canvas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlocksChange = (newBlocks: Block[]) => {
    setBlocks(newBlocks);
    setHasUnsavedChanges(true);
  };

  const handleDeleteBlock = () => {
    if (selectedBlockId) {
      const newBlocks = blocks.filter(b => b.id !== selectedBlockId);
      setBlocks(newBlocks);
      setSelectedBlockId(null);
      setHasUnsavedChanges(true);
    }
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete block
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedBlockId && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleDeleteBlock();
        }
      }
      
      // Manual save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockId, handleSave]);

  const handleSave = async (isRetry = false) => {
    if (!canvasId || isSaving) return;
    
    try {
      setIsSaving(true);
      setSaveError(null);
      await canvasService.saveCanvasContent(canvasId, blocks);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (err) {
      console.error('Failed to save canvas:', err);
      setSaveError('Failed to save changes');
      
      // Retry once after a delay
      if (!isRetry) {
        setTimeout(() => {
          handleSave(true);
        }, 3000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save after 2 seconds of inactivity
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    
    const timer = setTimeout(() => {
      handleSave();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [blocks, hasUnsavedChanges]);

  // Update last saved display every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSaved(prev => prev ? new Date(prev) : null);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatLastSaved = (date: Date | null) => {
    if (!date) return '';
    
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div className="canvas-editor-loading">Loading canvas...</div>;
  }

  if (error || !canvas || !project) {
    return (
      <div className="canvas-editor-error">
        <p>{error || 'Canvas not found'}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="canvas-editor">
      <div className="canvas-header">
        <div className="canvas-header-left">
          <button 
            className="back-button"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            ← Back to {project.name}
          </button>
          <h1>{canvas.name}</h1>
          <span className={`save-indicator ${saveError ? 'error' : isSaving ? 'saving' : hasUnsavedChanges ? 'unsaved' : 'saved'}`}>
            {saveError ? saveError : isSaving ? 'Saving...' : hasUnsavedChanges ? 'Unsaved changes' : `All changes saved ${formatLastSaved(lastSaved)}`}
          </span>
        </div>
        <div className="canvas-header-right">
          <button 
            className="save-button"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
          >
            Save
          </button>
        </div>
      </div>
      
      <div className="canvas-content">
        <BlockLibrary />
        
        <CanvasArea
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          onBlocksChange={handleBlocksChange}
          onBlockSelect={setSelectedBlockId}
        />
        
        <PropertiesPanel
          block={blocks.find(b => b.id === selectedBlockId)}
          onBlockUpdate={(updatedBlock) => {
            const newBlocks = blocks.map(b => 
              b.id === updatedBlock.id ? updatedBlock : b
            );
            handleBlocksChange(newBlocks);
          }}
        />
      </div>
    </div>
  );
}