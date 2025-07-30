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

  const handleSave = async () => {
    if (!canvasId || isSaving) return;
    
    try {
      setIsSaving(true);
      await canvasService.saveCanvasContent(canvasId, blocks);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Failed to save canvas:', err);
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
          <span className={`save-indicator ${isSaving ? 'saving' : hasUnsavedChanges ? 'unsaved' : 'saved'}`}>
            {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
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