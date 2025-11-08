export const colorTokens = {
  accent: {
    primary: '#6366f1',
    secondary: '#818cf8',
    ring: '#a5b4fc',
  },
  feedback: {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#facc15',
  },
  neutrals: {
    900: '#0f172a',
    800: '#1e293b',
    700: '#334155',
    100: '#f1f5f9',
    50: '#f8fafc',
  },
};

export const typography = {
  fontFamilies: {
    base: '"Inter", system-ui, sans-serif',
    heading: '"Space Grotesk", "Inter", system-ui, sans-serif',
  },
  sizes: {
    body: '16px',
    heading: 'clamp(2rem, 1.7rem + 1.2vw, 2.75rem)',
  },
};

export const radii = {
  lg: '24px',
  xl: '32px',
  pill: '999px',
};

export const shadows = {
  elevated: '0 32px 80px -24px rgba(15, 23, 42, 0.32)',
  card: '0 20px 60px -25px rgba(30, 64, 175, 0.35)',
};

export const transitions = {
  snap: 'cubic-bezier(0.6, 0.2, 0.1, 1)',
  duration: {
    quick: 0.18,
    medium: 0.35,
  },
};

export const motion = {
  variants: {
    fadeInUp: {
      hidden: { opacity: 0, y: 24 },
      visible: { opacity: 1, y: 0 },
    },
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
  },
};

export type ThemeTokens = {
  colors: typeof colorTokens;
  typography: typeof typography;
  radii: typeof radii;
  shadows: typeof shadows;
  transitions: typeof transitions;
  motion: typeof motion;
};

export const tokens: ThemeTokens = {
  colors: colorTokens,
  typography,
  radii,
  shadows,
  transitions,
  motion,
};

export default tokens;



