import { useState } from 'react';
import { posts } from '../data';
import PostCard from '../components/PostCard';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser, isAdminUser, isTeacherUser, isAdminViewer } from '../utils/userSession';

export default function Home() {
  const [sortBy, setSortBy] = useState('createdAt');
  const [search, setSearch] = useState('');
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  const sortedPosts = [...posts]
    .filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'upvotes' ? b.upvotes - a.upvotes : new Date(b.createdAt) - new Date(a.createdAt));

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logoutUser();
      navigate('/login');
    }
  };

  return (
    <div className="container">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1>🎨 HobbyHub</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#888', fontSize: '0.95rem' }}>
            👤 Logged in as: <strong>{currentUser}</strong>
            {isAdminUser() && <span style={{ color: '#6366f1', marginLeft: '0.5rem' }}>⭐ Admin</span>}
            {isTeacherUser() && <span style={{ color: '#fbbf24', marginLeft: '0.5rem' }}>📘 Teacher (Read-only)</span>}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/create"><button>✨ Create New Post</button></Link>
          {isAdminViewer() && <Link to="/admin"><button style={{ backgroundColor: '#8b5cf6' }}>⚙️ Admin</button></Link>}
          <button onClick={handleLogout} style={{ backgroundColor: '#ef4444' }}>🚪 Logout</button>
        </div>
      </div>
      
      <div className="controls">
        <input 
          placeholder="🔍 Search by title..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="createdAt">📅 Newest</option>
          <option value="upvotes">👍 Most Upvoted</option>
        </select>
      </div>

      {sortedPosts.length > 0 ? (
        sortedPosts.map(post => <PostCard key={post.id} post={post} />)
      ) : (
        <div className="text-center mt-3">
          <p>No posts found. <Link to="/create">Create one now!</Link></p>
        </div>
      )}
    </div>
  );
}