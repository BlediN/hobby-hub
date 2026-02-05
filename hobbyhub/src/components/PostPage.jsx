// import { useParams, useNavigate } from 'react-router-dom';
// import { posts } from '../data';
// import { useState } from 'react';

// export default function PostPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const post = posts.find(p => p.id === Number(id));
//   const [comment, setComment] = useState('');

//   if (!post) {
//     return (
//       <div className="container">
//         <h2>Post not found</h2>
//         <button onClick={() => navigate('/')}>Go Home</button>
//       </div>
//     );
//   }

//   const handleUpvote = () => {
//     post.upvotes += 1;
//     navigate(0);
//   };

//   const handleComment = () => {
//     if (comment.trim()) {
//       post.comments.push(comment);
//       setComment('');
//       navigate(0);
//     }
//   };

//   const handleDelete = () => {
//     const index = posts.findIndex(p => p.id === post.id);
//     posts.splice(index, 1);
//     navigate('/');
//   };

//   return (
//     <div className="container">
//       <h2>{post.title}</h2>
//       <p>{post.content}</p>

//       {post.image && post.image.startsWith('http') ? (
//         <img
//           src={post.image}
//           alt="Post"
//           width="300"
//           onError={(e) => {
//             e.target.onerror = null;
//             e.target.style.display = 'none';
//           }}
//         />
//       ) : (
//         <p>No image available</p>
//       )}

//       <p>Upvotes: {post.upvotes}</p>
//       <button onClick={handleUpvote}>Upvote</button>
//       <button onClick={() => navigate(`/edit/${post.id}`)}>Edit</button>
//       <button onClick={handleDelete}>Delete</button>

//       <h3>Comments</h3>
//       <ul>
//         {post.comments.map((c, i) => (
//           <li key={i}>{c}</li>
//         ))}
//       </ul>
//       <input
//         value={comment}
//         onChange={(e) => setComment(e.target.value)}
//         placeholder="Add comment"
//       />
//       <button onClick={handleComment}>Comment</button>
//     </div>
//   );
// }


// import { useParams, useNavigate } from 'react-router-dom';
// import { posts } from '../data';
// import { useState } from 'react';

// export default function PostPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const post = posts.find(p => p.id === Number(id));

//   const [upvotes, setUpvotes] = useState(post?.upvotes || 0);
//   const [comments, setComments] = useState(post?.comments || []);
//   const [comment, setComment] = useState('');

//   if (!post) {
//     return (
//       <div className="container">
//         <h2>Post not found</h2>
//         <button onClick={() => navigate('/')}>Go Home</button>
//       </div>
//     );
//   }

//   const handleUpvote = () => {
//     post.upvotes += 1;
//     setUpvotes(post.upvotes); // trigger re-render
//   };

//   const handleComment = () => {
//     if (comment.trim()) {
//       post.comments.push(comment);
//       setComments([...post.comments]); // trigger re-render
//       setComment('');
//     }
//   };

//   const handleDelete = () => {
//     const index = posts.findIndex(p => p.id === post.id);
//     posts.splice(index, 1);
//     navigate('/');
//   };

//   return (
//     <div className="container">
//       <h2>{post.title}</h2>
//       <p>{post.content}</p>

//       {post.image && post.image.startsWith('http') ? (
//         <img
//           src={post.image}
//           alt="Post"
//           width="300"
//           onError={(e) => {
//             e.target.onerror = null;
//             e.target.style.display = 'none';
//           }}
//         />
//       ) : (
//         <p>No image available</p>
//       )}

//       <p>Upvotes: {upvotes}</p>
//       <button onClick={handleUpvote}>Upvote</button>
//       <button onClick={() => navigate(`/edit/${post.id}`)}>Edit</button>
//       <button onClick={handleDelete}>Delete</button>

//       <h3>Comments</h3>
//       <ul>
//         {comments.map((c, i) => (
//           <li key={i}>{c}</li>
//         ))}
//       </ul>
//       <input
//         value={comment}
//         onChange={(e) => setComment(e.target.value)}
//         placeholder="Add comment"
//       />
//       <button onClick={handleComment}>Comment</button>
//     </div>
//   );
// }




import { useParams, useNavigate } from 'react-router-dom';
import { posts } from '../data';
import { useState } from 'react';

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = posts.find(p => p.id === Number(id));

  const [upvotes, setUpvotes] = useState(post?.upvotes || 0);
  const [comments, setComments] = useState(post?.comments || []);
  const [comment, setComment] = useState('');

  if (!post) {
    return (
      <div className="container">
        <h2>Post not found</h2>
        <button onClick={() => navigate('/')}>← Back to Posts</button>
      </div>
    );
  }

  const handleUpvote = () => {
    post.upvotes += 1;
    setUpvotes(post.upvotes);
  };

  const handleComment = () => {
    if (comment.trim()) {
      post.comments.push(comment);
      setComments([...post.comments]);
      setComment('');
    }
  };

  const handleDelete = () => {
    const index = posts.findIndex(p => p.id === post.id);
    posts.splice(index, 1);
    navigate('/');
  };

  return (
    <div className="container post-page">
      <button onClick={() => navigate('/')}>← Back to Posts</button>

      <h2>{post.title}</h2>
      
      {post.image && post.image.startsWith('http') ? (
        <img
          src={post.image}
          alt="Post"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
          }}
        />
      ) : null}

      <p>{post.content}</p>

      <div className="post-meta">
        <div className="post-meta-item">
          <span className="post-meta-label">Upvotes</span>
          <span className="post-meta-value">👍 {upvotes}</span>
        </div>
        <div className="post-meta-item">
          <span className="post-meta-label">Created</span>
          <span className="post-meta-value">{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="button-group">
        <button onClick={handleUpvote}>👍 Upvote ({upvotes})</button>
        <button onClick={() => navigate(`/edit/${post.id}`)}>✏️ Edit</button>
        <button onClick={handleDelete} style={{backgroundColor: '#ef4444'}}>🗑️ Delete</button>
      </div>

      <div className="comments-section">
        <h3>💬 Comments ({comments.length})</h3>
        {comments.length > 0 ? (
          comments.map((c, i) => (
            <div key={i} className="comment">
              <p>{c}</p>
            </div>
          ))
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleComment(); }} className="mt-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add your comment here..."
            rows="3"
          />
          <button type="submit">Post Comment</button>
        </form>
      </div>
    </div>
  );
}