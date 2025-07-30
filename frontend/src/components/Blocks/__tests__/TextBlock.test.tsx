import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TextBlock } from '../TextBlock';

describe('TextBlock', () => {
  const mockProps = {
    content: 'Test content',
    onContentChange: vi.fn(),
    isSelected: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders content in display mode', () => {
    render(<TextBlock {...mockProps} />);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('shows placeholder when content is empty', () => {
    render(<TextBlock {...mockProps} content="" />);
    expect(screen.getByText('Double-click to edit text...')).toBeInTheDocument();
  });

  it('enters edit mode on double click', async () => {
    render(<TextBlock {...mockProps} />);
    const display = screen.getByText('Test content');
    
    fireEvent.doubleClick(display);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('Test content');
  });

  it('saves content on blur', async () => {
    render(<TextBlock {...mockProps} />);
    
    fireEvent.doubleClick(screen.getByText('Test content'));
    const textarea = screen.getByRole('textbox');
    
    fireEvent.change(textarea, { target: { value: 'Updated content' } });
    fireEvent.blur(textarea);
    
    expect(mockProps.onContentChange).toHaveBeenCalledWith('Updated content');
  });

  it('cancels edit on Escape key', async () => {
    render(<TextBlock {...mockProps} />);
    
    fireEvent.doubleClick(screen.getByText('Test content'));
    const textarea = screen.getByRole('textbox');
    
    fireEvent.change(textarea, { target: { value: 'Updated content' } });
    fireEvent.keyDown(textarea, { key: 'Escape' });
    
    expect(mockProps.onContentChange).not.toHaveBeenCalled();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('formats markdown headers', () => {
    render(<TextBlock {...mockProps} content="# Header 1\n## Header 2\n### Header 3" />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Header 1');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Header 2');
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Header 3');
  });

  it('formats bold and italic text', () => {
    const { container } = render(<TextBlock {...mockProps} content="**bold** and *italic* text" />);
    
    expect(container.querySelector('strong')).toHaveTextContent('bold');
    expect(container.querySelector('em')).toHaveTextContent('italic');
  });

  it('handles Tab key to insert tab character', async () => {
    render(<TextBlock {...mockProps} />);
    
    fireEvent.doubleClick(screen.getByText('Test content'));
    const textarea = screen.getByRole('textbox');
    
    // Position cursor at beginning
    textarea.selectionStart = 0;
    textarea.selectionEnd = 0;
    
    fireEvent.keyDown(textarea, { key: 'Tab' });
    
    // Tab should be inserted at cursor position
    expect(textarea.value).toContain('\t');
  });

  it('shows selected outline when isSelected is true', () => {
    const { container } = render(<TextBlock {...mockProps} isSelected={true} />);
    const display = container.querySelector('.text-block-display');
    
    expect(display).toHaveClass('selected');
  });
});
