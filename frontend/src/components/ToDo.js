import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaClipboardList, FaEdit, FaCalendarAlt } from 'react-icons/fa';
import './TodoList.css';
import FloatingActionButton from './FloatingActionButton';
import Modal from './Modal';
import { useScrollToTop } from '../utils/scrollToTop';

// Compact todo styles are now handled in the main CSS file

function TodoList() {
  const [todolists, setTodolists] = useState([]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newTodolistText, setNewTodolistText] = useState('');
  
  // Scroll to top when component mounts
  useScrollToTop();
  const [newTodolistExpiry, setNewTodolistExpiry] = useState('');
  const [editingTodolistId, setEditingTodolistId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [editingExpiry, setEditingExpiry] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch to-do items from the backend
  useEffect(() => {
    fetchTodolists();
  }, []);

  // Real-time expiry checking - update every minute
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update expiry status
      setTodolists(prev => [...prev]);
    }, 60000); // Check every minute

    return () => clearInterval(interval);
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

  // Helper function to show success message
  const showSuccessMsg = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Helper function to check if todo is expired
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  // Helper function to check if todo is expiring soon (within 24 hours)
  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffHours = (expiry - now) / (1000 * 60 * 60);
    return diffHours <= 24 && diffHours > 0;
  };

  // Calculate todo statistics
  const getTodoStats = () => {
    const activeTodos = todolists.filter(todo => !todo.is_deleted);
    const completedTodos = activeTodos.filter(todo => todo.completed);
    const pendingTodos = activeTodos.filter(todo => !todo.completed);
    const expiredTodos = activeTodos.filter(todo => isExpired(todo.expiry_date));
    const expiringSoonTodos = activeTodos.filter(todo => isExpiringSoon(todo.expiry_date));
    
    return {
      total: activeTodos.length,
      completed: completedTodos.length,
      pending: pendingTodos.length,
      expired: expiredTodos.length,
      expiringSoon: expiringSoonTodos.length,
      completionRate: activeTodos.length > 0 ? Math.round((completedTodos.length / activeTodos.length) * 100) : 0
    };
  };

  const stats = getTodoStats();

  const handleAddTodolist = async () => {
    if (!newTodolistText.trim()) {
      alert('Text is required!');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/todo', {
        text: newTodolistText,
        completed: false,
        expiry_date: newTodolistExpiry || null,
      });
      setTodolists((prevTodolists) => [
        ...prevTodolists,
        { 
          id: response.data.todoId, 
          text: newTodolistText, 
          completed: false, 
          expiry_date: newTodolistExpiry || null,
          is_deleted: false
        },
      ]);
      setNewTodolistText('');
      setNewTodolistExpiry('');
      setShowAddInput(false);
      showSuccessMsg('Task added! ✅');
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
    
    // Format datetime for datetime-local input
    if (todolistToEdit.expiry_date) {
      const date = new Date(todolistToEdit.expiry_date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      setEditingExpiry(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      setEditingExpiry('');
    }
    setShowEditModal(true);
  };

  const handleSaveEditedTodolist = async () => {
    if (!editingText.trim()) {
      alert('Text is required!');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/todo/${editingTodolistId}`, { 
        text: editingText,
        expiry_date: editingExpiry || null
      });
      setTodolists((prevTodolists) =>
        prevTodolists.map((todolist) =>
          todolist.id === editingTodolistId ? { 
            ...todolist, 
            text: editingText, 
            expiry_date: editingExpiry || null 
          } : todolist
        )
      );
      setEditingTodolistId(null);
      setEditingText('');
      setEditingExpiry('');
      setShowEditModal(false);
      showSuccessMsg('Task updated! ✏️');
    } catch (error) {
      console.error('Error saving edited to-do item:', error.response?.data || error.message);
      alert('Failed to save edited to-do item. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingTodolistId(null);
    setEditingText('');
    setEditingExpiry('');
    setShowEditModal(false);
  };


  const handleDeleteTodolist = async (id) => {
    try {
      // Soft delete - move to trash
      await axios.put(`http://localhost:5000/api/todo/${id}`, { 
        is_deleted: true,
        deleted_at: new Date().toISOString()
      });
      setTodolists((prevTodolists) =>
        prevTodolists.map((todolist) =>
          todolist.id === id ? { ...todolist, is_deleted: true, deleted_at: new Date().toISOString() } : todolist
        )
      );
      showSuccessMsg('Task moved to trash! 🗑️');
    } catch (error) {
      console.error('Error deleting to-do item:', error.response?.data || error.message);
      alert('Failed to delete to-do item. Please try again.');
    }
  };

  const handleRestoreTodolist = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/todo/${id}`, { 
        is_deleted: false,
        deleted_at: null
      });
      setTodolists((prevTodolists) =>
        prevTodolists.map((todolist) =>
          todolist.id === id ? { ...todolist, is_deleted: false, deleted_at: null } : todolist
        )
      );
      showSuccessMsg('Task restored! ♻️');
    } catch (error) {
      console.error('Error restoring to-do item:', error.response?.data || error.message);
      alert('Failed to restore to-do item. Please try again.');
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this task? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/api/todo/${id}`);
      setTodolists((prevTodolists) => prevTodolists.filter((todolist) => todolist.id !== id));
      showSuccessMsg('Task permanently deleted! 🗑️');
    } catch (error) {
      console.error('Error permanently deleting to-do item:', error.response?.data || error.message);
      alert('Failed to permanently delete to-do item. Please try again.');
    }
  };

  const handleCancel = () => {
    setNewTodolistText('');
    setNewTodolistExpiry('');
    setShowAddInput(false);
  };

  // Filter todos based on current view
  const activeTodos = todolists.filter(todo => !todo.is_deleted);
  const deletedTodos = todolists.filter(todo => todo.is_deleted);
  const currentTodos = showTrash ? deletedTodos : activeTodos;

  // Sort todos: completed first, then pending
  const sortedTodos = currentTodos.sort((a, b) => {
    if (a.completed && !b.completed) return -1; // a comes first
    if (!a.completed && b.completed) return 1;  // b comes first
    return 0; // maintain original order for same status
  });

  return (
    <div className="todo-list-container">
      {/* Header */}
      <div className="todo-list-header">
        <h1 className="todo-list-title">
          <FaClipboardList className="todo-list-title-icon" />
          To-Do List
        </h1>
        
        {/* View Toggle */}
        <div className="todo-list-view-toggle">
          <button 
            className={`todo-list-toggle-btn ${!showTrash ? 'active' : ''}`}
            onClick={() => setShowTrash(false)}
          >
            Active
          </button>
          <button 
            className={`todo-list-toggle-btn ${showTrash ? 'active' : ''}`}
            onClick={() => setShowTrash(true)}
          >
            Trash
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="todo-list-stats">
        <div className="todo-list-stat-item">
          <span className="todo-list-stat-number">{stats.total}</span>
          <span className="todo-list-stat-label">Total</span>
        </div>
        <div className="todo-list-stat-item">
          <span className="todo-list-stat-number">{stats.completed}</span>
          <span className="todo-list-stat-label">Completed</span>
        </div>
        <div className="todo-list-stat-item">
          <span className="todo-list-stat-number">{stats.completionRate}%</span>
          <span className="todo-list-stat-label">Done</span>
        </div>
        
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="todo-list-success-message">
          {successMessage}
        </div>
      )}

      {/* Todo List */}
      <div className="todo-list-items">
        {sortedTodos.length > 0 ? (
          sortedTodos.map((todo, index) => (
            <div
              key={todo.id}
              className={`todo-list-item ${todo.completed ? 'completed' : ''} ${isExpired(todo.expiry_date) ? 'expired' : ''}`}
            >
              {/* Task Number */}
              <div className="todo-list-task-number">
                {index + 1}
              </div>
              {/* Status Indicator */}
              <button
                className="todo-list-status-btn"
                onClick={() => handleToggleComplete(todo.id, todo.completed)}
              >
                {todo.completed ? 'Completed' : 'Pending'}
              </button>

              {/* Todo Content */}
              <div className="todo-list-content">
                <div className="todo-list-text" onClick={() => handleEditTodolist(todo.id)}>
                  {todo.text || 'No text available'}
                </div>
                {todo.expiry_date && (
                  <div className={`todo-list-date ${isExpired(todo.expiry_date) ? 'overdue' : isExpiringSoon(todo.expiry_date) ? 'expiring-soon' : ''}`}>
                    <FaCalendarAlt />
                    <span>
                      {new Date(todo.expiry_date).toLocaleDateString()} at {new Date(todo.expiry_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      {isExpired(todo.expiry_date) && <span style={{marginLeft: '4px', fontWeight: 'bold'}}>OVERDUE</span>}
                      {!isExpired(todo.expiry_date) && isExpiringSoon(todo.expiry_date) && <span style={{marginLeft: '4px', fontWeight: 'bold'}}>DUE SOON</span>}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="todo-list-actions">
                {!showTrash ? (
                  <>
                    <button
                      className="todo-list-action-btn edit"
                      onClick={() => handleEditTodolist(todo.id)}
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      className="todo-list-action-btn delete"
                      onClick={() => handleDeleteTodolist(todo.id)}
                      title="Delete"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="todo-list-action-btn restore"
                      onClick={() => handleRestoreTodolist(todo.id)}
                      title="Restore"
                    >
                      Restore
                    </button>
                    <button
                      className="todo-list-action-btn permanent-delete"
                      onClick={() => handlePermanentDelete(todo.id)}
                      title="Delete Forever"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="todo-list-empty-state">
            <div className="todo-list-empty-icon">{showTrash ? '🗑️' : '📝'}</div>
            <h3 className="todo-list-empty-title">
              {showTrash ? 'Trash is empty' : 'No tasks yet'}
            </h3>
            <p className="todo-list-empty-text">
              {showTrash 
                ? 'No deleted tasks to restore.' 
                : 'Add your first task to get started.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={showAddInput}
        onClose={handleCancel}
        title="Add New Task"
      >
        <input
          type="text"
          className="modal-input"
          placeholder="What needs to be done?"
          value={newTodolistText}
          onChange={(e) => setNewTodolistText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddTodolist();
          }}
          autoFocus
        />
        <div className="modal-date-container">
          <label htmlFor="due-date" className="modal-date-label">Due Date & Time (Optional)</label>
          <input
            id="due-date"
            type="datetime-local"
            className="modal-date"
            placeholder="Select due date and time"
            value={newTodolistExpiry}
            onChange={(e) => setNewTodolistExpiry(e.target.value)}
          />
        </div>
        <div className="modal-buttons">
          <button className="modal-button modal-button-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button className="modal-button modal-button-save" onClick={handleAddTodolist}>
            Add Task
          </button>
        </div>
      </Modal>

      {/* Floating Action Button */}
      {!showTrash && (
        <FloatingActionButton
          onClick={() => setShowAddInput(true)}
          variant="tasks"
          icon="+"
          title="Add new task"
          ariaLabel="Add new task"
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="todo-edit-modal-overlay" onClick={handleCancelEdit}>
          <div className="todo-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="todo-edit-modal-header">
              <h2 className="todo-edit-modal-title">
                <FaEdit />
                Edit Task
              </h2>
              <button className="todo-edit-modal-close" onClick={handleCancelEdit}>
                ×
              </button>
            </div>
            
            <div className="todo-edit-modal-body">
              <div className="todo-edit-form-group">
                <label className="todo-edit-form-label">Task Description</label>
                <textarea
                  className="todo-edit-form-textarea"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  placeholder="Enter task description..."
                  autoFocus
                />
              </div>
              
              <div className="todo-edit-form-group">
                <label className="todo-edit-form-label">Due Date & Time (Optional)</label>
                <input
                  type="datetime-local"
                  className="todo-edit-form-input"
                  value={editingExpiry}
                  onChange={(e) => setEditingExpiry(e.target.value)}
                />
              </div>
            </div>
            
            <div className="todo-edit-modal-footer">
              <button className="todo-edit-modal-btn todo-edit-modal-btn-cancel" onClick={handleCancelEdit}>
                Cancel
              </button>
              <button className="todo-edit-modal-btn todo-edit-modal-btn-save" onClick={handleSaveEditedTodolist}>
                <FaEdit />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default TodoList;