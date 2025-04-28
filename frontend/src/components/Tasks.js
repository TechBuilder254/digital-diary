import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrashAlt, FaPlus } from 'react-icons/fa'; // Import the plus icon
import './the.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '' });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState({ title: '', description: '', deadline: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false); // State to control modal visibility

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
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
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
      <div className="tasks-header">
        <h1>Tasks</h1>
      </div>

      {/* Search bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={handleSearch}
        />

        {/* Autocomplete suggestions */}
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((task) => (
              <li key={task.id} onClick={() => handleSuggestionClick(task.title)}>
                {task.title}
              </li>
            ))}
          </ul>
        )}

        {searchQuery && filteredTasks.length === 0 && (
          <div className="no-results">No tasks found.</div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Task</h2>
            <input
              type="text"
              placeholder="Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <input
              type="text"
              placeholder="Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <input
              type="datetime-local"
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
            />
            <div className="modal-buttons">
              <button onClick={handleCreateTask}>Add Task</button>
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks list */}
      <ul className="tasks-list">
        {filteredTasks.map((task) => (
          <li key={task.id} id={`task-${task.id}`}>
            {editingTaskId === task.id ? (
              <div className="task-content">
                <input
                  type="text"
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                />
                <input
                  type="text"
                  value={editedTask.description}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                />
                <input
                  type="datetime-local"
                  value={editedTask.deadline}
                  onChange={(e) => setEditedTask({ ...editedTask, deadline: e.target.value })}
                />
                <div className="task-buttons">
                  <button onClick={() => handleSaveEdit(task.id)}>Save</button>
                  <button onClick={handleCancelEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="task-content">
                <strong>{task.title}</strong>
                <p>{task.description}</p>
                <small>Deadline: {new Date(task.deadline).toLocaleString()}</small>
                <div className="task-buttons">
                  <button onClick={() => handleEditClick(task)}>Edit</button>
                  <button onClick={() => handleDeleteTask(task.id)} className="delete-btn">
                    <FaTrashAlt className="delete-icon" />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Floating Add Task Button */}
      <button className="floating-add-task-button" onClick={() => setShowAddModal(true)}>
        <FaPlus />
      </button>
    </div>
  );
};

export default Tasks;