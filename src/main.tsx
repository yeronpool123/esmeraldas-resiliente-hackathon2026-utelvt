import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

if ('serviceWorker' in navigator && (window.isSecureContext || location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/service-worker.js').catch(error => {
      console.error('No se pudo registrar el modo offline de la aplicación.', error);
    });
  });
}
