import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  setCurrentUser, 
  getCurrentUser, 
  ensureAdminPassword, 
  verifyAdminPassword
} from '../utils/userSession';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [initialAdminPassword, setInitialAdminPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if already logged in
  if (getCurrentUser()) {
    navigate('/');
    return null;
  }

  useEffect(() => {
    const normalized = username.trim().toLowerCase();
    if (normalized === 'admin') {
      const result = ensureAdminPassword();
      if (result.created) {
        setInitialAdminPassword(result.password);
      }
    } else {
      setInitialAdminPassword('');
      setPassword('');
    }
  }, [username]);

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

    const normalized = username.trim().toLowerCase();

    if (normalized === 'admin') {
      if (!password.trim()) {
        setError('Admin password is required');
        return;
      }

      if (!verifyAdminPassword(password.trim())) {
        setError('Invalid admin password');
        return;
      }
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
      <p>Enter a username to get started</p>

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
            Admin requires a password. Teacher is read-only.
          </small>
        </div>

        {username.trim().toLowerCase() === 'admin' && (
          <div style={{ marginTop: '1rem' }}>
            <label htmlFor="password">Admin Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter admin password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {initialAdminPassword && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#fbbf24' }}>
                Initial admin password: <strong>{initialAdminPassword}</strong>
              </div>
            )}
          </div>
        )}

        <button type="submit" style={{ marginTop: '1rem', width: '100%' }}>
          🚀 Enter HobbyHub
        </button>
      </form>

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
          <li><strong>admin</strong> - Full control (password required)</li>
          <li><strong>teacher</strong> - Admin read-only</li>
          <li><strong>Any username</strong> - Create your own</li>
        </ul>
      </div>
    </div>
  );
}
