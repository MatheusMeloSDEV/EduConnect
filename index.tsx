
import React from 'react';
import ReactDOM from 'react-dom/client';
// Importa o App da nova estrutura frontend
import App from './frontend/src/App';

// Auxiliar para injetar estilos, já que estamos rodando do index.tsx raiz
// e podemos perder a configuração do frontend/index.html
const injectStyles = () => {
  // 1. Injetar Tailwind CSS
  if (!document.querySelector('script[src*="tailwindcss"]')) {
    const script = document.createElement('script');
    script.src = "https://cdn.tailwindcss.com";
    document.head.appendChild(script);
  }

  // 2. Injetar Estilos Globais Personalizados
  if (!document.getElementById('global-styles')) {
    const style = document.createElement('style');
    style.id = 'global-styles';
    style.innerHTML = `
      /* Esconder barra de rolagem para Chrome, Safari e Opera */
      .no-scrollbar::-webkit-scrollbar {
          display: none;
      }
      /* Esconder barra de rolagem para IE, Edge e Firefox */
      .no-scrollbar {
          -ms-overflow-style: none;  /* IE e Edge */
          scrollbar-width: none;  /* Firefox */
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        overscroll-behavior-y: none;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
        -webkit-user-select: none;
        padding-bottom: env(safe-area-inset-bottom);
        -webkit-text-size-adjust: 100%;
      }
      /* Estilos base do Modo Escuro tratados no index.html ou Tailwind */
      
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
  throw new Error("Não foi possível encontrar o elemento raiz para montar");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
