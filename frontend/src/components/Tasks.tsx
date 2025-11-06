import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { FaTrashAlt, FaPlus, FaEdit, FaSearch, FaCalendarAlt, FaClipboardList, FaCheckCircle, FaClock, FaTimes } from 'react-icons/fa';
import FloatingActionButton from './FloatingActionButton';
import Modal from './Modal';
import { useScrollToTop } from '../utils/scrollToTop';

interface Task {
  id: number;
  title: string;
  description: string;
  deadline: string;
  is_completed: boolean;
}

interface TaskForm {
  title: string;
  description: string;
  deadline: string;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<TaskForm>({ title: '', description: '', deadline: '' });
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editedTask, setEditedTask] = useState<TaskForm>({ title: '', description: '', deadline: '' });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [suggestions, setSuggestions] = useState<Task[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  useScrollToTop();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async (): Promise<void> => {
    try {
      const response = await axios.get<Task[]>('/tasks');
      setTasks(response.data);
      setFilteredTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCreateTask = async (): Promise<void> => {
    if (!newTask.title.trim() || !newTask.description.trim()) {
      alert('Title and description are required!');
      return;
    }

    try {
      await axios.post('/tasks', newTask);
      fetchTasks();
      setNewTask({ title: '', description: '', deadline: '' });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: number): Promise<void> => {
    try {
      await axios.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditClick = (task: Task): void => {
    setEditingTaskId(task.id);
    setEditedTask({ title: task.title, description: task.description, deadline: task.deadline });
  };

  const handleSaveEdit = async (taskId: number): Promise<void> => {
    try {
      await axios.put(`/tasks/${taskId}`, editedTask);
      fetchTasks();
      setEditingTaskId(null);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCancelEdit = (): void => {
    setEditingTaskId(null);
    setSelectedTask(null);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
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

  const handleSuggestionClick = (taskTitle: string): void => {
    setSearchQuery(taskTitle);
    const matchedTask = tasks.find((task) =>
      task.title.toLowerCase() === taskTitle.toLowerCase()
    );

    if (matchedTask) {
      setFilteredTasks([matchedTask]);
      setSuggestions([]);
      setTimeout(() => {
        const taskElement = document.getElementById(`task-${matchedTask.id}`);
        if (taskElement) {
          taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const isOverdue = (deadline: string): boolean => new Date(deadline) < new Date();
  const isUrgent = (deadline: string): boolean => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return deadlineDate < tomorrow && deadlineDate > now;
  };

  const completedCount = filteredTasks.filter(task => task.is_completed).length;

  return (
    <div className="space-y-3">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-xl p-4 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold mb-1 flex items-center gap-2">
              <FaClipboardList className="text-base" />
              My Tasks
            </h1>
            <p className="text-white/90 text-sm">Manage your daily tasks and deadlines</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-xl font-bold">{filteredTasks.length}</div>
              <div className="text-xs text-white/80">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{completedCount}</div>
              <div className="text-xs text-white/80">Completed</div>
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
            placeholder="Search your tasks..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
          />
        </div>

        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-10 max-h-60 overflow-y-auto">
            <ul>
              {suggestions.map((task) => (
                <li 
                  key={task.id} 
                  onClick={() => handleSuggestionClick(task.title)} 
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                >
                  <FaSearch className="text-gray-400" />
                  <span>{task.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {searchQuery && filteredTasks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl mt-4">
            <FaSearch className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No tasks found matching "{searchQuery}"</p>
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
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
          placeholder="Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          autoFocus
        />
        <input
          type="text"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
          placeholder="Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        />
        <input
          type="datetime-local"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
          value={newTask.deadline}
          onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
        />
        <div className="flex gap-3 mt-6">
          <button 
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            onClick={() => setShowAddModal(false)}
          >
            Cancel
          </button>
          <button 
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            onClick={handleCreateTask}
          >
            Add Task
          </button>
        </div>
      </Modal>

      {/* Tasks List */}
      <div>
        {filteredTasks.length > 0 ? (
          <div className="space-y-3">
            {filteredTasks.map((task, index) => (
              <div
                key={task.id}
                id={`task-${task.id}`}
                className={`bg-white rounded-lg p-3 shadow-md hover:shadow-xl transition-all cursor-pointer border-2 ${
                  task.is_completed ? 'border-green-200 bg-green-50' : 'border-gray-100'
                }`}
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold flex-shrink-0 text-xs ${
                    task.is_completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base font-bold mb-1 ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    <p className="text-gray-600 mb-2 text-sm">{task.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FaCalendarAlt />
                      <span>{new Date(task.deadline).toLocaleDateString()}</span>
                      {isOverdue(task.deadline) && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">OVERDUE</span>
                      )}
                      {!isOverdue(task.deadline) && isUrgent(task.deadline) && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold">URGENT</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTask(task);
                        handleEditClick(task);
                      }}
                      title="Edit task"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this task?')) {
                          handleDeleteTask(task.id);
                        }
                      }}
                      title="Delete task"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'No tasks match your search.' : 'Start organizing your work with tasks and deadlines.'}
            </p>
            {!searchQuery && (
              <button
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
                onClick={() => setShowAddModal(true)}
              >
                <FaPlus />
                Create Your First Task
              </button>
            )}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTask(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <FaClipboardList />
                Task Details
              </h2>
              <button 
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setSelectedTask(null)}
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {editingTaskId === selectedTask.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={editedTask.title}
                      onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <input
                      type="text"
                      value={editedTask.description}
                      onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Deadline</label>
                    <input
                      type="datetime-local"
                      value={editedTask.deadline}
                      onChange={(e) => setEditedTask({ ...editedTask, deadline: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      onClick={() => handleSaveEdit(selectedTask.id)}
                    >
                      <FaCheckCircle />
                      Save Changes
                    </button>
                    <button 
                      className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                      selectedTask.is_completed 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedTask.is_completed ? (
                        <FaCheckCircle />
                      ) : (
                        <FaClock />
                      )}
                      <span className="font-semibold">{selectedTask.is_completed ? 'Completed' : 'Pending'}</span>
                    </div>
                    <div className={`px-4 py-2 rounded-xl font-semibold ${
                      isOverdue(selectedTask.deadline) 
                        ? 'bg-red-100 text-red-700' 
                        : isUrgent(selectedTask.deadline)
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isOverdue(selectedTask.deadline) ? 'Overdue' : isUrgent(selectedTask.deadline) ? 'Urgent' : 'Normal'}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedTask.title}</h3>
                  <p className="text-gray-700 mb-6">{selectedTask.description}</p>
                  
                  <div className="flex items-center gap-2 text-gray-500 mb-6">
                    <FaCalendarAlt />
                    <span>
                      {new Date(selectedTask.deadline).toLocaleDateString()} at {new Date(selectedTask.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                      onClick={() => handleEditClick(selectedTask)}
                    >
                      <FaEdit />
                      Edit Task
                    </button>
                    <button
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this task?')) {
                          handleDeleteTask(selectedTask.id);
                          setSelectedTask(null);
                        }
                      }}
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


