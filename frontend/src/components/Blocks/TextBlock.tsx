import React, { useState, useRef, useEffect } from 'react';
import './TextBlock.css';

interface TextBlockProps {
  content: string;
  onContentChange: (content: string) => void;
  isSelected: boolean;
}

export function TextBlock({ content, onContentChange, isSelected }: TextBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      adjustTextareaHeight();
    }
  }, [isEditing]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (localContent !== content) {
      onContentChange(localContent);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
    adjustTextareaHeight();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setLocalContent(content);
      setIsEditing(false);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const start = textareaRef.current?.selectionStart || 0;
      const end = textareaRef.current?.selectionEnd || 0;
      const newContent = localContent.substring(0, start) + '\t' + localContent.substring(end);
      setLocalContent(newContent);
      
      // Set cursor position after tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 1;
        }
      }, 0);
    }
  };

  const formatContent = (text: string) => {
    // Basic markdown-like formatting
    return text
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('# ')) {
          return <h1 key={index}>{line.substring(2)}</h1>;
        } else if (line.startsWith('## ')) {
          return <h2 key={index}>{line.substring(3)}</h2>;
        } else if (line.startsWith('### ')) {
          return <h3 key={index}>{line.substring(4)}</h3>;
        }
        // Bold and italic
        let formattedLine = line;
        formattedLine = formattedLine.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        formattedLine = formattedLine.replace(/\*(.+?)\*/g, '<em>$1</em>');
        
        return (
          <p 
            key={index} 
            dangerouslySetInnerHTML={{ __html: formattedLine || '&nbsp;' }}
          />
        );
      });
  };

  return (
    <div className="text-block">
      {isEditing ? (
        <textarea
          ref={textareaRef}
          className="text-block-editor"
          value={localContent}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Enter text... (Use # for headers, **text** for bold, *text* for italic)"
        />
      ) : (
        <div
          ref={displayRef}
          className={`text-block-display ${isSelected ? 'selected' : ''}`}
          onDoubleClick={handleDoubleClick}
        >
          {localContent ? (
            <div className="formatted-content">
              {formatContent(localContent)}
            </div>
          ) : (
            <p className="placeholder">Double-click to edit text...</p>
          )}
        </div>
      )}
    </div>
  );
}