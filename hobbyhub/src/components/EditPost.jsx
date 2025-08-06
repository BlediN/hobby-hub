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
      <h2>Edit Post</h2>
      <form onSubmit={handleUpdate}>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} />
        <input value={image} onChange={(e) => setImage(e.target.value)} />
        <button type="submit">Update</button>
      </form>
    </div>
  );
}