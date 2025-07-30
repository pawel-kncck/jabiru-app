import React, { useState, useEffect } from 'react';
import type { Block } from '../../pages/CanvasEditor';
import './PropertiesPanel.css';

interface PropertiesPanelProps {
  block: Block | undefined;
  onBlockUpdate: (block: Block) => void;
}

export function PropertiesPanel({ block, onBlockUpdate }: PropertiesPanelProps) {
  const [localContent, setLocalContent] = useState<any>({});

  useEffect(() => {
    if (block) {
      setLocalContent(block.content);
    }
  }, [block]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = { ...localContent, text: e.target.value };
    setLocalContent(newContent);
    
    if (block) {
      onBlockUpdate({
        ...block,
        content: newContent
      });
    }
  };

  const handleChartTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newContent = { ...localContent, chartType: e.target.value };
    setLocalContent(newContent);
    
    if (block) {
      onBlockUpdate({
        ...block,
        content: newContent
      });
    }
  };

  const handlePositionChange = (axis: 'x' | 'y', value: string) => {
    const numValue = parseInt(value) || 0;
    if (block) {
      onBlockUpdate({
        ...block,
        position: {
          ...block.position,
          [axis]: numValue
        }
      });
    }
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseInt(value) || 100;
    if (block) {
      onBlockUpdate({
        ...block,
        size: {
          ...block.size,
          [dimension]: Math.max(50, numValue) // Minimum size of 50px
        }
      });
    }
  };

  if (!block) {
    return (
      <div className="properties-panel">
        <div className="properties-empty">
          <p>Select a block to view its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="properties-panel">
      <h3>Properties</h3>
      
      <div className="property-section">
        <h4>Block Type</h4>
        <p className="block-type-label">
          {block.type === 'text' ? '📝 Text Block' : '📊 Chart Block'}
        </p>
      </div>

      <div className="property-section">
        <h4>Position</h4>
        <div className="property-row">
          <label>
            X:
            <input
              type="number"
              value={block.position.x}
              onChange={(e) => handlePositionChange('x', e.target.value)}
            />
          </label>
          <label>
            Y:
            <input
              type="number"
              value={block.position.y}
              onChange={(e) => handlePositionChange('y', e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="property-section">
        <h4>Size</h4>
        <div className="property-row">
          <label>
            Width:
            <input
              type="number"
              value={block.size.width}
              onChange={(e) => handleSizeChange('width', e.target.value)}
              min="50"
            />
          </label>
          <label>
            Height:
            <input
              type="number"
              value={block.size.height}
              onChange={(e) => handleSizeChange('height', e.target.value)}
              min="50"
            />
          </label>
        </div>
      </div>

      <div className="property-section">
        <h4>Content</h4>
        {block.type === 'text' ? (
          <div className="property-field">
            <label>
              Text:
              <textarea
                value={localContent.text || ''}
                onChange={handleTextChange}
                rows={4}
                placeholder="Enter text content..."
              />
            </label>
          </div>
        ) : (
          <div className="property-field">
            <label>
              Chart Type:
              <select 
                value={localContent.chartType || 'bar'}
                onChange={handleChartTypeChange}
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="scatter">Scatter Plot</option>
              </select>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}