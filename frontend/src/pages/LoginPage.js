import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/kairos_logo_transparent.png';
import background from '../assets/sky-bg.jpg'; // Import your background

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div style={{ ...styles.container, backgroundImage: `url(${background})` }}>
      <div style={styles.overlay}>
        <div style={styles.leftSide}>
          <img src={logo} alt="Kairos Logo" style={styles.logo} />
        </div>

        <div style={styles.rightSide}>
          <div style={styles.card}>
            <h2 style={styles.heading}>Welcome back</h2>
            <p style={styles.subheading}>Please sign in to your account</p>

            {error && <p style={styles.errorMessage}>{error}</p>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={styles.input}
                  required
                />
              </div>
              <button type="submit" style={styles.submitButton}>Login</button>
            </form>

            <p style={styles.bottomText}>
              Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // light overlay to make content readable
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '40px',
  },
  leftSide: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightSide: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '200px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // slight translucent card
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    textAlign: 'center',
    backdropFilter: 'blur(10px)', // nice blur effect
  },
  heading: {
    fontSize: '28px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#333',
  },
  subheading: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '24px',
  },
  errorMessage: {
    color: 'red',
    marginBottom: '10px',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  inputGroup: {
    marginBottom: '16px',
  },
  label: {
    fontSize: '14px',
    marginBottom: '6px',
    color: '#555',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border 0.2s',
  },
  submitButton: {
    backgroundColor: '#0066FF',
    width: '100%',
    color: 'white',
    padding: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'background-color 0.3s',
  },
  bottomText: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#555',
  },
  link: {
    color: '#0066FF',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

export default LoginPage;
