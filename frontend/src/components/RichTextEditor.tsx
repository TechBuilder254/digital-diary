import React, { useState, useRef, useEffect } from 'react';
import { FaListOl, FaListUl, FaUndo, FaRedo } from 'react-icons/fa';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  rows?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Write your thoughts here...", 
  rows = 8 
}) => {
  const [content, setContent] = useState<string>(value || '');
  const [history, setHistory] = useState<string[]>([value || '']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(value || '');
  }, [value]);

  const handleContentChange = (newContent: string): void => {
    setContent(newContent);
    onChange(newContent);
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    setHistory(newHistory);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    const textarea = e.target as HTMLTextAreaElement;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPos);
    const textAfterCursor = content.substring(cursorPos);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];

    if (e.key === 'Enter') {
      e.preventDefault();
      
      const numberedMatch = currentLine.match(/^(\d+)\.\s*(.*)/);
      if (numberedMatch) {
        const currentNumber = parseInt(numberedMatch[1]);
        const newNumber = currentNumber + 1;
        const newLine = `${newNumber}. `;
        const newContent = textBeforeCursor + '\n' + newLine + textAfterCursor;
        handleContentChange(newContent);
        
        setTimeout(() => {
          const newCursorPos = textBeforeCursor.length + 1 + newLine.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
        return;
      }
      
      const bulletMatch = currentLine.match(/^[-*•]\s*(.*)/);
      if (bulletMatch) {
        const newLine = '• ';
        const newContent = textBeforeCursor + '\n' + newLine + textAfterCursor;
        handleContentChange(newContent);
        
        setTimeout(() => {
          const newCursorPos = textBeforeCursor.length + 1 + newLine.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
        return;
      }
      
      const newContent = textBeforeCursor + '\n' + textAfterCursor;
      handleContentChange(newContent);
    }
    
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

  const insertNumberedList = (): void => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPos);
    const textAfterCursor = content.substring(cursorPos);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];
    
    if (currentLine.trim() === '') {
      const newContent = textBeforeCursor + '1. ' + textAfterCursor;
      handleContentChange(newContent);
      
      setTimeout(() => {
        const newCursorPos = cursorPos + 3;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    } else {
      const newContent = textBeforeCursor + '\n1. ' + textAfterCursor;
      handleContentChange(newContent);
      
      setTimeout(() => {
        const newCursorPos = cursorPos + 4;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    }
  };

  const insertBulletList = (): void => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPos);
    const textAfterCursor = content.substring(cursorPos);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];
    
    if (currentLine.trim() === '') {
      const newContent = textBeforeCursor + '• ' + textAfterCursor;
      handleContentChange(newContent);
      
      setTimeout(() => {
        const newCursorPos = cursorPos + 2;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    } else {
      const newContent = textBeforeCursor + '\n• ' + textAfterCursor;
      handleContentChange(newContent);
      
      setTimeout(() => {
        const newCursorPos = cursorPos + 3;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    }
  };

  const undo = (): void => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const newContent = history[newIndex];
      setContent(newContent);
      onChange(newContent);
    }
  };

  const redo = (): void => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const newContent = history[newIndex];
      setContent(newContent);
      onChange(newContent);
    }
  };

  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-200">
        <button
          type="button"
          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          onClick={insertNumberedList}
          title="Insert numbered list"
        >
          <FaListOl />
        </button>
        <button
          type="button"
          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          onClick={insertBulletList}
          title="Insert bullet list"
        >
          <FaListUl />
        </button>
        <div className="w-px h-6 bg-gray-300"></div>
        <button
          type="button"
          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={undo}
          disabled={historyIndex <= 0}
          title="Undo"
        >
          <FaUndo />
        </button>
        <button
          type="button"
          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          title="Redo"
        >
          <FaRedo />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-0 resize-y min-h-[200px]"
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
      />
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <small className="text-gray-500 text-xs">
          <strong>Tips:</strong> Press Enter after "1." to auto-number. Press Enter after "•" to continue bullet list. Use Tab for indentation.
        </small>
      </div>
    </div>
  );
};

export default RichTextEditor;


