import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BlockLibrary } from '../BlockLibrary';
import { CanvasArea } from '../CanvasArea';
import { PropertiesPanel } from '../PropertiesPanel';
import type { Block } from '../../../pages/CanvasEditor';

describe('BlockLibrary', () => {
  it('renders block types', () => {
    render(<BlockLibrary />);
    
    expect(screen.getByText('Blocks')).toBeInTheDocument();
    expect(screen.getByText('Text Block')).toBeInTheDocument();
    expect(screen.getByText('Chart Block')).toBeInTheDocument();
  });

  it('handles drag start', () => {
    render(<BlockLibrary />);
    
    const textBlock = screen.getByText('Text Block').closest('.block-type-item');
    const dataTransfer = {
      setData: vi.fn(),
      effectAllowed: ''
    };
    
    fireEvent.dragStart(textBlock!, { dataTransfer });
    
    expect(dataTransfer.setData).toHaveBeenCalledWith('blockType', 'text');
    expect(dataTransfer.effectAllowed).toBe('copy');
  });
});

describe('CanvasArea', () => {
  const mockProps = {
    blocks: [],
    selectedBlockId: null,
    onBlocksChange: vi.fn(),
    onBlockSelect: vi.fn()
  };

  it('shows empty state when no blocks', () => {
    render(<CanvasArea {...mockProps} />);
    
    expect(screen.getByText('Drag blocks from the left sidebar to get started')).toBeInTheDocument();
  });

  it('renders blocks', () => {
    const blocks: Block[] = [
      {
        id: '1',
        type: 'text',
        position: { x: 100, y: 100 },
        size: { width: 200, height: 100 },
        content: { text: 'Test text' }
      }
    ];
    
    render(<CanvasArea {...mockProps} blocks={blocks} />);
    
    expect(screen.getByText('Test text')).toBeInTheDocument();
  });

  it('handles block selection', () => {
    const blocks: Block[] = [
      {
        id: '1',
        type: 'text',
        position: { x: 100, y: 100 },
        size: { width: 200, height: 100 },
        content: { text: 'Test text' }
      }
    ];
    
    const onBlockSelect = vi.fn();
    render(<CanvasArea {...mockProps} blocks={blocks} onBlockSelect={onBlockSelect} />);
    
    fireEvent.click(screen.getByText('Test text'));
    
    expect(onBlockSelect).toHaveBeenCalledWith('1');
  });

  it('handles drop to create new block', () => {
    const onBlocksChange = vi.fn();
    const onBlockSelect = vi.fn();
    
    render(
      <CanvasArea 
        {...mockProps} 
        onBlocksChange={onBlocksChange}
        onBlockSelect={onBlockSelect}
      />
    );
    
    const canvasArea = screen.getByText('Drag blocks from the left sidebar to get started').parentElement!;
    const dataTransfer = {
      getData: vi.fn().mockReturnValue('text'),
      dropEffect: ''
    };
    
    fireEvent.drop(canvasArea, { 
      dataTransfer,
      clientX: 200,
      clientY: 200
    });
    
    expect(onBlocksChange).toHaveBeenCalled();
    expect(onBlockSelect).toHaveBeenCalled();
  });
});

describe('PropertiesPanel', () => {
  it('shows empty state when no block selected', () => {
    render(<PropertiesPanel block={undefined} onBlockUpdate={vi.fn()} />);
    
    expect(screen.getByText('Select a block to view its properties')).toBeInTheDocument();
  });

  it('displays text block properties', () => {
    const block: Block = {
      id: '1',
      type: 'text',
      position: { x: 100, y: 100 },
      size: { width: 200, height: 100 },
      content: { text: 'Test text' }
    };
    
    render(<PropertiesPanel block={block} onBlockUpdate={vi.fn()} />);
    
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByText('📝 Text Block')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test text')).toBeInTheDocument();
  });

  it('updates text content', () => {
    const block: Block = {
      id: '1',
      type: 'text',
      position: { x: 100, y: 100 },
      size: { width: 200, height: 100 },
      content: { text: 'Test text' }
    };
    
    const onBlockUpdate = vi.fn();
    render(<PropertiesPanel block={block} onBlockUpdate={onBlockUpdate} />);
    
    const textarea = screen.getByDisplayValue('Test text');
    fireEvent.change(textarea, { target: { value: 'Updated text' } });
    
    expect(onBlockUpdate).toHaveBeenCalledWith({
      ...block,
      content: { text: 'Updated text' }
    });
  });

  it('updates position and size', () => {
    const block: Block = {
      id: '1',
      type: 'text',
      position: { x: 100, y: 100 },
      size: { width: 200, height: 100 },
      content: { text: 'Test text' }
    };
    
    const onBlockUpdate = vi.fn();
    render(<PropertiesPanel block={block} onBlockUpdate={onBlockUpdate} />);
    
    const xInput = screen.getByDisplayValue('100');
    fireEvent.change(xInput, { target: { value: '150' } });
    
    expect(onBlockUpdate).toHaveBeenCalledWith({
      ...block,
      position: { x: 150, y: 100 }
    });
  });
});
