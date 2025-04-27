import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';
import logo from '../assets/kairos-logo.png'; // (place your logo here)

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="sidebar">
      <div className="logo-container">
        <img src={logo} alt="Kairos Logo" className="logo" />
        <h1 className="brand-name">Kairos</h1>
      </div>
      <div className="nav-links">
          <>
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>Dashboard</Link>
            <Link to="/templates" className={`nav-link ${isActive('/templates')}`}>Templates</Link>
            <Link to="/search" className={`nav-link ${isActive('/search')}`}>Search</Link>
            <Link to="/analytics" className={`nav-link ${isActive('/analytics')}`}>Analytics</Link>
            <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>Profile</Link>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </>
      </div>
    </nav>
  );
}

export default Navbar;