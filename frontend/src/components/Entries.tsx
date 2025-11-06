import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { FaBook, FaPlus, FaSearch, FaEdit, FaTrashAlt, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import FloatingActionButton from './FloatingActionButton';
import Modal from './Modal';
import RichTextEditor from './RichTextEditor';
import { useScrollToTop } from '../utils/scrollToTop';

interface Entry {
  id: number;
  title: string;
  content: string;
  created_at: string;
  user_id?: number;
}

interface FormState {
  title: string;
  content: string;
}

const Entries: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [form, setForm] = useState<FormState>({ title: '', content: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingForm, setEditingForm] = useState<FormState>({ title: '', content: '' });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [suggestions, setSuggestions] = useState<Entry[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  useScrollToTop();

  const formatContent = (content: string): string => {
    if (!content) return '';
    
    const lines = content.split('\n');
    const formattedLines: string[] = [];
    let inNumberedList = false;
    let inBulletList = false;
    
    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s*(.*)/);
      if (numberedMatch) {
        if (!inNumberedList) {
          formattedLines.push('<ol>');
          inNumberedList = true;
          inBulletList = false;
        }
        formattedLines.push(`<li>${numberedMatch[2]}</li>`);
        return;
      }
      
      const bulletMatch = trimmedLine.match(/^[-*•]\s*(.*)/);
      if (bulletMatch) {
        if (!inBulletList) {
          formattedLines.push('<ul>');
          inBulletList = true;
          inNumberedList = false;
        }
        formattedLines.push(`<li>${bulletMatch[1]}</li>`);
        return;
      }
      
      if (inNumberedList) {
        formattedLines.push('</ol>');
        inNumberedList = false;
      }
      if (inBulletList) {
        formattedLines.push('</ul>');
        inBulletList = false;
      }
      
      if (trimmedLine) {
        formattedLines.push(`<p>${trimmedLine}</p>`);
      } else {
        formattedLines.push('<br>');
      }
    });
    
    if (inNumberedList) formattedLines.push('</ol>');
    if (inBulletList) formattedLines.push('</ul>');
    
    return formattedLines.join('');
  };

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return 'Date not available';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date not available';
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async (): Promise<void> => {
    try {
      const { data } = await axios.get<Entry[]>('/entries');
      setEntries(data);
      setFilteredEntries(data);
    } catch (error: any) {
      console.error('Error fetching entries:', error.response ? error.response.data : error.message);
      alert('Failed to fetch entries. Please try again later.');
    }
  };

  const handleAddEntry = async (): Promise<void> => {
    if (!form.title.trim() || !form.content.trim()) {
      alert('Title and content are required!');
      return;
    }

    // Get user ID from localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      alert('Please log in to create entries.');
      return;
    }
    
    const user = JSON.parse(storedUser);
    const userId = user.id ? parseInt(user.id, 10) : null;
    
    if (!userId) {
      alert('User ID not found. Please log in again.');
      return;
    }

    try {
      const { data } = await axios.post<Entry>('/entries', { ...form, user_id: userId });
      setEntries((prevEntries) => [data, ...prevEntries]);
      setFilteredEntries((prevEntries) => [data, ...prevEntries]);
      setForm({ title: '', content: '' });
      setShowAddModal(false);
    } catch (error: any) {
      console.error('Error adding entry:', error.response ? error.response.data : error.message);
      alert('Failed to add entry. Please try again.');
    }
  };

  const saveEditing = async (): Promise<void> => {
    if (!editingForm.title.trim() || !editingForm.content.trim()) {
      alert('Title and content are required!');
      return;
    }

    try {
      await axios.put(`/entries/${editingId}`, editingForm);
      fetchEntries();
      cancelEditing();
      setSelectedEntry(null);
    } catch (error: any) {
      console.error('Error saving entry:', error.response ? error.response.data : error.message);
      alert('Failed to save entry. Please try again.');
    }
  };

  const cancelEditing = (): void => {
    setEditingId(null);
    setEditingForm({ title: '', content: '' });
    setSelectedEntry(null);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredEntries(entries);
      setSuggestions([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const matchingEntries = entries.filter((entry) =>
      (entry.title && entry.title.toLowerCase().includes(lowerQuery)) ||
      (entry.content && entry.content.toLowerCase().includes(lowerQuery))
    );

    const autoCompleteSuggestions = entries.filter((entry) =>
      entry.title && entry.title.toLowerCase().startsWith(lowerQuery)
    );

    setFilteredEntries(matchingEntries);
    setSuggestions(autoCompleteSuggestions);
  };

  const handleSuggestionClick = (title: string): void => {
    setSearchQuery(title);
    const matching = entries.filter((entry) =>
      entry.title && entry.title.toLowerCase().includes(title.toLowerCase())
    );
    setFilteredEntries(matching);
    setSuggestions([]);

    const entryElement = document.getElementById(`entry-${matching[0].id}`);
    if (entryElement) {
      entryElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteEntry = async (entryId: number): Promise<void> => {
    try {
      await axios.delete(`/entries/${entryId}`);
      setEntries(entries.filter((entry) => entry.id !== entryId));
      setFilteredEntries(filteredEntries.filter((entry) => entry.id !== entryId));
    } catch (error: any) {
      console.error('Error deleting entry:', error.response ? error.response.data : error.message);
      alert('Failed to delete entry. Please try again.');
    }
  };

  const uniqueDays = new Set(filteredEntries.filter(e => e.created_at).map(e => new Date(e.created_at).toDateString())).size;

  return (
    <div className="space-y-3">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-4 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold mb-1 flex items-center gap-2">
              <FaBook className="text-base" />
              My Diary Entries
            </h1>
            <p className="text-white/90 text-sm">Capture your thoughts, memories, and daily experiences</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-xl font-bold">{filteredEntries.length}</div>
              <div className="text-xs text-white/80">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{uniqueDays}</div>
              <div className="text-xs text-white/80">Days Written</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="relative">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search your entries..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
          />
        </div>

        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-10 max-h-60 overflow-y-auto">
            <ul>
              {suggestions.map((entry) => (
                <li 
                  key={entry.id} 
                  onClick={() => handleSuggestionClick(entry.title)} 
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                >
                  <FaSearch className="text-gray-400" />
                  <span>{entry.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {searchQuery && filteredEntries.length === 0 && (
          <div className="text-center py-6 bg-white rounded-lg">
            <FaSearch className="text-2xl text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">No entries found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Entry"
      >
        <input
          type="text"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
          placeholder="Entry Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          autoFocus
        />
        <RichTextEditor
          value={form.content}
          onChange={(content) => setForm({ ...form, content })}
          placeholder="Write your thoughts here..."
          rows={8}
        />
        <div className="flex gap-3 mt-6">
          <button 
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            onClick={() => setShowAddModal(false)}
          >
            Cancel
          </button>
          <button 
            className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            onClick={handleAddEntry}
          >
            Add Entry
          </button>
        </div>
      </Modal>

      {/* Entries List */}
      <div>
        {filteredEntries.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredEntries.map((entry, index) => {
              // Get first 3 lines of content
              const contentLines = entry.content.split('\n').filter(line => line.trim());
              const previewLines = contentLines.slice(0, 3);
              const previewText = previewLines.join('\n');
              const hasMore = contentLines.length > 3;
              
              return (
                <div
                  key={entry.id}
                  id={`entry-${entry.id}`}
                  className="bg-white rounded-lg p-3 shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-100 w-full"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 text-xs">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                      <h3 className="text-base font-bold text-gray-900 mb-1">{entry.title}</h3>
                      <div className="text-gray-600 mb-2 whitespace-pre-line">
                        <p className="line-clamp-3 text-sm">{previewText}</p>
                        {hasMore && <span className="text-indigo-600 font-medium text-xs">... (click to view more)</span>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FaCalendarAlt />
                        <span>{formatDateTime(entry.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 self-end sm:self-start">
                      <button
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEntry(entry);
                          setEditingId(entry.id);
                          setEditingForm({ title: entry.title, content: entry.content });
                        }}
                        title="Edit entry"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this entry?')) {
                            handleDeleteEntry(entry.id);
                          }
                        }}
                        title="Delete entry"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg">
            <div className="text-4xl mb-3">📖</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No entries yet</h3>
            <p className="text-gray-600 mb-4 text-sm">
              {searchQuery ? 'No entries match your search.' : 'Start documenting your thoughts and experiences.'}
            </p>
            {!searchQuery && (
              <button
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 mx-auto text-sm"
                onClick={() => setShowAddModal(true)}
              >
                <FaPlus />
                Create Your First Entry
              </button>
            )}
          </div>
        )}
      </div>

      {/* Entry Detail Modal - Mobile Friendly */}
      {selectedEntry && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={() => {
            setSelectedEntry(null);
            setEditingId(null);
          }}
        >
          <div 
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <FaBook className="text-sm sm:text-base" />
                <span>Entry Details</span>
              </h2>
              <button 
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setSelectedEntry(null);
                  setEditingId(null);
                }}
              >
                <FaTimes className="text-lg sm:text-xl" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {editingId === selectedEntry.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={editingForm.title}
                      onChange={(e) => setEditingForm({ ...editingForm, title: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
                    <RichTextEditor
                      value={editingForm.content}
                      onChange={(content) => setEditingForm({ ...editingForm, content })}
                      placeholder="Write your thoughts here..."
                      rows={8}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button 
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm sm:text-base"
                      onClick={saveEditing}
                    >
                      Save Changes
                    </button>
                    <button 
                      className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors text-sm sm:text-base"
                      onClick={cancelEditing}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 break-words">{selectedEntry.title}</h3>
                  <div 
                    className="prose prose-sm sm:prose-base max-w-none mb-6 text-gray-700 whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{ __html: formatContent(selectedEntry.content) }}
                  />
                  
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6">
                    <FaCalendarAlt />
                    <span>{formatDateTime(selectedEntry.created_at)}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    <button
                      className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                      onClick={() => {
                        setEditingId(selectedEntry.id);
                        setEditingForm({ title: selectedEntry.title, content: selectedEntry.content });
                      }}
                    >
                      <FaEdit />
                      Edit Entry
                    </button>
                    <button
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this entry?')) {
                          handleDeleteEntry(selectedEntry.id);
                          setSelectedEntry(null);
                          setEditingId(null);
                        }
                      }}
                    >
                      <FaTrashAlt />
                      Delete Entry
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Add Entry Button */}
      <FloatingActionButton
        onClick={() => setShowAddModal(true)}
        variant="entries"
        icon="+"
        title="Add new diary entry"
        ariaLabel="Add new diary entry"
      />
    </div>
  );
};

export default Entries;


