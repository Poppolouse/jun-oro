import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { API_BASE_URL } from "@/utils/apiBaseUrl";
import { userService } from "../data/users";

/**
 * @typedef {object} User
 * @property {string} id - The user's ID.
 * @property {string} username - The user's username.
 * @property {string} email - The user's email.
 * @property {string} role - The user's role (e.g., 'admin', 'user').
 * @property {string} [profilePicture] - URL for the user's profile picture.
 */

/**
 * @typedef {object} AuthContextType
 * @property {User|null} user - The currently authenticated user object, or null if not logged in.
 * @property {boolean} isLoading - True while the initial user authentication check is in progress.
 * @property {boolean} isAuthenticated - True if a user is authenticated.
 * @property {boolean} isAdmin - True if the authenticated user has the 'admin' role.
 * @property {(username, password) => Promise<{success: boolean, message?: string}>} login - Function to log in a user.
 * @property {(userData) => Promise<{success: boolean, message?: string}>} register - Function to register a new user.
 * @property {() => void} logout - Function to log out the current user.
 * @property {(userData: Partial<User>) => void} updateUser - Function to update the current user's data in the context.
 * @property {() => Promise<{success: boolean, user?: User}>} refreshUser - Function to refresh user data from the backend.
 */

/**
 * Authentication context for managing user session and data.
 * @type {import("react").Context<AuthContextType|undefined>}
 */
const AuthContext = createContext(undefined);

/**
 * Custom hook to access the authentication context.
 *
 * Throws an error if used outside of an AuthProvider.
 * @returns {AuthContextType} The authentication context value.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Provides authentication state and actions to its children.
 *
 * Manages user authentication, session persistence in localStorage,
 * and provides functions for login, logout, and registration.
 * @param {object} props - The component props.
 * @param {import("react").ReactNode} props.children - The child components to be wrapped by the provider.
 * @returns {JSX.Element} The AuthProvider component.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    /**
     * Initializes the user session from localStorage on component mount.
     */
    const initializeAuth = async () => {
      let savedUser = null;
      try {
        const userJson = localStorage.getItem("arkade_user");
        if (userJson) {
          savedUser = JSON.parse(userJson);
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        localStorage.removeItem("arkade_user");
      }

      if (savedUser?.id) {
        setUser(savedUser);
        // Immediately try to refresh user data from the backend for consistency.
        try {
          const response = await fetch(`${API_BASE_URL}/users/${savedUser.id}`, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("arkade_token")}`,
            },
          });
          
          // Handle CORS errors gracefully
          if (!response || response.type === 'opaque') {
            console.warn('⚠️ Backend erişilebilir değil, offline modda devam ediliyor');
            setIsLoading(false);
            return;
          }
          
          const data = await response.json();
          if (response.ok && data.success) {
            const updatedUser = data.data;
            setUser(updatedUser);
            localStorage.setItem("arkade_user", JSON.stringify(updatedUser));
          } else if (response.status === 401) {
            // If the user is no longer valid on the backend, log them out.
            logout();
          }
        } catch (error) {
          console.warn("⚠️ Backend bağlantı hatası - offline modda devam:", error.message);
          // Potentially offline, proceed with stale data.
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
    
    // Cleanup to prevent double calls in StrictMode
    return () => {
      // No cleanup needed for this effect
    };
  }, []); // Empty dependency array ensures this runs only once

  /**
   * Logs in a user with the given credentials.
   * @param {string} username - The user's username.
   * @param {string} password - The user's password.
   * @returns {Promise<{success: boolean, message?: string}>} An object indicating success or failure.
   */
  const login = async (username, password) => {
    try {
      const result = await userService.login(username, password);
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem("arkade_user", JSON.stringify(result.user));
        
        // Save JWT token if provided
        if (result.token) {
          localStorage.setItem("arkade_token", result.token);
        }
        
        await refreshUser(); // Refresh to get latest data post-login.
        return { success: true };
      }
      return { success: false, message: result.message || "Invalid credentials." };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.message || "An unexpected error occurred during login.",
      };
    }
  };

  /**
   * Registers a new user.
   * Note: Does not automatically log the user in, as admin approval might be required.
   * @param {object} userData - The new user's data.
   * @returns {Promise<{success: boolean, message?: string}>} An object indicating success or failure.
   */
  const register = async (userData) => {
    try {
      const result = await userService.register(userData);
      return {
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: error.message || "An unexpected error occurred during registration.",
      };
    }
  };

  /**
   * Logs out the current user and clears their session data.
   */
  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("arkade_user");
      localStorage.removeItem("arkade_token");
      localStorage.removeItem("sessionId"); // Session ID'yi de temizle
    } catch (error) {
      console.error("Failed to remove user from localStorage:", error);
    }
  };

  /**
   * Updates the authenticated user's data in the context and localStorage.
   * @param {Partial<User>} newUserData - An object with the user properties to update.
   */
  const updateUser = (newUserData) => {
    if (!user) return;
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    try {
      localStorage.setItem("arkade_user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Failed to save updated user to localStorage:", error);
    }
  };

  /**
   * Fetches the latest user data from the backend and updates the context.
   * @returns {Promise<{success: boolean, user?: User}>} An object indicating success and containing the updated user.
   */
  const refreshUser = async () => {
    if (!user?.id) {
      return { success: false };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("arkade_token")}`,
        },
      });
      const data = await response.json();

      if (response.ok && data.success) {
        updateUser(data.data);
        return { success: true, user: data.data };
      }
      return { success: false };
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return { success: false };
    }
  };

  // Memoize the context value to prevent unnecessary re-renders of consumers.
  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
      updateUser,
      refreshUser,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
