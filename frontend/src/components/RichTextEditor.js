import React, { useState, useRef, useEffect } from 'react';
import { FaListOl, FaListUl, FaBold, FaItalic, FaUndo, FaRedo } from 'react-icons/fa';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder = "Write your thoughts here...", rows = 8 }) => {
  const [content, setContent] = useState(value || '');
  const [history, setHistory] = useState([value || '']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const textareaRef = useRef(null);

  useEffect(() => {
    setContent(value || '');
  }, [value]);

  const handleContentChange = (newContent) => {
    setContent(newContent);
    onChange(newContent);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    if (newHistory.length > 50) { // Limit history size
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    setHistory(newHistory);
  };

  const handleKeyDown = (e) => {
    const textarea = e.target;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPos);
    const textAfterCursor = content.substring(cursorPos);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];
    const previousLine = lines.length > 1 ? lines[lines.length - 2] : '';

    // Handle Enter key for auto-numbering and bullet points
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Check if current line starts with a number and period
      const numberedMatch = currentLine.match(/^(\d+)\.\s*(.*)/);
      if (numberedMatch) {
        const currentNumber = parseInt(numberedMatch[1]);
        const content = numberedMatch[2];
        const newNumber = currentNumber + 1;
        const newLine = `${newNumber}. `;
        const newContent = textBeforeCursor + '\n' + newLine + textAfterCursor;
        handleContentChange(newContent);
        
        // Set cursor position after the number
        setTimeout(() => {
          const newCursorPos = textBeforeCursor.length + 1 + newLine.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
        return;
      }
      
      // Check if current line starts with a bullet point
      const bulletMatch = currentLine.match(/^[-*•]\s*(.*)/);
      if (bulletMatch) {
        const newLine = '• ';
        const newContent = textBeforeCursor + '\n' + newLine + textAfterCursor;
        handleContentChange(newContent);
        
        // Set cursor position after the bullet
        setTimeout(() => {
          const newCursorPos = textBeforeCursor.length + 1 + newLine.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
        return;
      }
      
      // Regular enter
      const newContent = textBeforeCursor + '\n' + textAfterCursor;
      handleContentChange(newContent);
    }
    
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const newContent = textBeforeCursor + '    ' + textAfterCursor;
      handleContentChange(newContent);
      
      setTimeout(() => {
        const newCursorPos = cursorPos + 4;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const insertAtCursor = (text) => {
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const newContent = content.substring(0, cursorPos) + text + content.substring(cursorPos);
    handleContentChange(newContent);
    
    setTimeout(() => {
      const newCursorPos = cursorPos + text.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const insertNumberedList = () => {
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPos);
    const textAfterCursor = content.substring(cursorPos);
    
    // Check if we're at the beginning of a line
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];
    
    if (currentLine.trim() === '') {
      // Insert at beginning of line
      const newContent = textBeforeCursor + '1. ' + textAfterCursor;
      handleContentChange(newContent);
      
      setTimeout(() => {
        const newCursorPos = cursorPos + 3;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    } else {
      // Insert on new line
      const newContent = textBeforeCursor + '\n1. ' + textAfterCursor;
      handleContentChange(newContent);
      
      setTimeout(() => {
        const newCursorPos = cursorPos + 4;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    }
  };

  const insertBulletList = () => {
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPos);
    const textAfterCursor = content.substring(cursorPos);
    
    // Check if we're at the beginning of a line
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];
    
    if (currentLine.trim() === '') {
      // Insert at beginning of line
      const newContent = textBeforeCursor + '• ' + textAfterCursor;
      handleContentChange(newContent);
      
      setTimeout(() => {
        const newCursorPos = cursorPos + 2;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    } else {
      // Insert on new line
      const newContent = textBeforeCursor + '\n• ' + textAfterCursor;
      handleContentChange(newContent);
      
      setTimeout(() => {
        const newCursorPos = cursorPos + 3;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const newContent = history[newIndex];
      setContent(newContent);
      onChange(newContent);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const newContent = history[newIndex];
      setContent(newContent);
      onChange(newContent);
    }
  };

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <button
          type="button"
          className="toolbar-btn"
          onClick={insertNumberedList}
          title="Insert numbered list"
        >
          <FaListOl />
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={insertBulletList}
          title="Insert bullet list"
        >
          <FaListUl />
        </button>
        <div className="toolbar-separator"></div>
        <button
          type="button"
          className="toolbar-btn"
          onClick={undo}
          disabled={historyIndex <= 0}
          title="Undo"
        >
          <FaUndo />
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          title="Redo"
        >
          <FaRedo />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        className="editor-textarea"
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        style={{ resize: 'vertical', minHeight: '200px' }}
      />
      <div className="editor-help">
        <small>
          <strong>Tips:</strong> Press Enter after "1." to auto-number. Press Enter after "•" to continue bullet list. Use Tab for indentation.
        </small>
      </div>
    </div>
  );
};

export default RichTextEditor;


