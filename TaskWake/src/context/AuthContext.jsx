import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("taskwave-token");
    if (token) {
      api.setToken(token);
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await api.getProfile();
      if (response.success) {
        setUser(response.user);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      const response = await api.register(userData);
      
      if (response.success) {
        api.setToken(response.token);
        setUser(response.user);
        
        console.log("User signed up successfully:", response.user.email);
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: error.message || "Registration failed" };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.login(credentials);
      
      if (response.success) {
        api.setToken(response.token);
        setUser(response.user);
        
        console.log("User logged in successfully:", response.user.email);
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message || "Login failed" };
    }
  };

  const googleSignIn = async () => {
    try {
      const mockGoogleUser = {
        name: "Google User",
        email: "user@gmail.com",
        avatar: "https://ui-avatars.com/api/?name=Google+User&background=4285f4&color=fff",
      };

      const response = await api.register({
        name: mockGoogleUser.name,
        email: mockGoogleUser.email,
        password: "google_oauth_password",
      });

      if (response.success) {
        api.setToken(response.token);
        setUser(response.user);
        return { success: true, user: response.user };
      } else {
        const loginResponse = await api.login({
          email: mockGoogleUser.email,
          password: "google_oauth_password",
        });

        if (loginResponse.success) {
          api.setToken(loginResponse.token);
          setUser(loginResponse.user);
          return { success: true, user: loginResponse.user };
        } else {
          return { success: false, error: loginResponse.message };
        }
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      return { success: false, error: error.message || "Google sign-in failed" };
    }
  };

  const logout = () => {
    handleLogout();
    console.log("User logged out");
  };

  const handleLogout = () => {
    setUser(null);
    api.setToken(null);
  };

  const updateProfile = async (updates) => {
    try {
      const response = await api.updateProfile(updates);
      if (response.success) {
        setUser(response.user);
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("Update profile error:", error);
      return { success: false, error: error.message || "Failed to update profile" };
    }
  };

  const getAllUsers = () => {
    return [];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        googleSignIn,
        logout,
        updateProfile,
        getAllUsers,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};