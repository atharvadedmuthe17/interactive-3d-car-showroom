import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // Check if token exists
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    // Decode JWT payload to check role
    const payload = JSON.parse(atob(token.split(".")[1]));

    // Check if user role is admin
    if (payload.role !== "admin") {
      return <Navigate to="/admin/login" replace />;
    }

    // Authorized
    return children;
  } catch (error) {
    // Handle invalid token formatting
    return <Navigate to="/admin/login" replace />;
  }
};

export default AdminRoute;