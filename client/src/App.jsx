import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Topics from './pages/Topics';
import Problems from './pages/Problems';
import Contests from './pages/Contests';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-[#21262d] border-t-cyan-400 animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/topics" element={<PrivateRoute><Topics /></PrivateRoute>} />
      <Route path="/problems" element={<PrivateRoute><Problems /></PrivateRoute>} />
      <Route path="/contests" element={<PrivateRoute><Contests /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
