import { useParams, useNavigate } from 'react-router-dom';
import { posts } from '../data';
import { useState } from 'react';

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = posts.find(p => p.id === Number(id));
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