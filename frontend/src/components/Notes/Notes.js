import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaCalendarAlt, FaTag, FaHeart, FaMicrophone } from 'react-icons/fa';
import './Notes.css';
import '../../styles/design-system.css';
import FloatingActionButton from '../FloatingActionButton';
import Modal from '../Modal';
import { useScrollToTop } from '../../utils/scrollToTop';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Scroll to top when component mounts
  useScrollToTop();
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [newNote, setNewNote] = useState({
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
  const [editingNote, setEditingNote] = useState(null);
  const [expandedNotes, setExpandedNotes] = useState(new Set());
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [audioRefs, setAudioRefs] = useState({});
  
  // Predefined categories
  const categories = ['Personal', 'Work', 'Ideas', 'Shopping', 'Health', 'Travel', 'Finance', 'Other'];
  const priorities = ['Low', 'Medium', 'High'];
  
  // Toggle expanded state for read more functionality
  const toggleExpanded = (noteId) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId);
    } else {
      newExpanded.add(noteId);
    }
    setExpandedNotes(newExpanded);
  };
  
  // Truncate text for preview
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };


  // Audio files are now stored on the server, no localStorage needed


  // Handle audio playback
  const handleAudioPlay = (noteId, e) => {
    e.stopPropagation(); // Prevent note edit modal from opening
    
    // Find the note to get the audio filename
    const note = notes.find(n => n.id === noteId);
    if (!note || !note.has_audio || !note.audio_filename) {
      alert('Audio file not found. It may have been deleted or corrupted.');
      return;
    }

    // Stop any currently playing audio
    if (playingAudioId && playingAudioId !== noteId) {
      const currentAudio = audioRefs[playingAudioId];
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    }

    // Create or get audio element
    let audio = audioRefs[noteId];
    if (!audio) {
      // Create audio URL from server
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
      // Pause if currently playing
      audio.pause();
      setPlayingAudioId(null);
    } else {
      // Play audio
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        alert('Error playing audio file. Please try again.');
        setPlayingAudioId(null);
      });
      setPlayingAudioId(noteId);
      
      // Handle audio end
      audio.onended = () => {
        setPlayingAudioId(null);
      };
      
      // Handle audio error
      audio.onerror = () => {
        console.error('Audio playback error');
        alert('Error playing audio file. The file may be corrupted.');
        setPlayingAudioId(null);
      };
    }
  };

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('/api/notes');
        const data = await response.json();
        setNotes(data);
        setFilteredNotes(data);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

    fetchNotes();
  }, []); // Dependency array is constant

  // Cleanup audio URLs on component unmount
  useEffect(() => {
    return () => {
      // Clean up all audio references
      Object.values(audioRefs).forEach(audio => {
        if (audio && audio.src) {
          // Only revoke blob URLs, not data URLs
          if (audio.src.startsWith('blob:')) {
            URL.revokeObjectURL(audio.src);
          }
        }
      });
    };
  }, [audioRefs]);

  // Listen for custom events from Layout (audio notes saved)
  useEffect(() => {
    const handleNoteSaved = () => {
      // Refresh notes list when a note is saved from Layout
      const fetchNotes = async () => {
        try {
          const response = await fetch('/api/notes');
          const data = await response.json();
          setNotes(data);
          setFilteredNotes(data);
        } catch (error) {
          console.error('Error fetching notes:', error);
        }
      };
      fetchNotes();
    };

    window.addEventListener('noteSaved', handleNoteSaved);
    
    return () => {
      window.removeEventListener('noteSaved', handleNoteSaved);
    };
  }, []);

  const handleAddNote = async () => {
    if (!newNote.title.trim()) {
      alert('Title is required!');
      return;
    }
  
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      });
  
      if (!response.ok) {
        throw new Error('Failed to add note');
      }
  
      const addedNote = await response.json();
      
      // Audio files are now stored on the server
      console.log('Note saved successfully with audio:', addedNote.audio_filename);
      
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
  const handleToggleFavorite = async (id, currentFavoriteStatus) => {
    try {
      const response = await fetch(`/api/notes/${id}/favorite`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_favorite: !currentFavoriteStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      // Update the notes state
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

  const handleDeleteNote = async (id) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      setFilteredNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`/api/notes/${editingNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) {
        throw new Error('Failed to update note');
      }

      const updatedNote = await response.json();
      
      // Audio files are now stored on the server
      console.log('Note updated successfully with audio:', updatedNote.audio_filename);
      
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

  // Apply filters and search
  const applyFilters = useCallback(() => {
    let filtered = notes;

    // Apply search query
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

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((note) => note.category === selectedCategory);
    }

    // Apply priority filter
    if (selectedPriority) {
      filtered = filtered.filter((note) => note.priority === selectedPriority);
    }

    // Apply favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter((note) => note.is_favorite);
    }

    // Sort by priority (High -> Medium -> Low) then by updated_at
    filtered.sort((a, b) => {
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      const aPriority = priorityOrder[a.priority] || 2;
      const bPriority = priorityOrder[b.priority] || 2;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      // If same priority, sort by updated_at (newest first)
      return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
    });

    setFilteredNotes(filtered);
  }, [notes, searchQuery, selectedCategory, selectedPriority, showFavoritesOnly]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleEditNote = (note) => {
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

  return (
    <div className="notes-container">
      {/* Header Section */}
      <div className="notes-header animate-fade-in">
        <div className="header-content">
          <h1 className="page-title">
            <FaTag className="title-icon" />
            My Notes
          </h1>
          <p className="page-subtitle">Capture your thoughts and ideas</p>
        </div>
        <div className="header-controls">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              ⚏
            </button>
            <button
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              ☰
            </button>
          </div>
          <button
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            title="Toggle Filters"
          >
            <span className="filter-icon">⚙</span>
            <span className="filter-label">Filters</span>
          </button>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{filteredNotes.length}</span>
              <span className="stat-label">Notes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-section animate-fade-in" style={{ '--delay': '0.1s' }}>
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search your notes..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="filters-section animate-fade-in" style={{ '--delay': '0.2s' }}>
          <div className="filters-container">
            <div className="filter-group">
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Priority:</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="filter-select"
              >
                <option value="">All Priorities</option>
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="favorites-filter">
                <input
                  type="checkbox"
                  checked={showFavoritesOnly}
                  onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                />
                <FaHeart className="heart-icon" />
                Favorites Only
              </label>
            </div>
            <button
              className="clear-filters-btn"
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
      )}

      {/* Notes Grid/List */}
      <div className={`notes-container ${viewMode === 'list' ? 'list-view' : 'grid-view'} animate-fade-in`} style={{ '--delay': '0.2s' }}>
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note, index) => (
            <div
              key={note.id}
              className={`note-card ${viewMode === 'list' ? 'list-card' : 'grid-card'}`}
              style={{ '--delay': `${index * 0.1}s` }}
              onClick={() => handleEditNote(note)}
            >
              {/* Note Number */}
              <div className="note-number">
                {index + 1}
              </div>
              
              <div className="note-header">
                <h3 className="note-title">{note.title}</h3>
                <div className="note-actions">
                  <button
                    className={`action-btn favorite-btn ${note.is_favorite ? 'favorited' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(note.id, note.is_favorite);
                    }}
                    title={note.is_favorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <FaHeart />
                  </button>
                  <button
                    className="action-btn edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditNote(note);
                    }}
                    title="Edit note"
                  >
                    Edit
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    title="Delete note"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              {/* Category and Priority Badges */}
              <div className="note-badges">
                {note.category && (
                  <span className="category-badge">{note.category}</span>
                )}
                <span className={`priority-badge priority-${note.priority?.toLowerCase() || 'medium'}`}>
                  {note.priority || 'Medium'}
                </span>
              </div>
              
              <div className="note-content">
                <p className="note-text">
                  {expandedNotes.has(note.id) ? note.content : truncateText(note.content)}
                  {note.content.length > 100 && (
                    <button 
                      className="read-more-btn"
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
                  <div className="note-tags">
                    {note.tags.split(',').map((tag, tagIndex) => (
                      <span key={tagIndex} className="tag-item">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
                {note.has_audio && (
                  <div 
                    className={`audio-indicator ${playingAudioId === note.id ? 'playing' : ''}`}
                    onClick={(e) => handleAudioPlay(note.id, e)}
                    title={playingAudioId === note.id ? "Pause audio" : "Play audio"}
                  >
                    {playingAudioId === note.id ? (
                      <div className="audio-icon playing">⏸</div>
                    ) : (
                      <FaMicrophone className="audio-icon" />
                    )}
                    <span className="audio-label">
                      {playingAudioId === note.id ? "Playing..." : "Audio Recording"}
                    </span>
                    <span className="audio-duration">({Math.floor(note.audio_duration / 60)}:{(note.audio_duration % 60).toString().padStart(2, '0')})</span>
                  </div>
                )}
              </div>
              <div className="note-footer">
                <div className="note-meta">
                  <FaCalendarAlt className="meta-icon" />
                  <span className="meta-text">
                    {new Date(note.created_at).toLocaleDateString()}
                    {note.updated_at && note.updated_at !== note.created_at && (
                      <span className="updated-text"> • Updated {new Date(note.updated_at).toLocaleDateString()}</span>
                    )}
                  </span>
                </div>
                <div className="note-indicator"></div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3 className="empty-title">No notes yet</h3>
            <p className="empty-description">
              {searchQuery ? 'No notes match your search.' : 'Start capturing your thoughts and ideas.'}
            </p>
            {!searchQuery && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowAddModal(true);
                  setEditingNote(null);
                  setNewNote({ title: '', content: '', category: '', tags: '', priority: 'Medium', is_favorite: false });
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
        onClose={() => setShowAddModal(false)}
        title={editingNote ? 'Edit Note' : 'Add New Note'}
      >
        <input
          type="text"
          className="modal-input"
          placeholder="Title"
          value={newNote.title}
          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          autoFocus
        />
        <textarea
          className="modal-input"
          placeholder="Write your note here..."
          value={newNote.content}
          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
          rows="4"
          style={{ resize: 'vertical', minHeight: '100px' }}
        />
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <label className="modal-date-label">Category:</label>
            <select
              value={newNote.category}
              onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
              className="modal-input"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="modal-date-label">Priority:</label>
            <select
              value={newNote.priority}
              onChange={(e) => setNewNote({ ...newNote, priority: e.target.value })}
              className="modal-input"
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="modal-date-container">
          <label className="modal-date-label">Tags (comma-separated):</label>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g., important, work, urgent"
            value={newNote.tags}
            onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
          />
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={newNote.is_favorite}
              onChange={(e) => setNewNote({ ...newNote, is_favorite: e.target.checked })}
              style={{ margin: 0 }}
            />
            <FaHeart style={{ color: '#ec4899' }} />
            <span>Mark as Favorite</span>
          </label>
        </div>
        
        
        <div className="modal-buttons">
          <button className="modal-button modal-button-cancel" onClick={() => setShowAddModal(false)}>
            Cancel
          </button>
          <button className="modal-button modal-button-save" onClick={editingNote ? handleSaveEdit : handleAddNote}>
            {editingNote ? 'Save Changes' : 'Add Note'}
          </button>
        </div>
      </Modal>

      {/* Floating Add Note Button */}
      <FloatingActionButton
        onClick={() => {
          setShowAddModal(true);
          setEditingNote(null);
          setNewNote({ title: '', content: '', category: '', tags: '', priority: 'Medium', is_favorite: false, audio_filename: null, audio_duration: null, audio_size: null, has_audio: false });
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