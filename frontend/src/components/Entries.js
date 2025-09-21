import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBook, FaPlus, FaSearch, FaEdit, FaTrashAlt, FaCalendarAlt, FaEye, FaTimes } from 'react-icons/fa';
import './the.css';
import '../styles/design-system.css';
import FloatingActionButton from './FloatingActionButton';
import Modal from './Modal';
import RichTextEditor from './RichTextEditor';
import { useScrollToTop } from '../utils/scrollToTop';

const Entries = () => {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [editingId, setEditingId] = useState(null);
  
  // Scroll to top when component mounts
  useScrollToTop();
  const [editingForm, setEditingForm] = useState({ title: '', content: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Helper function to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date not available';
    return date.toLocaleDateString();
  };

  // Helper function to format content with lists
  const formatContent = (content) => {
    if (!content) return '';
    
    // Split content into lines
    const lines = content.split('\n');
    const formattedLines = [];
    let inNumberedList = false;
    let inBulletList = false;
    let listCounter = 1;
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check for numbered list item
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
      
      // Check for bullet list item
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
      
      // Close lists if we encounter a non-list line
      if (inNumberedList) {
        formattedLines.push('</ol>');
        inNumberedList = false;
      }
      if (inBulletList) {
        formattedLines.push('</ul>');
        inBulletList = false;
      }
      
      // Add regular line
      if (trimmedLine) {
        formattedLines.push(`<p>${trimmedLine}</p>`);
      } else {
        formattedLines.push('<br>');
      }
    });
    
    // Close any remaining lists
    if (inNumberedList) {
      formattedLines.push('</ol>');
    }
    if (inBulletList) {
      formattedLines.push('</ul>');
    }
    
    return formattedLines.join('');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Date not available';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date not available';
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/entries`);
      setEntries(data);
      setFilteredEntries(data);
    } catch (error) {
      console.error('Error fetching entries:', error.response ? error.response.data : error.message);
      alert('Failed to fetch entries. Please try again later.');
    }
  };

  // Define the handleChange function
  const handleChange = (e, setState) => {
    const { name, value } = e.target;
    setState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleAddEntry = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      alert('Title and content are required!');
      return;
    }

    const userId = 1; // Replace this with actual logic for userId

    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/entries`, { ...form, user_id: userId });

      // Immediately update the entries and filteredEntries with the new entry
      setEntries((prevEntries) => [data, ...prevEntries]); // Add the new entry to the start
      setFilteredEntries((prevEntries) => [data, ...prevEntries]);

      // Clear the form fields and close modal
      setForm({ title: '', content: '' });
      setShowAddModal(false);

      console.log('Entry added successfully:', data);
    } catch (error) {
      console.error('Error adding entry:', error.response ? error.response.data : error.message);
      alert('Failed to add entry. Please try again.');
    }
  };

  const startEditing = (entry) => {
    setEditingId(entry.id);
    setEditingForm({ title: entry.title, content: entry.content });
  };

  const saveEditing = async () => {
    if (!editingForm.title.trim() || !editingForm.content.trim()) {
      alert('Title and content are required!');
      return;
    }

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/entries/${editingId}`, editingForm);
      fetchEntries();
      cancelEditing();
      setSelectedEntry(null); // Close the modal
    } catch (error) {
      console.error('Error saving entry:', error.response ? error.response.data : error.message);
      alert('Failed to save entry. Please try again.');
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingForm({ title: '', content: '' });
    setSelectedEntry(null); // Close the modal
  };

  const handleSearch = (e) => {
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

  const handleSuggestionClick = (title) => {
    setSearchQuery(title);
    const matching = entries.filter((entry) =>
      entry.title && entry.title.toLowerCase().includes(title.toLowerCase())
    );
    setFilteredEntries(matching);
    setSuggestions([]);

    // Scroll to the first matching entry
    const entryElement = document.getElementById(`entry-${matching[0].id}`);
    if (entryElement) {
      entryElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/entries/${entryId}`);
      setEntries(entries.filter((entry) => entry.id !== entryId)); // Remove entry from UI
      setFilteredEntries(filteredEntries.filter((entry) => entry.id !== entryId)); // Ensure filtered list is updated
      console.log('Entry deleted successfully.');
    } catch (error) {
      console.error('Error deleting entry:', error.response ? error.response.data : error.message);
      alert('Failed to delete entry. Please try again.');
    }
  };

  return (
    <div className="entries-container">
      {/* Header Section */}
      <div className="entries-header animate-fade-in">
        <div className="header-content">
          <h1 className="page-title">
            <FaBook className="title-icon" />
            My Diary Entries
          </h1>
          <p className="page-subtitle">Capture your thoughts, memories, and daily experiences</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{filteredEntries.length}</span>
            <span className="stat-label">Total Entries</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{new Set(filteredEntries.filter(e => e.created_at).map(e => new Date(e.created_at).toDateString())).size}</span>
            <span className="stat-label">Days Written</span>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section animate-fade-in" style={{ '--delay': '0.1s' }}>
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search your entries..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        {/* Autocomplete suggestions */}
        {suggestions.length > 0 && (
          <div className="suggestions-container">
            <ul className="suggestions-list">
              {suggestions.map((entry) => (
                <li key={entry.id} onClick={() => handleSuggestionClick(entry.title)} className="suggestion-item">
                  <FaSearch className="suggestion-icon" />
                  <span>{entry.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {searchQuery && filteredEntries.length === 0 && (
          <div className="no-results">
            <FaSearch className="no-results-icon" />
            <p>No entries found matching "{searchQuery}"</p>
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
          className="modal-input"
          placeholder="Entry Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          autoFocus
        />
        <RichTextEditor
          value={form.content}
          onChange={(content) => setForm({ ...form, content })}
          placeholder="Write your thoughts here..."
          rows="8"
        />
        <div className="modal-buttons">
          <button className="modal-button modal-button-cancel" onClick={() => setShowAddModal(false)}>
            Cancel
          </button>
          <button className="modal-button modal-button-save" onClick={handleAddEntry}>
            Add Entry
          </button>
        </div>
      </Modal>

      {/* Entries List */}
      <div className="entries-list-container animate-fade-in" style={{ '--delay': '0.2s' }}>
        {filteredEntries.length > 0 ? (
          <div className="entries-list">
            {filteredEntries.map((entry, index) => (
              <div
                key={entry.id}
                className="entry-list-item"
                onClick={() => setSelectedEntry(entry)}
                style={{ '--delay': `${index * 0.05}s` }}
              >
                <div className="entry-number">
                  {index + 1}
                </div>
                <div className="entry-info">
                  <div className="entry-main-info">
                    <h3 className="entry-title">{entry.title}</h3>
                    <p className="entry-preview">{entry.content.length > 150 ? entry.content.substring(0, 150) + '...' : entry.content}</p>
                    <div className="entry-meta">
                      <span className="entry-date">
                        <FaCalendarAlt className="date-icon" />
                        {formatDateTime(entry.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="entry-actions">
                    <button
                      className="action-btn edit-btn"
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
                      className="action-btn delete-btn"
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
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📖</div>
            <h3 className="empty-title">No entries yet</h3>
            <p className="empty-description">
              {searchQuery ? 'No entries match your search.' : 'Start documenting your thoughts and experiences.'}
            </p>
            {!searchQuery && (
              <button
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                <FaPlus />
                Create Your First Entry
              </button>
            )}
          </div>
        )}
      </div>

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div className="modal-overlay" onClick={() => setSelectedEntry(null)}>
          <div className="entry-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <FaBook className="title-icon" />
                Entry Details
              </h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedEntry(null)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              {editingId === selectedEntry.id ? (
                <div className="entry-edit-form">
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={editingForm.title}
                      onChange={(e) => setEditingForm({ ...editingForm, title: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Content</label>
                    <RichTextEditor
                      value={editingForm.content}
                      onChange={(content) => setEditingForm({ ...editingForm, content })}
                      placeholder="Write your thoughts here..."
                      rows="10"
                    />
                  </div>
                  <div className="form-actions">
                    <button className="btn btn-success" onClick={saveEditing}>
                      Save Changes
                    </button>
                    <button className="btn btn-secondary" onClick={cancelEditing}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="entry-detail-content">
                  <div className="entry-details">
                    <h3 className="detail-title">{selectedEntry.title}</h3>
                    <div 
                      className="detail-content entry-content" 
                      dangerouslySetInnerHTML={{ __html: formatContent(selectedEntry.content) }}
                    />
                    
                    <div className="detail-meta">
                      <div className="meta-item">
                        <FaCalendarAlt className="meta-icon" />
                        <div className="meta-content">
                          <span className="meta-label">Created</span>
                          <span className="meta-value">
                            {formatDateTime(selectedEntry.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="entry-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => {
                        setEditingId(selectedEntry.id);
                        setEditingForm({ title: selectedEntry.title, content: selectedEntry.content });
                      }}
                    >
                      <FaEdit />
                      Edit Entry
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteEntry(selectedEntry.id)}
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