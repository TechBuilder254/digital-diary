import React from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../../theme/ThemeProvider';
import cn from '../../utils/cn';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative flex h-11 w-11 items-center justify-center rounded-full border border-accent/20 bg-surface/80 text-accent transition-all duration-300 hover:border-accent/40 hover:text-accent focus-outline',
        'shadow-card backdrop-blur-md',
        className,
      )}
      aria-label={`Activate ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <VisuallyHidden>{`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}</VisuallyHidden>
      <FiSun
        className={cn(
          'absolute h-5 w-5 transition-all duration-500',
          theme === 'dark' ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100',
        )}
        aria-hidden
      />
      <FiMoon
        className={cn(
          'absolute h-5 w-5 transition-all duration-500',
          theme === 'dark' ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0',
        )}
        aria-hidden
      />
    </button>
  );
};

export default ThemeToggle;



