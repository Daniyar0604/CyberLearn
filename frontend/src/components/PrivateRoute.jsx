import React from 'react';
import { Navigate } from 'react-router-dom';

export function isAuthenticated() {
  // Проверка токена в localStorage (или другой логики)
  return Boolean(localStorage.getItem('token'));
}

export default function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}
