import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MessageSquare, FileText, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';
import Documents from './pages/Documents';
import './index.css';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
}

function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="logo">◈ DocMind RAG</div>
      {user && (
        <div className="flex gap-2" style={{ alignItems: 'center' }}>
          <span style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>
            {user.username}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      )}
    </header>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <MessageSquare size={18} /> Chat
        </NavLink>
        <NavLink to="/documents" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileText size={18} /> Documents
        </NavLink>
      </nav>
    </aside>
  );
}

function AppLayout({ children }) {
  return (
    <div className="layout">
      <Topbar />
      <Sidebar />
      <main style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/" element={
        <PrivateRoute>
          <AppLayout><Chat /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/documents" element={
        <PrivateRoute>
          <AppLayout><Documents /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg2)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              fontFamily: 'var(--font-body)',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
