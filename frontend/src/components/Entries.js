import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './the.css'; // Ensure the path is correct

const Entries = () => {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({ title: '', content: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

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

      // Clear the form fields
      setForm({ title: '', content: '' });

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
    } catch (error) {
      console.error('Error saving entry:', error.response ? error.response.data : error.message);
      alert('Failed to save entry. Please try again.');
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingForm({ title: '', content: '' });
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
      <div className="entries-header">
        <h2>Your Diary Entries</h2>
      </div>

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search entries by title or content..."
          value={searchQuery}
          onChange={handleSearch}
        />
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((entry) => (
              <li key={entry.id} onClick={() => handleSuggestionClick(entry.title)}>
                {entry.title}
              </li>
            ))}
          </ul>
        )}
        {searchQuery && filteredEntries.length === 0 && (
          <div className="no-results">No entries found.</div>
        )}
      </div>

      {/* Add New Entry */}
      <div className="add-entry-form">
        <h3>Add New Entry</h3>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={(e) => handleChange(e, setForm)}
        />
        <textarea
          name="content"
          rows="5"
          placeholder="Content"
          value={form.content}
          onChange={(e) => handleChange(e, setForm)}
        />
        <button onClick={handleAddEntry}>Add Entry</button>
      </div>

      {/* Entries List */}
      <ul className="entries-list">
        {filteredEntries.map((entry) => (
          <li key={entry.id} id={`entry-${entry.id}`}>
            {editingId === entry.id ? (
              <div className="entry-content">
                <input
                  type="text"
                  name="title"
                  value={editingForm.title}
                  onChange={(e) => handleChange(e, setEditingForm)}
                />
                <textarea
                  name="content"
                  rows="5"
                  value={editingForm.content}
                  onChange={(e) => handleChange(e, setEditingForm)}
                />
                <div className="entry-buttons">
                  <button onClick={saveEditing}>Save</button>
                  <button onClick={cancelEditing}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="entry-content">
                <h3>{entry.title}</h3>
                <p>{entry.content}</p>
                <div className="entry-buttons">
                  <button onClick={() => startEditing(entry)}>Edit</button>
                  <button onClick={() => handleDeleteEntry(entry.id)}>Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Entries;