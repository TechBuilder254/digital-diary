import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProLoginForm from './ProLoginForm';

jest.mock('../../config/authService', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
  },
}));

const { authService } = jest.requireMock('../../config/authService') as {
  authService: {
    login: jest.Mock;
    register: jest.Mock;
  };
};

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('ProLoginForm', () => {
  beforeEach(() => {
    authService.login.mockReset();
  });

  it('renders login fields', () => {
    renderWithProviders(<ProLoginForm onSuccess={jest.fn()} />);

    expect(screen.getByLabelText(/email or username/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password', { selector: 'input' })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderWithProviders(<ProLoginForm onSuccess={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /enter your space/i }));

    expect(await screen.findAllByRole('alert')).toHaveLength(2);
    expect(screen.getByText(/enter your email or username/i)).toBeInTheDocument();
    expect(screen.getByText(/password must contain at least 8 characters/i)).toBeInTheDocument();
  });

  it('calls onSuccess with payload when login resolves', async () => {
    const onSuccess = jest.fn();
    authService.login.mockResolvedValue({
      success: true,
      token: 'test-token',
      user: {
        id: 'user-1',
        username: 'test-user',
        email: 'test@example.com',
      },
    });

    renderWithProviders(<ProLoginForm onSuccess={onSuccess} />);

    await userEvent.type(screen.getByLabelText(/email or username/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password', { selector: 'input' }), 'supersecure');
    await userEvent.click(screen.getByRole('button', { name: /enter your space/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({
        success: true,
        token: 'test-token',
        user: {
          id: 'user-1',
          username: 'test-user',
          email: 'test@example.com',
        },
        rememberMe: true,
      });
    });
  });

  it('displays error message when login fails', async () => {
    authService.login.mockRejectedValue(new Error('Invalid credentials'));

    renderWithProviders(<ProLoginForm onSuccess={jest.fn()} />);

    await userEvent.type(screen.getByLabelText(/email or username/i), 'admin');
    await userEvent.type(screen.getByLabelText('Password', { selector: 'input' }), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /enter your space/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});

