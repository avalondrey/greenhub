import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Désenregistrer l'ancien Service Worker qui cause des erreurs
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    if (registrations.length > 0) {
      registrations.forEach(registration => {
        registration.unregister();
        console.log('SW désenregistré:', registration.scope);
      });
      // Forcer un reload pour nettoyer complètement
      window.location.reload();
    }
  });
  
  // Supprimer aussi tous les caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
