// API Configuration
// This allows easy switching between local development and production

const normalizeBaseUrl = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.replace(/\/+$/, '');
  if (trimmed.endsWith('/api')) {
    return trimmed;
  }
  return `${trimmed}/api`;
};

const envBaseUrl = normalizeBaseUrl(process.env.REACT_APP_API_URL);

const API_BASE_URL = envBaseUrl || '/api';

interface APIEndpoints {
  auth: {
    login: string;
    register: string;
    forgotPassword: string;
  };
  users: {
    profile: (id: string | number) => string;
    stats: (id: string | number) => string;
    password: (id: string | number) => string;
  };
  entries: {
    list: string;
    create: string;
    update: (id: string | number) => string;
    delete: (id: string | number) => string;
  };
  todos: {
    list: string;
    create: string;
    update: (id: string | number) => string;
    delete: (id: string | number) => string;
    trash: string;
    restore: (id: string | number) => string;
    permanentDelete: (id: string | number) => string;
  };
  tasks: {
    list: string;
    create: string;
    update: (id: string | number) => string;
    delete: (id: string | number) => string;
  };
  moods: {
    list: string;
    create: string;
    delete: (id: string | number) => string;
  };
  notes: {
    list: string;
    create: string;
    update: (id: string | number) => string;
    delete: (id: string | number) => string;
    favorite: (id: string | number) => string;
    favorites: string;
    category: (category: string) => string;
    uploadAudio: string;
    audio: (filename: string) => string;
  };
}

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  endpoints: {
    auth: {
      login: `${API_BASE_URL}/auth?action=login`,
      register: `${API_BASE_URL}/auth?action=register`,
      forgotPassword: `${API_BASE_URL}/auth?action=forgot-password`,
    },
    users: {
      profile: (id: string | number) => `${API_BASE_URL}/users/profile/${id}`,
      stats: (id: string | number) => `${API_BASE_URL}/users/profile/${id}/stats`,
      password: (id: string | number) => `${API_BASE_URL}/users/profile/${id}/password`,
    },
    entries: {
      list: `${API_BASE_URL}/entries`,
      create: `${API_BASE_URL}/entries`,
      update: (id: string | number) => `${API_BASE_URL}/entries/${id}`,
      delete: (id: string | number) => `${API_BASE_URL}/entries/${id}`,
    },
    todos: {
      list: `${API_BASE_URL}/todo`,
      create: `${API_BASE_URL}/todo`,
      update: (id: string | number) => `${API_BASE_URL}/todo/${id}`,
      delete: (id: string | number) => `${API_BASE_URL}/todo/${id}`,
      trash: `${API_BASE_URL}/todo/trash`,
      restore: (id: string | number) => `${API_BASE_URL}/todo/${id}/restore`,
      permanentDelete: (id: string | number) => `${API_BASE_URL}/todo/${id}/permanent`,
    },
    tasks: {
      list: `${API_BASE_URL}/tasks`,
      create: `${API_BASE_URL}/tasks`,
      update: (id: string | number) => `${API_BASE_URL}/tasks/${id}`,
      delete: (id: string | number) => `${API_BASE_URL}/tasks/${id}`,
    },
    moods: {
      list: `${API_BASE_URL}/moods`,
      create: `${API_BASE_URL}/moods`,
      delete: (id: string | number) => `${API_BASE_URL}/moods/${id}`,
    },
    notes: {
      list: `${API_BASE_URL}/notes`,
      create: `${API_BASE_URL}/notes`,
      update: (id: string | number) => `${API_BASE_URL}/notes/${id}`,
      delete: (id: string | number) => `${API_BASE_URL}/notes/${id}`,
      favorite: (id: string | number) => `${API_BASE_URL}/notes/${id}/favorite`,
      favorites: `${API_BASE_URL}/notes/favorites`,
      category: (category: string) => `${API_BASE_URL}/notes/category/${category}`,
      uploadAudio: `${API_BASE_URL}/notes/upload-audio`,
      audio: (filename: string) => `${API_BASE_URL}/notes/audio/${filename}`,
    },
  } as APIEndpoints,
};

export default API_CONFIG;


