import React from 'react';
import './BlockLibrary.css';

interface BlockType {
  id: string;
  type: 'text' | 'chart';
  name: string;
  icon: string;
  description: string;
}

const blockTypes: BlockType[] = [
  {
    id: 'text',
    type: 'text',
    name: 'Text Block',
    icon: '📝',
    description: 'Add text, notes, or markdown content'
  },
  {
    id: 'chart',
    type: 'chart',
    name: 'Chart Block',
    icon: '📊',
    description: 'Visualize data with various chart types'
  }
];

export function BlockLibrary() {
  const handleDragStart = (e: React.DragEvent, blockType: BlockType) => {
    e.dataTransfer.setData('blockType', blockType.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="block-library">
      <h3>Blocks</h3>
      <div className="block-types">
        {blockTypes.map(blockType => (
          <div
            key={blockType.id}
            className="block-type-item"
            draggable
            onDragStart={(e) => handleDragStart(e, blockType)}
          >
            <span className="block-icon">{blockType.icon}</span>
            <div className="block-info">
              <h4>{blockType.name}</h4>
              <p>{blockType.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}