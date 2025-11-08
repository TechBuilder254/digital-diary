import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProRegisterForm from './ProRegisterForm';

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

describe('ProRegisterForm', () => {
  beforeEach(() => {
    authService.register.mockReset();
  });

  it('renders registration fields', () => {
    renderWithProviders(<ProRegisterForm onSuccess={jest.fn()} onSwitchToLogin={jest.fn()} />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create your account/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderWithProviders(<ProRegisterForm onSuccess={jest.fn()} onSwitchToLogin={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /create your account/i }));

    expect(await screen.findAllByRole('alert')).toHaveLength(5);
  });

  it('calls onSuccess when register resolves', async () => {
    const onSuccess = jest.fn();
    authService.register.mockResolvedValue({ success: true, message: 'Welcome aboard!' });

    renderWithProviders(<ProRegisterForm onSuccess={onSuccess} onSwitchToLogin={jest.fn()} />);

    await userEvent.type(screen.getByLabelText(/username/i), 'nebula');
    await userEvent.type(screen.getByLabelText(/email/i), 'nebula@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'SecurePass1');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'SecurePass1');
    await userEvent.click(screen.getByRole('checkbox', { name: /i agree/i }));
    await userEvent.click(screen.getByRole('button', { name: /create your account/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({
        username: 'nebula',
        email: 'nebula@example.com',
        message: 'Welcome aboard!',
      });
    });
  });

  it('shows error message when register fails', async () => {
    authService.register.mockRejectedValue(new Error('Email already used'));

    renderWithProviders(<ProRegisterForm onSuccess={jest.fn()} onSwitchToLogin={jest.fn()} />);

    await userEvent.type(screen.getByLabelText(/username/i), 'nebula');
    await userEvent.type(screen.getByLabelText(/email/i), 'nebula@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'SecurePass1');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'SecurePass1');
    await userEvent.click(screen.getByRole('checkbox', { name: /i agree/i }));
    await userEvent.click(screen.getByRole('button', { name: /create your account/i }));

    expect(await screen.findByText(/email already used/i)).toBeInTheDocument();
  });
});


