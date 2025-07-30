import React, { useState, useRef, useEffect } from 'react';
import type { Block } from '../../pages/CanvasEditor';
import { TextBlock } from '../Blocks/TextBlock';
import './DraggableBlock.css';

interface DraggableBlockProps {
  block: Block;
  isSelected: boolean;
  onBlockUpdate: (block: Block) => void;
  onBlockSelect: (blockId: string) => void;
  gridSize?: number;
}

export function DraggableBlock({ 
  block, 
  isSelected, 
  onBlockUpdate, 
  onBlockSelect,
  gridSize = 10 
}: DraggableBlockProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const blockRef = useRef<HTMLDivElement>(null);

  const snapToGrid = (value: number): number => {
    return Math.round(value / gridSize) * gridSize;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('block-content')) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - block.position.x,
        y: e.clientY - block.position.y
      });
      onBlockSelect(block.id);
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isResizing) {
        const newX = snapToGrid(e.clientX - dragStart.x);
        const newY = snapToGrid(e.clientY - dragStart.y);
        
        onBlockUpdate({
          ...block,
          position: { x: Math.max(0, newX), y: Math.max(0, newY) }
        });
      } else if (isResizing && resizeHandle) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        let newWidth = block.size.width;
        let newHeight = block.size.height;
        let newX = block.position.x;
        let newY = block.position.y;

        if (resizeHandle.includes('right')) {
          newWidth = snapToGrid(block.size.width + deltaX);
        }
        if (resizeHandle.includes('left')) {
          newWidth = snapToGrid(block.size.width - deltaX);
          newX = snapToGrid(block.position.x + deltaX);
        }
        if (resizeHandle.includes('bottom')) {
          newHeight = snapToGrid(block.size.height + deltaY);
        }
        if (resizeHandle.includes('top')) {
          newHeight = snapToGrid(block.size.height - deltaY);
          newY = snapToGrid(block.position.y + deltaY);
        }

        onBlockUpdate({
          ...block,
          position: { x: Math.max(0, newX), y: Math.max(0, newY) },
          size: { 
            width: Math.max(50, newWidth), 
            height: Math.max(50, newHeight) 
          }
        });
        
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, block, onBlockUpdate, resizeHandle, gridSize]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isSelected) {
      const step = e.shiftKey ? gridSize * 5 : gridSize;
      let newPosition = { ...block.position };
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newPosition.y = Math.max(0, newPosition.y - step);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newPosition.y = newPosition.y + step;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newPosition.x = Math.max(0, newPosition.x - step);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newPosition.x = newPosition.x + step;
          break;
        default:
          return;
      }
      
      onBlockUpdate({ ...block, position: newPosition });
    }
  };

  return (
    <div
      ref={blockRef}
      className={`draggable-block ${block.type} ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: block.position.x,
        top: block.position.y,
        width: block.size.width,
        height: block.size.height,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onBlockSelect(block.id);
      }}
      onKeyDown={handleKeyDown}
      tabIndex={isSelected ? 0 : -1}
    >
      <div className="block-content">
        {block.type === 'text' ? (
          <TextBlock 
            content={block.content.text || ''}
            onContentChange={(newContent) => {
              onBlockUpdate({
                ...block,
                content: { ...block.content, text: newContent }
              });
            }}
            isSelected={isSelected}
          />
        ) : (
          <div className="chart-content">
            <span className="chart-icon">📊</span>
            <p>Chart: {block.content.chartType || 'bar'}</p>
          </div>
        )}
      </div>
      
      {isSelected && (
        <>
          <div className="resize-handle top-left" onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')} />
          <div className="resize-handle top-right" onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')} />
          <div className="resize-handle bottom-left" onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')} />
          <div className="resize-handle bottom-right" onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')} />
          <div className="resize-handle top" onMouseDown={(e) => handleResizeMouseDown(e, 'top')} />
          <div className="resize-handle right" onMouseDown={(e) => handleResizeMouseDown(e, 'right')} />
          <div className="resize-handle bottom" onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')} />
          <div className="resize-handle left" onMouseDown={(e) => handleResizeMouseDown(e, 'left')} />
        </>
      )}
    </div>
  );
}