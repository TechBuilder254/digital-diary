import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { FaClipboardList, FaEdit, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import FloatingActionButton from './FloatingActionButton';
import Modal from './Modal';
import { useScrollToTop } from '../utils/scrollToTop';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  expiry_date: string | null;
  is_deleted: boolean;
  deleted_at?: string | null;
}

interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  expired: number;
  expiringSoon: number;
  completionRate: number;
}

const TodoList: React.FC = () => {
  const [todolists, setTodolists] = useState<Todo[]>([]);
  const [showAddInput, setShowAddInput] = useState<boolean>(false);
  const [newTodolistText, setNewTodolistText] = useState<string>('');
  const [newTodolistExpiry, setNewTodolistExpiry] = useState<string>('');
  const [editingTodolistId, setEditingTodolistId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [editingExpiry, setEditingExpiry] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showTrash, setShowTrash] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useScrollToTop();

  useEffect(() => {
    fetchTodolists();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTodolists(prev => [...prev]);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchTodolists = async (): Promise<void> => {
    try {
      const response = await axios.get<Todo[]>('/todo');
      // Ensure response.data is always an array
      const todosArray = Array.isArray(response.data) ? response.data : [];
      setTodolists(todosArray);
    } catch (error: any) {
      console.error('Error fetching to-do items:', error.response?.data || error.message);
      alert('Failed to fetch to-do items. Please try again later.');
      setTodolists([]); // Set empty array on error
    }
  };

  const showSuccessMsg = (message: string): void => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const isExpired = (expiryDate: string | null): boolean => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate: string | null): boolean => {
    if (!expiryDate) return false;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffHours = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours <= 24 && diffHours > 0;
  };

  const getTodoStats = (): TodoStats => {
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

  const handleAddTodolist = async (): Promise<void> => {
    if (!newTodolistText.trim()) {
      alert('Text is required!');
      return;
    }

    try {
      const response = await axios.post<{ todoId: number }>('/todo', {
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
    } catch (error: any) {
      console.error('Error adding to-do item:', error.response?.data || error.message);
      alert('Failed to add to-do item. Please try again.');
    }
  };

  const handleToggleComplete = async (id: number, completed: boolean): Promise<void> => {
    try {
      await axios.put(`/todo/${id}`, { completed: !completed });
      setTodolists((prevTodolists) =>
        prevTodolists.map((todolist) =>
          todolist.id === id ? { ...todolist, completed: !completed } : todolist
        )
      );
    } catch (error: any) {
      console.error('Error toggling to-do item:', error.response?.data || error.message);
      alert('Failed to toggle to-do item. Please try again.');
    }
  };

  const handleEditTodolist = (id: number): void => {
    setEditingTodolistId(id);
    const todolistToEdit = todolists.find((todolist) => todolist.id === id);
    if (todolistToEdit) {
      setEditingText(todolistToEdit.text);
      
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
    }
  };

  const handleSaveEditedTodolist = async (): Promise<void> => {
    if (!editingText.trim()) {
      alert('Text is required!');
      return;
    }

    if (!editingTodolistId) return;

    try {
      await axios.put(`/todo/${editingTodolistId}`, { 
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
    } catch (error: any) {
      console.error('Error saving edited to-do item:', error.response?.data || error.message);
      alert('Failed to save edited to-do item. Please try again.');
    }
  };

  const handleCancelEdit = (): void => {
    setEditingTodolistId(null);
    setEditingText('');
    setEditingExpiry('');
    setShowEditModal(false);
  };

  const handleDeleteTodolist = async (id: number): Promise<void> => {
    try {
      await axios.put(`/todo/${id}`, { 
        is_deleted: true,
        deleted_at: new Date().toISOString()
      });
      setTodolists((prevTodolists) =>
        prevTodolists.map((todolist) =>
          todolist.id === id ? { ...todolist, is_deleted: true, deleted_at: new Date().toISOString() } : todolist
        )
      );
      showSuccessMsg('Task moved to trash! 🗑️');
    } catch (error: any) {
      console.error('Error deleting to-do item:', error.response?.data || error.message);
      alert('Failed to delete to-do item. Please try again.');
    }
  };

  const handleRestoreTodolist = async (id: number): Promise<void> => {
    try {
      await axios.put(`/todo/${id}`, { 
        is_deleted: false,
        deleted_at: null
      });
      setTodolists((prevTodolists) =>
        prevTodolists.map((todolist) =>
          todolist.id === id ? { ...todolist, is_deleted: false, deleted_at: null } : todolist
        )
      );
      showSuccessMsg('Task restored! ♻️');
    } catch (error: any) {
      console.error('Error restoring to-do item:', error.response?.data || error.message);
      alert('Failed to restore to-do item. Please try again.');
    }
  };

  const handlePermanentDelete = async (id: number): Promise<void> => {
    if (!window.confirm('Are you sure you want to permanently delete this task? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`/todo/${id}`);
      setTodolists((prevTodolists) => prevTodolists.filter((todolist) => todolist.id !== id));
      showSuccessMsg('Task permanently deleted! 🗑️');
    } catch (error: any) {
      console.error('Error permanently deleting to-do item:', error.response?.data || error.message);
      alert('Failed to permanently delete to-do item. Please try again.');
    }
  };

  const handleCancel = (): void => {
    setNewTodolistText('');
    setNewTodolistExpiry('');
    setShowAddInput(false);
  };

  // Ensure todolists is always an array
  const safeTodolists = Array.isArray(todolists) ? todolists : [];
  const activeTodos = safeTodolists.filter(todo => !todo.is_deleted);
  const deletedTodos = safeTodolists.filter(todo => todo.is_deleted);
  const currentTodos = showTrash ? deletedTodos : activeTodos;

  // Ensure currentTodos is an array before sorting
  const sortedTodos = Array.isArray(currentTodos) 
    ? [...currentTodos].sort((a, b) => {
        if (a.completed && !b.completed) return -1;
        if (!a.completed && b.completed) return 1;
        return 0;
      })
    : [];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-xl p-4 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold mb-1 flex items-center gap-2">
              <FaClipboardList className="text-base" />
              To-Do List
            </h1>
          </div>
          <div className="flex gap-2">
            <button 
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors text-sm ${
                !showTrash 
                  ? 'bg-white text-indigo-600' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              onClick={() => setShowTrash(false)}
            >
              Active
            </button>
            <button 
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors text-sm ${
                showTrash 
                  ? 'bg-white text-indigo-600' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              onClick={() => setShowTrash(true)}
            >
              Trash
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-3 shadow-md text-center">
          <div className="text-xl font-bold text-gray-900 mb-0.5">{stats.total}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-md text-center">
          <div className="text-xl font-bold text-gray-900 mb-0.5">{stats.completed}</div>
          <div className="text-xs text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-md text-center">
          <div className="text-xl font-bold text-gray-900 mb-0.5">{stats.completionRate}%</div>
          <div className="text-xs text-gray-600">Done</div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg text-sm">
          <span>{successMessage}</span>
        </div>
      )}

      {/* Todo List */}
      <div className="space-y-3">
        {sortedTodos.length > 0 ? (
          sortedTodos.map((todo, index) => (
            <div
              key={todo.id}
              className={`bg-white rounded-lg p-3 shadow-md border-2 transition-all ${
                todo.completed 
                  ? 'border-green-200 bg-green-50' 
                  : isExpired(todo.expiry_date)
                  ? 'border-red-200 bg-red-50'
                  : 'border-gray-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold flex-shrink-0 text-xs ${
                  todo.completed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                }`}>
                  {index + 1}
                </div>
                <button
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    todo.completed 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                  onClick={() => handleToggleComplete(todo.id, todo.completed)}
                >
                  {todo.completed ? 'Completed' : 'Pending'}
                </button>

                <div className="flex-1 min-w-0">
                  <div 
                    className={`text-sm font-medium mb-1 cursor-pointer ${
                      todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}
                    onClick={() => handleEditTodolist(todo.id)}
                  >
                    {todo.text || 'No text available'}
                  </div>
                  {todo.expiry_date && (
                    <div className={`flex items-center gap-2 text-xs ${
                      isExpired(todo.expiry_date) 
                        ? 'text-red-600 font-semibold' 
                        : isExpiringSoon(todo.expiry_date)
                        ? 'text-orange-600 font-semibold'
                        : 'text-gray-500'
                    }`}>
                      <FaCalendarAlt />
                      <span>
                        {new Date(todo.expiry_date).toLocaleDateString()} at {new Date(todo.expiry_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      {isExpired(todo.expiry_date) && <span className="font-bold">OVERDUE</span>}
                      {!isExpired(todo.expiry_date) && isExpiringSoon(todo.expiry_date) && <span className="font-bold">DUE SOON</span>}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {!showTrash ? (
                    <>
                      <button
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                        onClick={() => handleEditTodolist(todo.id)}
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                        onClick={() => handleDeleteTodolist(todo.id)}
                        title="Delete"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        onClick={() => handleRestoreTodolist(todo.id)}
                        title="Restore"
                      >
                        Restore
                      </button>
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                        onClick={() => handlePermanentDelete(todo.id)}
                        title="Delete Forever"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-lg">
            <div className="text-4xl mb-3">{showTrash ? '🗑️' : '📝'}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {showTrash ? 'Trash is empty' : 'No tasks yet'}
            </h3>
            <p className="text-gray-600">
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
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
          placeholder="What needs to be done?"
          value={newTodolistText}
          onChange={(e) => setNewTodolistText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddTodolist();
          }}
          autoFocus
        />
        <div className="mb-4">
          <label htmlFor="due-date" className="block text-sm font-semibold text-gray-700 mb-2">
            Due Date & Time (Optional)
          </label>
          <input
            id="due-date"
            type="datetime-local"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
            value={newTodolistExpiry}
            onChange={(e) => setNewTodolistExpiry(e.target.value)}
          />
        </div>
        <div className="flex gap-3 mt-6">
          <button 
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button 
            className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            onClick={handleAddTodolist}
          >
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
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleCancelEdit}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <FaEdit />
                Edit Task
              </h2>
              <button 
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={handleCancelEdit}
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Task Description</label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none resize-none"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  placeholder="Enter task description..."
                  rows={4}
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date & Time (Optional)</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
                  value={editingExpiry}
                  onChange={(e) => setEditingExpiry(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
              <button 
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                onClick={handleSaveEditedTodolist}
              >
                <FaEdit />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList;


