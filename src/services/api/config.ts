// Configuration de l'API Laravel
export const API_CONFIG = {
  // URL de base de l'API Laravel (ngrok)
  BASE_URL: import.meta.env.VITE_API_URL || "https://unextradited-monocotyledonous-sena.ngrok-free.app/api",
  
  // Timeout des requêtes en millisecondes
  TIMEOUT: 30000,
  
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
