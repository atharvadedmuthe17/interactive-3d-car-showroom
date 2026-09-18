import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef } from "react";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const alertShown = useRef(false); // 🔥 Ek baar alert dikhane ke liye tracker

  useEffect(() => {
    if (!loading && !user && !alertShown.current) {
      alert("Please Login First to access ADYX Luxury Services.");
      alertShown.current = true; // Mark kar diya ki alert dikh gaya
      navigate("/login", { state: { from: location }, replace: true });
    }
  }, [user, loading, navigate, location]);

  if (loading) return null;

  // Agar user nahi hai toh kuch render mat karo, useEffect handle kar lega redirect
  if (!user) return null;

  return children;
};

export default ProtectedRoute;