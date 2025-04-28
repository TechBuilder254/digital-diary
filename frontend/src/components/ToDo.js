import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaRegCircle, FaCheckCircle, FaTrashAlt } from 'react-icons/fa';
import './the.css';

function TodoList() {
  const [todolists, setTodolists] = useState([]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newTodolistText, setNewTodolistText] = useState('');
  const [editingTodolistId, setEditingTodolistId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Fetch to-do items from the backend
  useEffect(() => {
    fetchTodolists();
  }, []);

  const fetchTodolists = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/todo');
      setTodolists(response.data);
    } catch (error) {
      console.error('Error fetching to-do items:', error.response?.data || error.message);
      alert('Failed to fetch to-do items. Please try again later.');
    }
  };

  const handleAddTodolist = async () => {
    if (!newTodolistText.trim()) {
      alert('Text is required!');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/todo', {
        text: newTodolistText, // Send 'text' to match backend
        completed: false,
      });
      setTodolists((prevTodolists) => [
        ...prevTodolists,
        { id: response.data.todoId, text: newTodolistText, completed: false },
      ]);
      setNewTodolistText('');
      setShowAddInput(false);
    } catch (error) {
      console.error('Error adding to-do item:', error.response?.data || error.message);
      alert('Failed to add to-do item. Please try again.');
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      await axios.put(`http://localhost:5000/api/todo/${id}`, { completed: !completed });
      setTodolists((prevTodolists) =>
        prevTodolists.map((todolist) =>
          todolist.id === id ? { ...todolist, completed: !completed } : todolist
        )
      );
    } catch (error) {
      console.error('Error toggling to-do item:', error.response?.data || error.message);
      alert('Failed to toggle to-do item. Please try again.');
    }
  };

  const handleEditTodolist = (id) => {
    setEditingTodolistId(id);
    const todolistToEdit = todolists.find((todolist) => todolist.id === id);
    setEditingText(todolistToEdit.text);
  };

  const handleSaveEditedTodolist = async () => {
    if (!editingText.trim()) {
      alert('Text is required!');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/todo/${editingTodolistId}`, { text: editingText });
      setTodolists((prevTodolists) =>
        prevTodolists.map((todolist) =>
          todolist.id === editingTodolistId ? { ...todolist, text: editingText } : todolist
        )
      );
      setEditingTodolistId(null);
      setEditingText('');
    } catch (error) {
      console.error('Error saving edited to-do item:', error.response?.data || error.message);
      alert('Failed to save edited to-do item. Please try again.');
    }
  };

  const handleDeleteTodolist = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/todo/${id}`);
      setTodolists((prevTodolists) => prevTodolists.filter((todolist) => todolist.id !== id));
    } catch (error) {
      console.error('Error deleting to-do item:', error.response?.data || error.message);
      alert('Failed to delete to-do item. Please try again.');
    }
  };

  const handleCancel = () => {
    setNewTodolistText('');
    setShowAddInput(false);
  };

  return (
    <div className="todo-container">
      <h1 className="todo-header">My To-Do List 📋</h1>

      <div className="todolist-list">
        {todolists.map((todolist) => (
          <div key={todolist.id} className="todolist-card">
            <div className="todolist-card-header">
              <div className="todolist-info">
                <span className={`todolist-status ${todolist.completed ? 'completed' : 'pending'}`}>
                  {todolist.completed ? 'Completed' : 'Pending'}
                </span>

                {/* Editable Text */}
                {editingTodolistId === todolist.id ? (
                  <input
                    type="text"
                    className="todolist-input"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onBlur={handleSaveEditedTodolist}
                    autoFocus
                  />
                ) : (
                  <p
                    className="todolist-text"
                    onClick={() => handleEditTodolist(todolist.id)}
                  >
                    {todolist.text}
                  </p>
                )}
              </div>

              <div className="todolist-actions">
                {/* Complete Button */}
                <button
                  onClick={() => handleToggleComplete(todolist.id, todolist.completed)}
                  className="complete-btn"
                >
                  {todolist.completed ? (
                    <FaCheckCircle className="complete-icon" />
                  ) : (
                    <FaRegCircle className="incomplete-icon" />
                  )}
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteTodolist(todolist.id)}
                  className="delete-btn"
                >
                  <FaTrashAlt className="delete-icon" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Todolist Input - Modal */}
      {showAddInput && (
        <div className="add-todolist-modal">
          <div className="add-todolist-panel">
            <h2 className="add-todolist-title">Add New Todolist</h2>
            <input
              type="text"
              placeholder="Enter todolist text"
              className="add-todolist-input"
              value={newTodolistText}
              onChange={(e) => setNewTodolistText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTodolist();
              }}
            />
            <div className="modal-actions">
              <button className="cancel-todolist-btn" onClick={handleCancel}>
                Cancel
              </button>
              <button className="save-todolist-btn" onClick={handleAddTodolist}>
                Save Todolist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Big Add Button */}
      <div className="add-button-container">
        <button
          className="add-todolist-button"
          onClick={() => setShowAddInput(true)}
        >
          <FaPlus />
        </button>
      </div>
    </div>
  );
}

export default TodoList;