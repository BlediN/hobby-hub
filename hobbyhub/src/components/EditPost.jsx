import { useParams, useNavigate } from 'react-router-dom';
import { posts } from '../data';
import { useState } from 'react';
import { getCurrentUser, canEditPost } from '../utils/userSession';

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const post = posts.find(p => p.id === Number(id));

  if (!post) {
    return (
      <div className="container">
        <h2>Post not found</h2>
        <button onClick={() => navigate('/')}>← Back to Home</button>
      </div>
    );
  }

  if (!canEditPost(post.author)) {
    return (
      <div className="container">
        <h2>❌ Access Denied</h2>
        <p>You do not have permission to edit this post.</p>
        <p>This post was created by <strong>{post.author}</strong></p>
        <button onClick={() => navigate(`/post/${post.id}`)}>← Back to Post</button>
      </div>
    );
  }

  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [image, setImage] = useState(post.image);

  const handleUpdate = (e) => {
    e.preventDefault();
    post.title = title;
    post.content = content;
    post.image = image;
    navigate(`/post/${post.id}`);
  };

  return (
    <div className="container">
      <button onClick={() => navigate(`/post/${post.id}`)}>← Back to Post</button>
      
      <h2>✏️ Edit Post</h2>
      
      <form onSubmit={handleUpdate}>
        <div>
          <label htmlFor="title">Title</label>
          <input 
            id="title"
            required 
            placeholder="Enter post title"
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
        </div>

        <div>
          <label htmlFor="content">Content</label>
          <textarea 
            id="content"
            placeholder="Write your hobby post content here..."
            value={content} 
            onChange={(e) => setContent(e.target.value)}
            rows="6"
          />
        </div>

        <div>
          <label htmlFor="image">Image URL</label>
          <input 
            id="image"
            placeholder="https://example.com/image.jpg"
            value={image} 
            onChange={(e) => setImage(e.target.value)} 
          />
        </div>

        <button type="submit">💾 Update Post</button>
      </form>
    </div>
  );
}