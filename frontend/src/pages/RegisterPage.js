import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const { firstName, lastName, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const userData = { firstName, lastName, email, password };
    const success = await register(userData);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Registration failed. Please try again.');
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
          <h2 style={styles.heading}>Register</h2>
          {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
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
                onChange={handleChange}
                placeholder="Enter your password"
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                style={styles.input}
                required
              />
            </div>
            <button type="submit" style={styles.submitButton}>Register</button>
          </form>
          <p style={styles.bottomText}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

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
    background: 'linear-gradient(135deg, #2D9CDB, #27AE60)', // Blue-to-green gradient (like Kairos)
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

export default RegisterPage;