import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, AuthContext } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import JobSearchPage from './pages/JobSearchPage';
import AlumniResultsPage from './pages/AlumniResultsPage';
import EmailSuggestionsPage from './pages/EmailSuggestionsPage';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import LinkMailboxPage from './pages/LinkMailboxPage';
import GoogleAuthCallback from './pages/GoogleAuthCallback';
import './App.css';

// Get client ID from environment variable
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function AppContent() {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // Determine if the current route is login or register
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  // Only show Navbar if logged in AND not on an auth page
  const showNavbar = user && !isAuthPage;

  return (
    <div className="app">
      {/* Render auth pages directly if on login/register */}
      {isAuthPage ? (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      ) : (
        <>
          {/* Show Navbar for non-auth pages when logged in */}
          {showNavbar && <Navbar />}
          <main className="main-content">
            <Routes>
              {/* Redirect logged-in users trying to access auth pages */}
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="/register" element={<Navigate to="/dashboard" replace />} />

              {/* Private Routes */}
              <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
              <Route path="/search" element={<PrivateRoute><JobSearchPage /></PrivateRoute>} />
              <Route path="/alumni/:jobTitle" element={<PrivateRoute><AlumniResultsPage /></PrivateRoute>} />
              <Route path="/templates" element={<PrivateRoute><EmailSuggestionsPage /></PrivateRoute>} />
              <Route path="/analytics" element={<PrivateRoute><AnalyticsPage /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="/link-mailbox" element={<PrivateRoute><LinkMailboxPage /></PrivateRoute>} />
              <Route path="/auth/google/callback" element={<PrivateRoute><GoogleAuthCallback /></PrivateRoute>} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Fallback or 404 route if needed */}
              {/* <Route path="*" element={<NotFoundPage />} /> */}
            </Routes>
          </main>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
