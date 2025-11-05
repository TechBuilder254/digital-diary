// API Configuration
// This allows easy switching between local development and production

const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://your-project.vercel.app/api'  // Replace with your Vercel URL
    : '/api'  // Relative path works with Vercel dev and proxy
  );

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  endpoints: {
    auth: {
      login: `${API_BASE_URL}/auth?action=login`,
      register: `${API_BASE_URL}/auth?action=register`,
      forgotPassword: `${API_BASE_URL}/auth?action=forgot-password`,
    },
    users: {
      profile: (id) => `${API_BASE_URL}/users/profile/${id}`,
      stats: (id) => `${API_BASE_URL}/users/profile/${id}/stats`,
      password: (id) => `${API_BASE_URL}/users/profile/${id}/password`,
    },
    entries: {
      list: `${API_BASE_URL}/entries`,
      create: `${API_BASE_URL}/entries`,
      update: (id) => `${API_BASE_URL}/entries/${id}`,
      delete: (id) => `${API_BASE_URL}/entries/${id}`,
    },
    todos: {
      list: `${API_BASE_URL}/todo`,
      create: `${API_BASE_URL}/todo`,
      update: (id) => `${API_BASE_URL}/todo/${id}`,
      delete: (id) => `${API_BASE_URL}/todo/${id}`,
      trash: `${API_BASE_URL}/todo/trash`,
      restore: (id) => `${API_BASE_URL}/todo/${id}/restore`,
      permanentDelete: (id) => `${API_BASE_URL}/todo/${id}/permanent`,
    },
    tasks: {
      list: `${API_BASE_URL}/tasks`,
      create: `${API_BASE_URL}/tasks`,
      update: (id) => `${API_BASE_URL}/tasks/${id}`,
      delete: (id) => `${API_BASE_URL}/tasks/${id}`,
    },
    moods: {
      list: `${API_BASE_URL}/moods`,
      create: `${API_BASE_URL}/moods`,
      delete: (id) => `${API_BASE_URL}/moods/${id}`,
    },
    notes: {
      list: `${API_BASE_URL}/notes`,
      create: `${API_BASE_URL}/notes`,
      update: (id) => `${API_BASE_URL}/notes/${id}`,
      delete: (id) => `${API_BASE_URL}/notes/${id}`,
      favorite: (id) => `${API_BASE_URL}/notes/${id}/favorite`,
      favorites: `${API_BASE_URL}/notes/favorites`,
      category: (category) => `${API_BASE_URL}/notes/category/${category}`,
      uploadAudio: `${API_BASE_URL}/notes/upload-audio`,
      audio: (filename) => `${API_BASE_URL}/notes/audio/${filename}`,
    },
  },
};

export default API_CONFIG;

