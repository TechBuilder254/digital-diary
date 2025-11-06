import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaCalendarAlt, FaTag, FaHeart, FaMicrophone, FaEdit, FaTrashAlt } from 'react-icons/fa';
import axios from '../../config/axios';
import FloatingActionButton from '../FloatingActionButton';
import Modal from '../Modal';
import { useScrollToTop } from '../../utils/scrollToTop';

interface Note {
  id: number;
  title: string;
  content: string;
  category?: string;
  tags?: string;
  priority: string;
  is_favorite: boolean;
  audio_filename?: string | null;
  audio_duration?: number | null;
  audio_size?: number | null;
  has_audio: boolean;
  created_at: string;
  updated_at?: string;
}

interface NoteForm {
  title: string;
  content: string;
  category: string;
  tags: string;
  priority: string;
  is_favorite: boolean;
  audio_filename: string | null;
  audio_duration: number | null;
  audio_size: number | null;
  has_audio: boolean;
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [newNote, setNewNote] = useState<NoteForm>({
    title: '',
    content: '',
    category: '',
    tags: '',
    priority: 'Medium',
    is_favorite: false,
    audio_filename: null,
    audio_duration: null,
    audio_size: null,
    has_audio: false,
  });
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [audioRefs, setAudioRefs] = useState<Record<number, HTMLAudioElement>>({});

  const categories: string[] = ['Personal', 'Work', 'Ideas', 'Shopping', 'Health', 'Travel', 'Finance', 'Other'];
  const priorities: string[] = ['Low', 'Medium', 'High'];

  useScrollToTop();

  const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const toggleExpanded = (noteId: number): void => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId);
    } else {
      newExpanded.add(noteId);
    }
    setExpandedNotes(newExpanded);
  };

  const handleAudioPlay = (noteId: number, e: React.MouseEvent): void => {
    e.stopPropagation();
    
    const note = notes.find(n => n.id === noteId);
    if (!note || !note.has_audio || !note.audio_filename) {
      alert('Audio file not found. It may have been deleted or corrupted.');
      return;
    }

    if (playingAudioId && playingAudioId !== noteId) {
      const currentAudio = audioRefs[playingAudioId];
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    }

    let audio = audioRefs[noteId];
    if (!audio) {
      const audioUrl = `/api/notes/audio/${note.audio_filename}`;
      try {
        audio = new Audio(audioUrl);
        setAudioRefs(prev => ({ ...prev, [noteId]: audio }));
      } catch (error) {
        console.error('Error creating audio element:', error);
        alert('Error loading audio file.');
        return;
      }
    }

    if (playingAudioId === noteId) {
      audio.pause();
      setPlayingAudioId(null);
    } else {
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        alert('Error playing audio file. Please try again.');
        setPlayingAudioId(null);
      });
      setPlayingAudioId(noteId);
      
      audio.onended = () => {
        setPlayingAudioId(null);
      };
      
      audio.onerror = () => {
        console.error('Audio playback error');
        alert('Error playing audio file. The file may be corrupted.');
        setPlayingAudioId(null);
      };
    }
  };

  useEffect(() => {
    const fetchNotes = async (): Promise<void> => {
      try {
        const response = await axios.get('/notes');
        const data = response.data;
        // Ensure data is always an array
        const notesArray = Array.isArray(data) ? data : [];
        setNotes(notesArray);
        setFilteredNotes(notesArray);
      } catch (error) {
        console.error('Error fetching notes:', error);
        setNotes([]);
        setFilteredNotes([]);
      }
    };

    fetchNotes();
  }, []);

  useEffect(() => {
    return () => {
      Object.values(audioRefs).forEach(audio => {
        if (audio && audio.src && audio.src.startsWith('blob:')) {
          URL.revokeObjectURL(audio.src);
        }
      });
    };
  }, [audioRefs]);

    useEffect(() => {
      const handleNoteSaved = (): void => {
        const fetchNotes = async (): Promise<void> => {
          try {
            const response = await axios.get('/notes');
            const data = response.data;
            // Ensure data is always an array
            const notesArray = Array.isArray(data) ? data : [];
            setNotes(notesArray);
            setFilteredNotes(notesArray);
          } catch (error) {
            console.error('Error fetching notes:', error);
            setNotes([]);
            setFilteredNotes([]);
          }
        };
        fetchNotes();
      };

      window.addEventListener('noteSaved', handleNoteSaved);
      
      return () => {
        window.removeEventListener('noteSaved', handleNoteSaved);
      };
    }, []);

  const handleAddNote = async (): Promise<void> => {
    if (!newNote.title.trim()) {
      alert('Title is required!');
      return;
    }
  
    try {
      const response = await axios.post('/notes', newNote);
      const addedNote = response.data;
      setNotes((prevNotes) => [...prevNotes, addedNote]);
      setFilteredNotes((prevNotes) => [...prevNotes, addedNote]);
      setShowAddModal(false);
      setNewNote({ 
        title: '', 
        content: '', 
        category: '', 
        tags: '', 
        priority: 'Medium', 
        is_favorite: false,
        audio_filename: null,
        audio_duration: null,
        audio_size: null,
        has_audio: false,
      });
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleToggleFavorite = async (id: number, currentFavoriteStatus: boolean): Promise<void> => {
    try {
      await axios.patch(`/notes/${id}/favorite`, { is_favorite: !currentFavoriteStatus });

      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === id ? { ...note, is_favorite: !currentFavoriteStatus } : note
        )
      );
      setFilteredNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === id ? { ...note, is_favorite: !currentFavoriteStatus } : note
        )
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDeleteNote = async (id: number): Promise<void> => {
    try {
      await axios.delete(`/notes/${id}`);

      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      setFilteredNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleSaveEdit = async (): Promise<void> => {
    if (!editingNote) return;
    
    try {
      const response = await axios.put(`/notes/${editingNote.id}`, newNote);
      const updatedNote = response.data;
      
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === editingNote.id ? updatedNote : note
        )
      );
      setFilteredNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === editingNote.id ? updatedNote : note
        )
      );
      setShowAddModal(false);
      setEditingNote(null);
      setNewNote({ 
        title: '', 
        content: '', 
        category: '', 
        tags: '', 
        priority: 'Medium', 
        is_favorite: false,
        audio_filename: null,
        audio_duration: null,
        audio_size: null,
        has_audio: false,
      });
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const applyFilters = useCallback((): void => {
    // Ensure notes is always an array
    if (!Array.isArray(notes)) {
      setFilteredNotes([]);
      return;
    }

    let filtered = [...notes]; // Create a copy to avoid mutating the original

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(lowerQuery) ||
          note.content.toLowerCase().includes(lowerQuery) ||
          (note.category && note.category.toLowerCase().includes(lowerQuery)) ||
          (note.tags && note.tags.toLowerCase().includes(lowerQuery))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((note) => note.category === selectedCategory);
    }

    if (selectedPriority) {
      filtered = filtered.filter((note) => note.priority === selectedPriority);
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter((note) => note.is_favorite);
    }

    // Ensure filtered is still an array before sorting
    if (Array.isArray(filtered)) {
      filtered.sort((a, b) => {
        const priorityOrder: Record<string, number> = { 'High': 3, 'Medium': 2, 'Low': 1 };
        const aPriority = priorityOrder[a.priority] || 2;
        const bPriority = priorityOrder[b.priority] || 2;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
      });
    }

    setFilteredNotes(Array.isArray(filtered) ? filtered : []);
  }, [notes, searchQuery, selectedCategory, selectedPriority, showFavoritesOnly]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleEditNote = (note: Note): void => {
    setEditingNote(note);
    setShowAddModal(true);
    
    setNewNote({
      title: note.title,
      content: note.content,
      category: note.category || '',
      tags: note.tags || '',
      priority: note.priority || 'Medium',
      is_favorite: note.is_favorite || false,
      audio_filename: note.audio_filename || null,
      audio_duration: note.audio_duration || null,
      audio_size: note.audio_size || null,
      has_audio: note.has_audio || false,
    });
  };

  const resetNewNote = (): void => {
    setNewNote({ 
      title: '', 
      content: '', 
      category: '', 
      tags: '', 
      priority: 'Medium', 
      is_favorite: false,
      audio_filename: null,
      audio_duration: null,
      audio_size: null,
      has_audio: false,
    });
  };

  return (
    <div className="space-y-3">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-xl p-4 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold mb-1 flex items-center gap-2">
              <FaTag className="text-base" />
              My Notes
            </h1>
            <p className="text-white/90 text-sm">Capture your thoughts and ideas</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white/20 backdrop-blur-md rounded-lg p-1">
              <button
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors text-sm ${
                  viewMode === 'grid' 
                    ? 'bg-white text-purple-600' 
                    : 'text-white hover:bg-white/20'
                }`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                ⚏
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-purple-600' 
                    : 'text-white hover:bg-white/20'
                }`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                ☰
              </button>
            </div>
            <button
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                showFilters 
                  ? 'bg-white text-purple-600' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              onClick={() => setShowFilters(!showFilters)}
              title="Toggle Filters"
            >
              ⚙ Filters
            </button>
            <div className="text-center">
              <div className="text-xl font-bold">{filteredNotes.length}</div>
              <div className="text-xs text-white/80">Notes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search your notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
        />
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white rounded-lg p-3 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority:</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
              >
                <option value="">All Priorities</option>
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFavoritesOnly}
                  onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                  className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                />
                <FaHeart className="text-pink-600" />
                <span className="font-semibold text-gray-700">Favorites Only</span>
              </label>
            </div>
            <div className="flex items-end">
              <button
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedPriority('');
                  setShowFavoritesOnly(false);
                  setSearchQuery('');
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid/List */}
      <div>
        {filteredNotes.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredNotes.map((note, index) => (
              <div
                key={note.id}
                className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-gray-100 relative ${
                  viewMode === 'list' ? 'p-3 flex gap-3' : 'p-3'
                }`}
                onClick={() => handleEditNote(note)}
              >
                <div className={`absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-bold flex items-center justify-center text-sm z-10`}>
                  {index + 1}
                </div>
                
                <div className={viewMode === 'list' ? 'flex-1' : ''}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-bold text-gray-900 flex-1">{note.title}</h3>
                    <div className="flex gap-1.5 ml-3">
                      <button
                        className={`p-1.5 rounded-lg transition-colors ${
                          note.is_favorite 
                            ? 'text-pink-600 bg-pink-50' 
                            : 'text-gray-400 hover:text-pink-600 hover:bg-pink-50'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(note.id, note.is_favorite);
                        }}
                        title={note.is_favorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <FaHeart className="text-xs" />
                      </button>
                      <button
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditNote(note);
                        }}
                        title="Edit note"
                      >
                        <FaEdit className="text-xs" />
                      </button>
                      <button
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this note?')) {
                            handleDeleteNote(note.id);
                          }
                        }}
                        title="Delete note"
                      >
                        <FaTrashAlt className="text-xs" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {note.category && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold">
                        {note.category}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                      note.priority === 'High' 
                        ? 'bg-red-100 text-red-700'
                        : note.priority === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {note.priority || 'Medium'}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-700 mb-2">
                      {expandedNotes.has(note.id) ? note.content : truncateText(note.content)}
                      {note.content.length > 100 && (
                        <button 
                          className="text-indigo-600 font-semibold ml-2 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded(note.id);
                          }}
                        >
                          {expandedNotes.has(note.id) ? 'Read Less' : 'Read More'}
                        </button>
                      )}
                    </p>
                    {note.tags && (
                      <div className="flex flex-wrap gap-2">
                        {note.tags.split(',').map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    {note.has_audio && (
                      <div 
                        className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                          playingAudioId === note.id 
                            ? 'bg-indigo-100 text-indigo-700' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={(e) => handleAudioPlay(note.id, e)}
                        title={playingAudioId === note.id ? "Pause audio" : "Play audio"}
                      >
                        {playingAudioId === note.id ? (
                          <span className="text-lg">⏸</span>
                        ) : (
                          <FaMicrophone />
                        )}
                        <span className="text-sm font-semibold">
                          {playingAudioId === note.id ? "Playing..." : "Audio Recording"}
                        </span>
                        {note.audio_duration && (
                          <span className="text-xs">
                            ({Math.floor(note.audio_duration / 60)}:{(note.audio_duration % 60).toString().padStart(2, '0')})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t border-gray-200">
                    <FaCalendarAlt />
                    <span>
                      {new Date(note.created_at).toLocaleDateString()}
                      {note.updated_at && note.updated_at !== note.created_at && (
                        <span> • Updated {new Date(note.updated_at).toLocaleDateString()}</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No notes yet</h3>
            <p className="text-gray-600 mb-4 text-sm">
              {searchQuery ? 'No notes match your search.' : 'Start capturing your thoughts and ideas.'}
            </p>
            {!searchQuery && (
              <button
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
                onClick={() => {
                  setShowAddModal(true);
                  setEditingNote(null);
                  resetNewNote();
                }}
              >
                +
                Create Your First Note
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Note Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingNote(null);
          resetNewNote();
        }}
        title={editingNote ? 'Edit Note' : 'Add New Note'}
      >
        <input
          type="text"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
          placeholder="Title"
          value={newNote.title}
          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          autoFocus
        />
        <textarea
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none resize-y min-h-[100px]"
          placeholder="Write your note here..."
          value={newNote.content}
          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
          rows={4}
        />
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category:</label>
            <select
              value={newNote.category}
              onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Priority:</label>
            <select
              value={newNote.priority}
              onChange={(e) => setNewNote({ ...newNote, priority: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma-separated):</label>
          <input
            type="text"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
            placeholder="e.g., important, work, urgent"
            value={newNote.tags}
            onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
          />
        </div>
        
        <div className="mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={newNote.is_favorite}
              onChange={(e) => setNewNote({ ...newNote, is_favorite: e.target.checked })}
              className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
            />
            <FaHeart className="text-pink-600" />
            <span className="font-semibold text-gray-700">Mark as Favorite</span>
          </label>
        </div>
        
        <div className="flex gap-3">
          <button 
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            onClick={() => {
              setShowAddModal(false);
              setEditingNote(null);
              resetNewNote();
            }}
          >
            Cancel
          </button>
          <button 
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            onClick={editingNote ? handleSaveEdit : handleAddNote}
          >
            {editingNote ? 'Save Changes' : 'Add Note'}
          </button>
        </div>
      </Modal>

      {/* Floating Add Note Button */}
      <FloatingActionButton
        onClick={() => {
          setShowAddModal(true);
          setEditingNote(null);
          resetNewNote();
        }}
        variant="notes"
        icon="+"
        title="Add new note"
        ariaLabel="Add new note"
      />
    </div>
  );
};

export default Notes;


