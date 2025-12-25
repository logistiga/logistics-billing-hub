// Configuration de l'API Laravel
export const API_CONFIG = {
  // URL de base de l'API Laravel - configuré via .env (VITE_API_URL)
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  
  // Timeout des requêtes en millisecondes (60s pour tenir compte des tunnels)
  TIMEOUT: 60000,
  
  // Headers par défaut
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
};

// Clés de stockage local
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  USER: "user",
  REFRESH_TOKEN: "refresh_token",
};
