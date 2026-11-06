import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// Purge any stale client-side caches so updates appear instantly without refresh delay
if (typeof window !== 'undefined' && 'caches' in window) {
  caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key !== 'alghafari-soft-pro-v4-offline-ready') {
        caches.delete(key);
      }
    });
  });
}

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).then((reg) => {
      reg.update();
    }).catch((err) => {
      console.warn('SW registration info:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);

