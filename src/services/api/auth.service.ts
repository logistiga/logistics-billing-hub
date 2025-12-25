import { apiClient } from "./client";
import { STORAGE_KEYS } from "./config";
import type {
  ApiResponse,
  AuthResponse,
  AuthUser,
  LoginCredentials,
  RegisterData,
} from "./types";

class AuthService {
  /**
   * Connexion utilisateur (Laravel Sanctum)
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      credentials
    );

    if (response.data.token) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
    }

    return response.data;
  }

  /**
   * Inscription utilisateur
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      data
    );

    if (response.data.token) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
    }

    return response.data;
  }

  /**
   * Déconnexion utilisateur
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }

  /**
   * Récupérer l'utilisateur courant
   */
  async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get<ApiResponse<AuthUser>>("/auth/user");
    return response.data;
  }

  /**
   * Récupérer l'utilisateur depuis le localStorage
   */
  getStoredUser(): AuthUser | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Demander la réinitialisation du mot de passe
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      "/auth/forgot-password",
      { email }
    );
    return response.data;
  }

  /**
   * Réinitialiser le mot de passe
   */
  async resetPassword(data: {
    email: string;
    password: string;
    password_confirmation: string;
    token: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      "/auth/reset-password",
      data
    );
    return response.data;
  }

  /**
   * Changer le mot de passe (utilisateur connecté)
   */
  async changePassword(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      "/auth/change-password",
      data
    );
    return response.data;
  }

  /**
   * Mettre à jour le profil
   */
  async updateProfile(data: Partial<AuthUser>): Promise<AuthUser> {
    const response = await apiClient.put<ApiResponse<AuthUser>>(
      "/auth/profile",
      data
    );
    
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
    return response.data;
  }
}

export const authService = new AuthService();
