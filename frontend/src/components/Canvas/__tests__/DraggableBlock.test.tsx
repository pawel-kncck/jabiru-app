import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DraggableBlock } from '../DraggableBlock';
import type { Block } from '../../../pages/CanvasEditor';

describe('DraggableBlock', () => {
  const mockBlock: Block = {
    id: '1',
    type: 'text',
    position: { x: 100, y: 100 },
    size: { width: 200, height: 100 },
    content: { text: 'Test text' }
  };

  const mockProps = {
    block: mockBlock,
    isSelected: false,
    onBlockUpdate: vi.fn(),
    onBlockSelect: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders block content', () => {
    render(<DraggableBlock {...mockProps} />);
    expect(screen.getByText('Test text')).toBeInTheDocument();
  });

  it('shows resize handles when selected', () => {
    const { container } = render(<DraggableBlock {...mockProps} isSelected={true} />);
    const resizeHandles = container.querySelectorAll('.resize-handle');
    expect(resizeHandles.length).toBe(8); // 4 corners + 4 edges
  });

  it('handles click to select', () => {
    render(<DraggableBlock {...mockProps} />);
    fireEvent.click(screen.getByText('Test text'));
    expect(mockProps.onBlockSelect).toHaveBeenCalledWith('1');
  });

  it('handles drag start', () => {
    const { container } = render(<DraggableBlock {...mockProps} />);
    const block = container.querySelector('.draggable-block')!;
    
    fireEvent.mouseDown(block, { clientX: 150, clientY: 150 });
    expect(mockProps.onBlockSelect).toHaveBeenCalledWith('1');
  });

  it('updates position on drag', () => {
    const { container } = render(<DraggableBlock {...mockProps} />);
    const block = container.querySelector('.draggable-block')!;
    
    fireEvent.mouseDown(block, { clientX: 150, clientY: 150 });
    fireEvent.mouseMove(document, { clientX: 200, clientY: 200 });
    
    expect(mockProps.onBlockUpdate).toHaveBeenCalledWith({
      ...mockBlock,
      position: { x: 150, y: 150 }
    });
  });

  it('handles keyboard navigation', () => {
    render(<DraggableBlock {...mockProps} isSelected={true} />);
    const block = screen.getByText('Test text').parentElement!.parentElement!;
    
    fireEvent.keyDown(block, { key: 'ArrowRight' });
    expect(mockProps.onBlockUpdate).toHaveBeenCalledWith({
      ...mockBlock,
      position: { x: 110, y: 100 }
    });

    fireEvent.keyDown(block, { key: 'ArrowDown' });
    expect(mockProps.onBlockUpdate).toHaveBeenCalledWith({
      ...mockBlock,
      position: { x: 100, y: 110 }
    });
  });

  it('handles resize', () => {
    const { container } = render(<DraggableBlock {...mockProps} isSelected={true} />);
    const resizeHandle = container.querySelector('.resize-handle.bottom-right')!;
    
    fireEvent.mouseDown(resizeHandle, { clientX: 300, clientY: 200 });
    fireEvent.mouseMove(document, { clientX: 350, clientY: 250 });
    
    expect(mockProps.onBlockUpdate).toHaveBeenCalledWith({
      ...mockBlock,
      size: { width: 250, height: 150 }
    });
  });

  it('renders chart block correctly', () => {
    const chartBlock: Block = {
      ...mockBlock,
      type: 'chart',
      content: { chartType: 'bar' }
    };
    
    render(<DraggableBlock {...mockProps} block={chartBlock} />);
    expect(screen.getByText('Chart: bar')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
  });
});
