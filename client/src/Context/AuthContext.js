// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

import { toast } from "react-toastify";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Check /auth/me on mount
  const fetchMe = useCallback(async () => {
    try {
      setLoadingMe(true);
      const res = await axios.get("/auth/me", { withCredentials: true });
      if (res.data && res.data.ok && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoadingMe(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // open login modal
  const openAuthModal = () => setModalOpen(true);
  const closeAuthModal = () => setModalOpen(false);

  // logout
  const logout = async () => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.warn("logout error", err && err.message);
    } finally {
      setUser(null);
      toast.success("Logged out");
    }
  };

  // Called after verify success from modal
  const handleVerified = (newUser) => {
    setUser(newUser || null);
    closeAuthModal();
    toast.success("Logged in");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loadingMe,
        openAuthModal,
        closeAuthModal,
        modalOpen,
        setUser,
        logout,
        handleVerified,
        fetchMe,
      }}
    >
      {children}
     
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
