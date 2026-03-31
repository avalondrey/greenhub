// Script pour désenregistrer l'ancien service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    registrations.forEach(function(registration) {
      registration.unregister();
      console.log('Service Worker désenregistré:', registration.scope);
    });
  });
  
  // Effacer tous les caches aussi
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      cacheNames.forEach(function(cacheName) {
        caches.delete(cacheName);
        console.log('Cache supprimé:', cacheName);
      });
    });
  }
}
