// src/components/PublicRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user?.role) {
    // Redirect logged-in user to their dashboard
    const role = user.role.toLowerCase();
    if (role.includes("buyer")) return <Navigate to="/buyer-dashboard" replace />;
    if (role.includes("owner") || role.includes("land owner")) return <Navigate to="/owner-dashboard" replace />;
    if (role.includes("verifier")) return <Navigate to="/ldr-dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;