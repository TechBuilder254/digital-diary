import React, { useState, useEffect } from 'react';
import { FaTrashAlt, FaPlus } from 'react-icons/fa';
import './Notes.css';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
  });
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/notes');
        const data = await response.json();
        setNotes(data);
        setFilteredNotes(data);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

    fetchNotes();
  }, []); // Dependency array is constant

  const handleAddNote = async () => {
    if (!newNote.title.trim()) {
      alert('Title is required!');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      });
  
      if (!response.ok) {
        throw new Error('Failed to add note');
      }
  
      const addedNote = await response.json(); // Get the newly added note from the backend
      setNotes((prevNotes) => [...prevNotes, addedNote]); // Update the notes state
      setFilteredNotes((prevNotes) => [...prevNotes, addedNote]); // Update the filteredNotes state
      setShowAddModal(false); // Close the modal
      setNewNote({ title: '', content: '' }); // Reset the newNote state
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };
  const handleDeleteNote = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notes/${id}`, {
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
      const response = await fetch(`http://localhost:5000/api/notes/${editingNote.id}`, {
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
      setNewNote({ title: '', content: '' });
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredNotes(notes);
      return;
    }

    const lowerQuery = query.toLowerCase();
    setFilteredNotes(
      notes.filter(
        (note) =>
          note.title.toLowerCase().includes(lowerQuery) ||
          note.content.toLowerCase().includes(lowerQuery)
      )
    );
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowAddModal(true);
    setNewNote({
      title: note.title,
      content: note.content,
    });
  };

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h1>Notes</h1>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {/* Notes List */}
      <div className="notes-list">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <div
              key={note.id} // Add a unique key for each note
              className="note-card"
              onClick={() => handleEditNote(note)}
            >
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <div className="note-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering edit on delete
                    handleDeleteNote(note.id);
                  }}
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No notes available. Click the "+" button to add a new note.</p>
        )}
      </div>

      {/* Add/Edit Note Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingNote ? 'Edit Note' : 'Add New Note'}</h2>
            <input
              type="text"
              placeholder="Title"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            />
            <textarea
              placeholder="Write your note here..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            />
            <div className="modal-buttons">
              <button onClick={editingNote ? handleSaveEdit : handleAddNote}>
                {editingNote ? 'Save Changes' : 'Add Note'}
              </button>
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Add Note Button */}
      <button
        className="floating-add-note-button"
        onClick={() => {
          setShowAddModal(true);
          setEditingNote(null);
          setNewNote({ title: '', content: '' });
        }}
      >
        <FaPlus />
      </button>
    </div>
  );
};

export default Notes;