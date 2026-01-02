// Configuration de l'API Laravel
const API_URL_KEY = "logistiga_api_url";

// Fonction pour récupérer l'URL de l'API (priorité: localStorage > env > fallback)
const getApiBaseUrl = (): string => {
  let url = localStorage.getItem(API_URL_KEY);
  if (!url) {
    url = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  }
  // Remove trailing slash to avoid double slashes
  return url.replace(/\/+$/, '');
};

export const API_CONFIG = {
  // URL de base de l'API Laravel - configuré dynamiquement
  get BASE_URL() {
    return getApiBaseUrl();
  },
  
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
