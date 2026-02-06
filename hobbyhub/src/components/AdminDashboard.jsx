import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { posts } from '../data';
import { 
  isAdminViewer, 
  isTeacherUser, 
  getCurrentUser, 
  logoutUser
} from '../utils/userSession';
import { 
  getSuspiciousActivityLogs, 
  getBlockedFingerprints, 
  clearAllLogs,
  exportLogsAsJSON
} from '../utils/ipBlocking';
import { 
  signInWithEmailAndPassword, 
  updatePassword 
} from 'firebase/auth';
import { auth } from '../firebase';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  
  const isReadOnly = isTeacherUser();

  // Redirect non-admins
  if (!isAdminViewer()) {
    return (
      <div className="container">
        <h2>❌ Access Denied</h2>
        <p>You do not have admin privileges.</p>
        <button onClick={() => navigate('/')}>← Back to Home</button>
      </div>
    );
  }

  const [logs, setLogs] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);
  const [showUsers, setShowUsers] = useState(true);
  const [showPosts, setShowPosts] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setLogs(getSuspiciousActivityLogs());
    setBlocked(getBlockedFingerprints());
  };

  const handleClearLogs = () => {
    if (isReadOnly) {
      return;
    }
    if (window.confirm('Are you sure you want to clear all logs? This cannot be undone.')) {
      clearAllLogs();
      refreshData();
    }
  };

  const handleExportLogs = () => {
    const jsonData = exportLogsAsJSON();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bot-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeletePost = (postId) => {
    if (isReadOnly) {
      return;
    }
    if (window.confirm('Delete this post permanently?')) {
      const index = posts.findIndex(p => p.id === postId);
      if (index > -1) {
        posts.splice(index, 1);
        refreshData();
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm('Logout from admin panel?')) {
      logoutUser();
      navigate('/login');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage('');

    if (newPassword.trim() !== confirmPassword.trim()) {
      setPasswordMessage('New passwords do not match.');
      return;
    }

    if (newPassword.trim().length < 8) {
      setPasswordMessage('New password must be at least 8 characters.');
      return;
    }

    try {
      // Re-authenticate with Firebase using current password
      const userEmail = currentUser.toLowerCase() === 'admin' 
        ? 'admin@hobbyhub.local' 
        : `${currentUser}@hobbyhub.local`;
      
      await signInWithEmailAndPassword(auth, userEmail, currentPassword.trim());
      
      // If successful, update password
      await updatePassword(auth.currentUser, newPassword.trim());
      
      setPasswordMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setPasswordMessage('Current password is incorrect.');
      } else {
        setPasswordMessage('Error updating password. Please try again.');
      }
    }
  };

  // Get all authors
  const authors = new Set();
  posts.forEach(post => {
    if (post.author) authors.add(post.author);
  });
  const authorList = Array.from(authors).sort();

  return (
    <div className="container">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h1>⚙️ Admin Dashboard</h1>
          <p style={{ color: '#888', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
            Logged in as: <strong>{currentUser}</strong>{' '}
            {isReadOnly ? '📘 Teacher (Read-only)' : '⭐ Admin'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/"><button>← Home</button></Link>
          <button onClick={handleLogout} style={{ backgroundColor: '#ef4444' }}>🚪 Logout</button>
        </div>
      </div>

      {isReadOnly && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          borderRadius: '8px',
          borderLeft: '3px solid #fbbf24',
          color: '#fcd34d'
        }}>
          Read-only mode: you can view data but cannot modify posts or logs.
        </div>
      )}

      {!isReadOnly && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderRadius: '8px',
          borderLeft: '3px solid #6366f1'
        }}>
          <h3 style={{ margin: '0 0 0.75rem 0' }}>🔐 Change Admin Password</h3>
          {passwordMessage && (
            <div style={{ marginBottom: '0.75rem', color: '#fbbf24' }}>{passwordMessage}</div>
          )}
          <form onSubmit={handlePasswordChange}>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
              <input
                type="password"
                placeholder="New password (min 8 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <button type="submit" style={{ marginTop: '0.75rem' }}>Update Password</button>
          </form>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => { setShowUsers(true); setShowPosts(false); setShowLogs(false); setShowBlocked(false); }}
          style={{
            backgroundColor: showUsers ? '#6366f1' : '#3b3b4f',
            transition: 'all 0.3s'
          }}
        >
          👥 Users ({authorList.length})
        </button>
        
        <button 
          onClick={() => { setShowPosts(true); setShowUsers(false); setShowLogs(false); setShowBlocked(false); }}
          style={{
            backgroundColor: showPosts ? '#8b5cf6' : '#3b3b4f',
            transition: 'all 0.3s'
          }}
        >
          📝 Posts ({posts.length})
        </button>

        <button 
          onClick={() => { setShowLogs(true); setShowUsers(false); setShowPosts(false); setShowBlocked(false); }}
          style={{
            backgroundColor: showLogs ? '#10b981' : '#3b3b4f',
            transition: 'all 0.3s'
          }}
        >
          📊 Activities ({logs.length})
        </button>
        
        <button 
          onClick={() => { setShowBlocked(true); setShowLogs(false); setShowUsers(false); setShowPosts(false); }}
          style={{
            backgroundColor: showBlocked ? '#ef4444' : '#3b3b4f',
            transition: 'all 0.3s'
          }}
        >
          🚫 Blocked ({blocked.length})
        </button>

        <button onClick={refreshData} style={{ marginLeft: 'auto' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Users Tab */}
      {showUsers && (
        <div>
          <h2>👥 Users & Activity</h2>
          
          {authorList.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
              No users yet
            </div>
          ) : (
            <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
              {authorList.map(author => {
                const userPosts = posts.filter(p => p.author === author);
                const totalUpvotes = userPosts.reduce((sum, p) => sum + p.upvotes, 0);
                return (
                  <div 
                    key={author}
                    style={{
                      backgroundColor: '#16213e',
                      padding: '1rem',
                      borderRadius: '8px',
                      borderLeft: '3px solid #6366f1'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ margin: '0 0 0.5rem 0' }}>👤 {author}</h3>
                        <div style={{ fontSize: '0.9rem', color: '#888' }}>
                          📝 {userPosts.length} post{userPosts.length !== 1 ? 's' : ''} • 👍 {totalUpvotes} total upvotes
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Posts Tab */}
      {showPosts && (
        <div>
          <h2>📝 All Posts</h2>
          
          {posts.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
              No posts yet
            </div>
          ) : (
            <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
              {posts.map(post => (
                <div 
                  key={post.id}
                  style={{
                    backgroundColor: '#16213e',
                    padding: '1rem',
                    borderRadius: '8px',
                    borderLeft: '3px solid #8b5cf6'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 0.3rem 0' }}>
                        <Link to={`/post/${post.id}`} style={{ color: '#6366f1' }}>
                          {post.title}
                        </Link>
                      </h3>
                      <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>
                        👤 {post.author} • 📅 {new Date(post.createdAt).toLocaleString()} • 👍 {post.upvotes}
                      </div>
                      <p style={{ margin: '0', color: '#bbb', fontSize: '0.9rem' }}>
                        {post.content.substring(0, 100)}...
                      </p>
                    </div>
                    {!isReadOnly && (
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        style={{ backgroundColor: '#ef4444', whiteSpace: 'nowrap' }}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Suspicious Activity Tab */}
      {showLogs && (
        <div>
          <h2>📊 Suspicious Activity Logs</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <button onClick={handleExportLogs}>📥 Export as JSON</button>
            {!isReadOnly && (
              <button onClick={handleClearLogs} style={{ backgroundColor: '#ef4444' }}>
                🗑️ Clear All Logs
              </button>
            )}
          </div>

          {logs.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
              ✅ No suspicious activity detected!
            </div>
          ) : (
            <div style={{ marginTop: '1rem' }}>
              {logs.map((log, idx) => (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: '#16213e',
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderRadius: '8px',
                    borderLeft: '3px solid #ef4444'
                  }}
                >
                  <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <div>
                      <strong>Action:</strong> {log.action || 'unknown'}
                    </div>
                    <div>
                      <strong>Reason:</strong> {log.reason || 'N/A'}
                    </div>
                    <div>
                      <strong>Time:</strong> {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Blocked Fingerprints Tab */}
      {showBlocked && (
        <div>
          <h2>🚫 Blocked Fingerprints</h2>
          
          {blocked.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
              ✅ No fingerprints are currently blocked!
            </div>
          ) : (
            <div style={{ marginTop: '1rem' }}>
              {blocked.map((entry, idx) => {
                const timeRemaining = Math.ceil((entry.expiresAt - Date.now()) / 1000);
                const minutes = Math.ceil(timeRemaining / 60);
                
                return (
                  <div 
                    key={idx}
                    style={{
                      backgroundColor: '#16213e',
                      padding: '1rem',
                      marginBottom: '1rem',
                      borderRadius: '8px',
                      borderLeft: '3px solid #ec4899'
                    }}
                  >
                    <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <div>
                        <strong>Fingerprint:</strong> <code>{entry.fingerprint}</code>
                      </div>
                      <div>
                        <strong>Expires in:</strong> {minutes} minute(s)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Statistics */}
      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderRadius: '8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
            {authorList.length}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#888' }}>Total Users</div>
        </div>
        
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6366f1' }}>
            {posts.length}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#888' }}>Total Posts</div>
        </div>

        <div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {posts.reduce((sum, p) => sum + p.upvotes, 0)}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#888' }}>Total Upvotes</div>
        </div>

        <div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
            {logs.length}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#888' }}>Suspicious Activities</div>
        </div>
      </div>
    </div>
  );
}
