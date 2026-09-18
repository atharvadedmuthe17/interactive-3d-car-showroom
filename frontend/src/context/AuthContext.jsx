import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        setUser(null);
        return;
      }
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          const userData = res.data.user;
          const freshPic = userData.profile_pic ? `${userData.profile_pic.split('?')[0]}?t=${Date.now()}` : null;
          setUser({ ...userData, profile_pic: freshPic, token });
        }
      } catch (err) {
        handleLogoutLogic();
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleLogoutLogic = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
  };

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", userData.role || 'user');
    
    const freshUser = {
      ...userData,
      profile_pic: userData.profile_pic ? `${userData.profile_pic.split('?')[0]}?t=${Date.now()}` : null
    };
    setUser({ ...freshUser, token });
  };

  // 🔥 FIXED: Page reload removed to stay on the same section
  const logout = () => {
    handleLogoutLogic();
    // window.location.href = "/"; // <-- Removed this line to prevent jumping to storyline
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);