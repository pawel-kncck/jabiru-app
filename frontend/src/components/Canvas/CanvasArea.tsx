import React, { useRef, useState } from 'react';
import type { Block } from '../../pages/CanvasEditor';
import { DraggableBlock } from './DraggableBlock';
import './CanvasArea.css';

interface CanvasAreaProps {
  blocks: Block[];
  selectedBlockId: string | null;
  onBlocksChange: (blocks: Block[]) => void;
  onBlockSelect: (blockId: string | null) => void;
}

export function CanvasArea({ blocks, selectedBlockId, onBlocksChange, onBlockSelect }: CanvasAreaProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.target === canvasRef.current) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const blockType = e.dataTransfer.getData('blockType') as 'text' | 'chart';
    if (!blockType) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: blockType,
      position: {
        x: e.clientX - rect.left - 100, // Center the block horizontally
        y: e.clientY - rect.top - 50    // Center the block vertically
      },
      size: {
        width: 200,
        height: blockType === 'text' ? 100 : 200
      },
      content: blockType === 'text' ? { text: 'New text block' } : { chartType: 'bar' }
    };

    onBlocksChange([...blocks, newBlock]);
    onBlockSelect(newBlock.id);
  };

  const handleBlockClick = (blockId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onBlockSelect(blockId);
  };

  const handleCanvasClick = () => {
    onBlockSelect(null);
  };

  return (
    <div 
      ref={canvasRef}
      className={`canvas-area ${isDraggingOver ? 'dragging-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
    >
      {blocks.length === 0 && !isDraggingOver && (
        <div className="canvas-empty-state">
          <p>Drag blocks from the left sidebar to get started</p>
        </div>
      )}
      
      {isDraggingOver && (
        <div className="drop-indicator">
          <p>Drop here to add block</p>
        </div>
      )}

      {blocks.map(block => (
        <DraggableBlock
          key={block.id}
          block={block}
          isSelected={selectedBlockId === block.id}
          onBlockUpdate={(updatedBlock) => {
            const newBlocks = blocks.map(b => 
              b.id === updatedBlock.id ? updatedBlock : b
            );
            onBlocksChange(newBlocks);
          }}
          onBlockSelect={onBlockSelect}
        />
      ))}
    </div>
  );
}