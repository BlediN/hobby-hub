import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { setCurrentUser } from '../utils/userSession';

export default function LoginPortal() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);

    try {
      // Convert username to Firebase email format
      const firebaseEmail = `${username.trim()}@hobbyhub.local`;
      
      await signInWithEmailAndPassword(auth, firebaseEmail, password);
      
      if (setCurrentUser(username.trim())) {
        navigate('/');
      } else {
        setError('Failed to set username. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Check your username and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '5rem' }}>
      <Link to="/login" style={{ textDecoration: 'none' }}>
        <button style={{ marginBottom: '1.5rem' }}>← Back to Home</button>
      </Link>

      <h1>HobbyHub</h1>
      <h2>🔐 Portal Login</h2>
      <p>Sign in with your credentials</p>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="admin, teacher, or your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            autoComplete="username"
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button type="submit" style={{ marginTop: '1rem', width: '100%' }} disabled={loading}>
          {loading ? 'Signing in...' : '🚀 Sign In'}
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
        <h3>📝 Available Accounts</h3>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
          <li><strong>admin</strong> - Full control</li>
          <li><strong>teacher</strong> - Read-only admin access</li>
          <li><strong>student</strong> - Regular user</li>
        </ul>
        <small style={{ color: '#888' }}>Created in Firebase console with email suffix @hobbyhub.local</small>
      </div>
    </div>
  );
}
