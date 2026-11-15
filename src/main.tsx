import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// Purge any stale client-side caches so updates appear instantly without refresh delay
if (typeof window !== 'undefined' && 'caches' in window) {
  caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key !== 'alghafari-soft-pro-v5-3d-logo') {
        caches.delete(key);
      }
    });
  });
}

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).then((reg) => {
        reg.update();
      }).catch((err) => {
        console.warn('SW registration info:', err);
      });
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister());
    }).catch(() => {});
  }
}

createRoot(document.getElementById('root')!).render(<App />);

