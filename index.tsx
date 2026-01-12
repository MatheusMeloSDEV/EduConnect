import React from 'react';
import ReactDOM from 'react-dom/client';
// Import App from the new frontend structure
import App from './frontend/src/App';

// Helper to inject styles since we are running from root index.tsx 
// and might miss the frontend/index.html configuration
const injectStyles = () => {
  // 1. Inject Tailwind CSS
  if (!document.querySelector('script[src*="tailwindcss"]')) {
    const script = document.createElement('script');
    script.src = "https://cdn.tailwindcss.com";
    document.head.appendChild(script);
  }

  // 2. Inject Custom Global Styles
  if (!document.getElementById('global-styles')) {
    const style = document.createElement('style');
    style.id = 'global-styles';
    style.innerHTML = `
      /* Hide scrollbar for Chrome, Safari and Opera */
      .no-scrollbar::-webkit-scrollbar {
          display: none;
      }
      /* Hide scrollbar for IE, Edge and Firefox */
      .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
      }
      body {
        background-color: #f3f4f6;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        overscroll-behavior-y: none;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
        -webkit-user-select: none;
        padding-bottom: env(safe-area-inset-bottom);
        -webkit-text-size-adjust: 100%;
      }
      input, textarea, .prose p, .selectable {
        user-select: text;
        -webkit-user-select: text;
      }
      .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
      .pt-safe { padding-top: env(safe-area-inset-top); }
      .smooth-scroll-x {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
      }
    `;
    document.head.appendChild(style);
  }
};

injectStyles();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);