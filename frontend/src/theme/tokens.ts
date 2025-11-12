export const colorTokens = {
  accent: {
    primary: '#5b5bff',
    secondary: '#7b7cff',
    tertiary: '#58f2ff',
    ring: '#c3c9ff',
    contrast: '#040612',
  },
  feedback: {
    success: '#22c55e',
    error: '#ff4d6d',
    warning: '#facc15',
  },
  neutrals: {
    950: '#02030a',
    900: '#040612',
    800: '#10142a',
    700: '#1b2140',
    600: '#27325c',
    400: '#8a93b2',
    200: '#d7dcf2',
    100: '#eef0fb',
    50: '#f7f8ff',
  },
  accents: {
    blossom: '#ff7aa8',
    aurora: '#4de1ff',
    dusk: '#9a7bff',
    sunrise: '#ffd166',
  },
};

export const typography = {
  fontFamilies: {
    base: '"Inter", system-ui, sans-serif',
    heading: '"Space Grotesk", "Inter", system-ui, sans-serif',
  },
  sizes: {
    body: '16px',
    heading: 'clamp(2.6rem, 2.1rem + 1.5vw, 4rem)',
    subheading: 'clamp(1.25rem, 1.1rem + 0.6vw, 1.75rem)',
  },
};

export const radii = {
  md: '18px',
  lg: '24px',
  xl: '36px',
  pill: '999px',
};

export const shadows = {
  elevated: '0 42px 90px -30px rgba(4, 6, 18, 0.55)',
  card: '0 26px 70px -35px rgba(91, 91, 255, 0.45)',
  soft: '0 18px 45px -25px rgba(9, 12, 32, 0.4)',
};

export const transitions = {
  snap: 'cubic-bezier(0.6, 0.2, 0.1, 1)',
  duration: {
    quick: 0.18,
    medium: 0.32,
    slow: 0.55,
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
    fadeInScale: {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1 },
    },
    fadeInStagger: {
      hidden: { opacity: 0, y: 24 },
      visible: { opacity: 1, y: 0 },
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



