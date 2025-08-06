import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
  return (
    <div className="post-card">
      <Link to={`/post/${post.id}`}><h3>{post.title}</h3></Link>
      <p>Created: {new Date(post.createdAt).toLocaleString()}</p>
      <p>Upvotes: {post.upvotes}</p>
    </div>
  );
}