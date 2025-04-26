// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import JobSearchPage from './pages/JobSearchPage';
import AlumniResultsPage from './pages/AlumniResultsPage';
import EmailSuggestionsPage from './pages/EmailSuggestionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LinkMailboxPage from './pages/LinkMailboxPage';
import GoogleAuthCallback from './pages/GoogleAuthCallback';
import './App.css';

// Get client ID from environment variable
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                } />
                <Route path="/search" element={
                  <PrivateRoute>
                    <JobSearchPage />
                  </PrivateRoute>
                } />
                <Route path="/alumni/:jobTitle" element={
                  <PrivateRoute>
                    <AlumniResultsPage />
                  </PrivateRoute>
                } />
                <Route path="/templates" element={
                  <PrivateRoute>
                    <EmailSuggestionsPage />
                  </PrivateRoute>
                } />
                <Route path="/analytics" element={
                  <PrivateRoute>
                    <AnalyticsPage />
                  </PrivateRoute>
                } />
                <Route path="/link-mailbox" element={
                  <PrivateRoute>
                    <LinkMailboxPage />
                  </PrivateRoute>
                } />
                <Route path="/auth/google/callback" element={
                  <PrivateRoute>
                    <GoogleAuthCallback />
                  </PrivateRoute>
                } />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
