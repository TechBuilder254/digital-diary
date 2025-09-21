import { useEffect } from 'react';

// Utility function to scroll to top of page
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
};

// Hook to scroll to top when component mounts
export const useScrollToTop = () => {
  useEffect(() => {
    scrollToTop();
  }, []);
};
