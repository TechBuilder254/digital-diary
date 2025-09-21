import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrashAlt, FaPlus, FaEdit, FaSearch, FaCalendarAlt, FaClipboardList, FaCheckCircle, FaClock } from 'react-icons/fa';
import './the.css';
import '../styles/design-system.css';
import FloatingActionButton from './FloatingActionButton';
import Modal from './Modal';
import { useScrollToTop } from '../utils/scrollToTop';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '' });
  const [editingTaskId, setEditingTaskId] = useState(null);
  
  // Scroll to top when component mounts
  useScrollToTop();
  const [selectedTask, setSelectedTask] = useState(null);
  const [editedTask, setEditedTask] = useState({ title: '', description: '', deadline: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false); // State to control modal visibility

  // Debug function
  const handleShowModal = () => {
    console.log('Opening modal...');
    setShowAddModal(true);
  };

  // Debug modal state changes
  useEffect(() => {
    console.log('Modal state changed:', showAddModal);
  }, [showAddModal]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tasks');
      setTasks(response.data);
      setFilteredTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !newTask.description.trim()) {
      alert('Title and description are required!');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/tasks', newTask);
      fetchTasks();
      setNewTask({ title: '', description: '', deadline: '' });
      setShowAddModal(false); // Close the modal after adding the task
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditClick = (task) => {
    setEditingTaskId(task.id);
    setEditedTask({ title: task.title, description: task.description, deadline: task.deadline });
  };

  const handleSaveEdit = async (taskId) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`, editedTask);
      fetchTasks();
      setEditingTaskId(null);
      setSelectedTask(null); // Close the modal and return to task list
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setSelectedTask(null); // Close the modal and return to task list
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      setFilteredTasks(tasks);
      setSuggestions([]);
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = tasks.filter((task) =>
        task.title.toLowerCase().includes(lowerQuery)
      );
      setFilteredTasks(filtered);

      const suggest = tasks.filter((task) =>
        task.title.toLowerCase().startsWith(lowerQuery)
      );
      setSuggestions(suggest);
    }
  };

  const handleSuggestionClick = (taskTitle) => {
    setSearchQuery(taskTitle);

    const matchedTask = tasks.find((task) =>
      task.title.toLowerCase() === taskTitle.toLowerCase()
    );

    if (matchedTask) {
      setFilteredTasks([matchedTask]);
      setSuggestions([]);

      // Scroll and highlight
      setTimeout(() => {
        const taskElement = document.getElementById(`task-${matchedTask.id}`);
        if (taskElement) {
          taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          taskElement.classList.add('highlight');

          setTimeout(() => {
            taskElement.classList.remove('highlight');
          }, 2000);
        }
      }, 100);
    }
  };

  return (
    <div className="tasks-container">
      {/* Header Section */}
      <div className="tasks-header animate-fade-in">
        <div className="header-content">
          <h1 className="page-title">
            <FaClipboardList className="title-icon" />
            My Tasks
          </h1>
          <p className="page-subtitle">Manage your daily tasks and deadlines</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{filteredTasks.length}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{filteredTasks.filter(task => task.is_completed).length}</span>
            <span className="stat-label">Completed</span>
          </div>
          <button
            style={{
              background: 'green',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginLeft: '20px'
            }}
            onClick={handleShowModal}
          >
            ADD TASK
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section animate-fade-in" style={{ '--delay': '0.1s' }}>
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search your tasks..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        {/* Autocomplete suggestions */}
        {suggestions.length > 0 && (
          <div className="suggestions-container">
            <ul className="suggestions-list">
              {suggestions.map((task) => (
                <li key={task.id} onClick={() => handleSuggestionClick(task.title)} className="suggestion-item">
                  <FaSearch className="suggestion-icon" />
                  <span>{task.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {searchQuery && filteredTasks.length === 0 && (
          <div className="no-results">
            <FaSearch className="no-results-icon" />
            <p>No tasks found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Task"
      >
        <input
          type="text"
          className="modal-input"
          placeholder="Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          autoFocus
        />
        <input
          type="text"
          className="modal-input"
          placeholder="Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        />
        <input
          type="datetime-local"
          className="modal-date"
          value={newTask.deadline}
          onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
        />
        <div className="modal-buttons">
          <button className="modal-button modal-button-cancel" onClick={() => setShowAddModal(false)}>
            Cancel
          </button>
          <button className="modal-button modal-button-save" onClick={handleCreateTask}>
            Add Task
          </button>
        </div>
      </Modal>

      {/* Tasks List */}
      <div className="tasks-list-container animate-fade-in" style={{ '--delay': '0.2s' }}>
        {filteredTasks.length > 0 ? (
          <div className="tasks-list">
            {filteredTasks.map((task, index) => (
              <div
                key={task.id}
                className={`task-list-item ${task.is_completed ? 'completed' : ''}`}
                onClick={() => setSelectedTask(task)}
                style={{ '--delay': `${index * 0.05}s` }}
              >
                <div className="task-number">
                  {index + 1}
                </div>
                <div className="task-info">
                  <div className="task-main-info">
                    <h3 className="task-title">{task.title}</h3>
                    <div className="task-meta">
                      <span className="task-description">{task.description}</span>
                      <span className="task-deadline">
                        <FaCalendarAlt className="deadline-icon" />
                        {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="task-actions-container">
                    <div className="task-status-badge">
                      <div className={`status-indicator ${task.is_completed ? 'completed' : 'pending'}`}>
                        {task.is_completed ? (
                          <FaCheckCircle className="status-icon" />
                        ) : (
                          <FaClock className="status-icon" />
                        )}
                      </div>
                      <div className={`priority-dot ${new Date(task.deadline) < new Date() ? 'overdue' : new Date(task.deadline) < new Date(Date.now() + 24*60*60*1000) ? 'urgent' : 'normal'}`}></div>
                    </div>
                    <div className="task-actions">
                      <button
                        className="action-btn edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(task);
                          setEditingTaskId(task.id);
                          setEditedTask({ title: task.title, description: task.description, deadline: task.deadline });
                        }}
                        title="Edit task"
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this task?')) {
                            handleDeleteTask(task.id);
                          }
                        }}
                        title="Delete task"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3 className="empty-title">No tasks yet</h3>
            <p className="empty-description">
              {searchQuery ? 'No tasks match your search.' : 'Start organizing your work with tasks and deadlines.'}
            </p>
        {!searchQuery && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={handleShowModal}
            >
              <FaPlus />
              Create Your First Task
            </button>
            <button
              style={{
                background: 'red',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onClick={handleShowModal}
            >
              TEST MODAL BUTTON
            </button>
          </div>
        )}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="task-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <FaClipboardList className="title-icon" />
                Task Details
              </h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedTask(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {editingTaskId === selectedTask.id ? (
                <div className="task-edit-form">
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={editedTask.title}
                      onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      value={editedTask.description}
                      onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Deadline</label>
                    <input
                      type="datetime-local"
                      value={editedTask.deadline}
                      onChange={(e) => setEditedTask({ ...editedTask, deadline: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-actions">
                    <button className="btn btn-success" onClick={() => handleSaveEdit(selectedTask.id)}>
                      <FaCheckCircle />
                      Save Changes
                    </button>
                    <button className="btn btn-secondary" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="task-detail-content">
                  <div className="task-status-section">
                    <div className="status-badge">
                      {selectedTask.is_completed ? (
                        <FaCheckCircle className="status-icon completed" />
                      ) : (
                        <FaClock className="status-icon pending" />
                      )}
                      <span className={`status-text ${selectedTask.is_completed ? 'completed' : 'pending'}`}>
                        {selectedTask.is_completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    <div className={`priority-badge ${new Date(selectedTask.deadline) < new Date() ? 'overdue' : new Date(selectedTask.deadline) < new Date(Date.now() + 24*60*60*1000) ? 'urgent' : 'normal'}`}>
                      {new Date(selectedTask.deadline) < new Date() ? 'Overdue' : new Date(selectedTask.deadline) < new Date(Date.now() + 24*60*60*1000) ? 'Urgent' : 'Normal'}
                    </div>
                  </div>
                  
                  <div className="task-details">
                    <h3 className="detail-title">{selectedTask.title}</h3>
                    <p className="detail-description">{selectedTask.description}</p>
                    
                    <div className="detail-meta">
                      <div className="meta-item">
                        <FaCalendarAlt className="meta-icon" />
                        <div className="meta-content">
                          <span className="meta-label">Deadline</span>
                          <span className="meta-value">
                            {new Date(selectedTask.deadline).toLocaleDateString()} at {new Date(selectedTask.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="task-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEditClick(selectedTask)}
                    >
                      <FaEdit />
                      Edit Task
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteTask(selectedTask.id)}
                    >
                      <FaTrashAlt />
                      Delete Task
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Add Task Button */}
      <FloatingActionButton
        onClick={() => setShowAddModal(true)}
        variant="tasks"
        icon="+"
        title="Add new task"
        ariaLabel="Add new task"
      />
    </div>
  );
};

export default Tasks;