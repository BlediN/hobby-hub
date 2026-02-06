import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  setCurrentUser, 
  getCurrentUser
} from '../utils/userSession';

export default function Login() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if already logged in
  if (getCurrentUser()) {
    navigate('/');
    return null;
  }

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }

    if (username.trim().length > 50) {
      setError('Username must be less than 50 characters');
      return;
    }

    // Only allow alphanumeric and underscore
    if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) {
      setError('Username can only contain letters, numbers, underscore, and dash');
      return;
    }

    // Block admin and teacher - these are reserved roles for Firebase login only
    const normalized = username.trim().toLowerCase();
    if (normalized === 'admin') {
      setError(`"${normalized}" is a reserved role. Use Firebase login for admin access.`);
      return;
    }

    if (setCurrentUser(username)) {
      navigate('/');
    } else {
      setError('Failed to set username. Please try again.');
    }
  };



  return (
    <div className="container" style={{ maxWidth: '640px', marginTop: '5rem' }}>
      <h1>HobbyHub</h1>
      <h2>👋 Welcome</h2>
      <p>Enter a username or sign in with Firebase</p>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            maxLength={50}
          />
          <small style={{ color: '#888', marginTop: '0.5rem' }}>
            Admin and Teacher roles available via Firebase login
          </small>
        </div>

        <button type="submit" style={{ marginTop: '1rem', width: '100%' }}>
          🚀 Enter HobbyHub
        </button>
      </form>

      <Link to="/login-portal" style={{ textDecoration: 'none' }}>
        <button style={{
          marginTop: '1.5rem',
          width: '100%',
          backgroundColor: '#10b981',
          padding: '0.75rem',
          fontSize: '1rem'
        }}>
          🔐 Login to Portal
        </button>
      </Link>

      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderRadius: '8px',
          borderLeft: '3px solid #6366f1'
        }}
      >
        <h3>💡 Demo Usernames</h3>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
          <li><strong>admin</strong> - Admin access via Firebase login (reserved)</li>
          <li><strong>teacher</strong> - Use to test Admin read-only portal</li>
          <li><strong>Any username</strong> - Create your own</li>
        </ul>
      </div>
    </div>
  );
}
