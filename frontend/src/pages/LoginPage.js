import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

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
    <div style={styles.container}>
      <div style={styles.leftSide}>
        <div style={styles.branding}>
          <img src="/kairos-logo.png" alt="Kairos Logo" style={styles.logo} />
          <h1 style={styles.brandName}>Kairos</h1>
          <p style={styles.brandTagline}>Connect with opportunity.</p>
        </div>
      </div>

      <div style={styles.rightSide}>
        <div style={styles.formContainer}>
          <h2 style={styles.heading}>Login</h2>
          {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
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
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    margin: 0,
    padding: 0,
    overflow: 'hidden',
  },
  leftSide: {
    flex: 1,
    background: 'linear-gradient(135deg, #2D9CDB, #27AE60)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    color: '#fff',
  },
  branding: {
    textAlign: 'center',
  },
  logo: {
    width: '80px',
    marginBottom: '20px',
  },
  brandName: {
    fontSize: '36px',
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  brandTagline: {
    fontSize: '18px',
  },
  rightSide: {
    flex: 1,
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: '400px',
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: '#fff',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '20px',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: '15px',
  },
  label: {
    marginBottom: '5px',
    fontWeight: 'bold',
    fontFamily: 'Arial, sans-serif',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    outline: 'none',
  },
  submitButton: {
    backgroundColor: '#27AE60',
    width: '105.5%',
    color: 'white',
    padding: '12px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'background-color 0.3s',
  },
  bottomText: {
    textAlign: 'center',
    marginTop: '15px',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    color: '#555',
  },
};

export default LoginPage;