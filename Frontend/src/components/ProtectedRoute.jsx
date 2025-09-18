// src/components/ProtectedRoute.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  const loggedIn = isAuthenticated || localStorage.getItem("user");

  return loggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
