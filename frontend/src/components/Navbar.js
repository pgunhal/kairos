// client/src/components/Navbar.js
import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  if (!user) {
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            AlumniConnect
          </Link>
          <div className="navbar-links">
            <Link to="/login" className={`nav-link ${isActive('/login')}`}>Login</Link>
            <Link to="/register" className={`nav-link ${isActive('/register')}`}>Register</Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          AlumniConnect
        </Link>
        <div className="navbar-links">
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>Dashboard</Link>
          <Link to="/search" className={`nav-link ${isActive('/search')}`}>Search</Link>
          <Link to="/templates" className={`nav-link ${isActive('/templates')}`}>Templates</Link>
          <Link to="/analytics" className={`nav-link ${isActive('/analytics')}`}>Analytics</Link>
          <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>Profile</Link>
          {/* <Link to="/link-mailbox" className={`nav-link ${isActive('/link-mailbox')}`}>Link Mailbox</Link> */}
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;