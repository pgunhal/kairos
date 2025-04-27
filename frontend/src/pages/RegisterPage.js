import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/kairos_logo_transparent.png';
import background from '../assets/sky-bg.jpg';

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
    <div style={{ ...styles.container, backgroundImage: `url(${background})` }}>
      <div style={styles.overlay}>
        <div style={styles.leftSide}>
          <img src={logo} alt="Kairos Logo" style={styles.logo} />
        </div>

        <div style={styles.rightSide}>
          <div style={styles.card}>
            <h2 style={styles.heading}>Create your account</h2>
            <p style={styles.subheading}>Let's get you started</p>

            {error && <p style={styles.errorMessage}>{error}</p>}

            <form onSubmit={handleSubmit} style={styles.form}>
              {[
                { label: "First Name", name: "firstName", placeholder: "First name", type: "text" },
                { label: "Last Name", name: "lastName", placeholder: "Last name", type: "text" },
                { label: "Email", name: "email", placeholder: "you@example.com", type: "email" },
                { label: "Password", name: "password", placeholder: "Enter your password", type: "password" },
                { label: "Confirm Password", name: "confirmPassword", placeholder: "Confirm your password", type: "password" }
              ].map(({ label, name, placeholder, type }) => (
                <div style={styles.inputGroup} key={name}>
                  <label style={styles.label}>{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    style={styles.input}
                    required
                  />
                </div>
              ))}

              <button type="submit" style={styles.submitButton}>Register</button>
            </form>

            <p style={styles.bottomText}>
              Already have an account? <Link to="/login" style={styles.link}>Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
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
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      padding: '0 60px',
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
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '24px', // tighter padding
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
      textAlign: 'left',
    },
    heading: {
      fontSize: '26px',
      fontWeight: '700',
      marginBottom: '4px', // tighter
      color: '#2c3e50',
      textAlign: 'center',
    },
    subheading: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '16px', // tighter
      textAlign: 'center',
    },
    errorMessage: {
      color: 'red',
      fontSize: '14px',
      marginBottom: '10px',
      textAlign: 'center',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '10px', // slightly smaller space between inputs
    },
    label: {
      fontSize: '13px',
      marginBottom: '4px',
      color: '#555555',
      fontWeight: '500',
    },
    input: {
      width: '100%',
      padding: '10px',
      fontSize: '14px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      outline: 'none',
    },
    submitButton: {
      backgroundColor: '#0066FF',
      width: '200px',
      margin: '16px auto 0 auto', // slightly less top margin
      color: 'white',
      padding: '12px',
      fontSize: '15px',
      fontWeight: 'bold',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      display: 'block',
    },
    bottomText: {
      textAlign: 'center',
      marginTop: '16px',
      fontSize: '14px',
      color: '#555',
    },
    link: {
      color: '#0066FF',
      textDecoration: 'none',
      fontWeight: '600',
    },
  };
  

export default RegisterPage;
