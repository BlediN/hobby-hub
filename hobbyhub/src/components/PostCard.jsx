import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
  return (
    <div className="post-card">
      <Link to={`/post/${post.id}`}><h3>{post.title}</h3></Link>
      <p className="post-card">{post.content.substring(0, 100)}...</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <span style={{ fontSize: '0.9rem', color: '#888' }}>
          📅 {new Date(post.createdAt).toLocaleDateString()}
        </span>
        <span style={{ fontSize: '1rem' }}>
          👍 {post.upvotes}
        </span>
      </div>
    </div>
  );
}