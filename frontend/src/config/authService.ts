import axios from 'axios';
import axiosInstance from './axios';
import API_CONFIG from './api';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  avatar_url?: string | null;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token: string;
  user: AuthUser;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

const transformIdentifier = (identifier: string) => identifier.trim();

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const payload = {
      username: transformIdentifier(credentials.identifier),
      password: credentials.password,
    };

    try {
      const response = await axiosInstance.post<LoginResponse>(API_CONFIG.endpoints.auth.login, payload);
      const data = response.data;

      if (!data.success || !data.token || !data.user) {
        throw new Error(data.message ?? 'Invalid credentials. Please try again.');
      }

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message ?? 'Unable to sign in. Please check your credentials.';
        throw new Error(message);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unexpected authentication error.');
    }
  },
  register: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    try {
      const response = await axiosInstance.post<RegisterResponse>(API_CONFIG.endpoints.auth.register, credentials);
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message ?? 'Registration failed. Please try again.');
      }

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message ?? 'Unable to create account. Please try again.';
        throw new Error(message);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unexpected registration error.');
    }
  },
};

export default authService;

