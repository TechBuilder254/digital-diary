import type { Meta, StoryObj, StoryFn } from '@storybook/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProLoginPage from './ProLoginPage';
import { ThemeProvider } from '../../theme/ThemeProvider';

const meta: Meta<typeof ProLoginPage> = {
  title: 'Auth/ProfessionalLogin',
  component: ProLoginPage,
  decorators: [
    (Story: StoryFn) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      return (
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <div className="min-h-screen bg-surface text-foreground">
              <Story />
            </div>
          </ThemeProvider>
        </QueryClientProvider>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { hideNoControlsWarning: true },
  },
};

export default meta;

type Story = StoryObj<typeof ProLoginPage>;

export const Default: Story = {
  name: 'Login Experience',
};


