// frontend/src/components/Comments/CommentSection.jsx
import { useState, useEffect } from 'react';
import './CommentSection.css';

function CommentSection({ todoId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchComments();
    }, [todoId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/todos/${todoId}/comments`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setComments(data.comments);
            }
        } catch (err) {
            setError('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const res = await fetch(`/api/todos/${todoId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ content: newComment })
            });

            if (res.ok) {
                setNewComment('');
                fetchComments();
            } else {
                setError('Failed to post comment');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    const handleDelete = async (commentId) => {
        if (!confirm('Delete this comment?')) return;

        try {
            const res = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                fetchComments();
            }
        } catch (err) {
            setError('Failed to delete comment');
        }
    };

    if (loading) return <div className="loading-comments">Loading comments...</div>;

    return (
        <div className="comment-section">
            <h3>Comments ({comments.length})</h3>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmit} className="comment-form">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    maxLength={2000}
                    rows={3}
                />
                <button type="submit" disabled={!newComment.trim()}>
                    Post Comment
                </button>
            </form>

            <div className="comments-list">
                {comments.length === 0 ? (
                    <p className="no-comments">No comments yet. Be the first to comment!</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="comment">
                            <div className="comment-header">
                                <span className="comment-author">{comment.user_name}</span>
                                <span className="comment-time">
                                    {new Date(comment.created_at).toLocaleString()}
                                </span>
                            </div>
                            <div className="comment-content">{comment.content}</div>
                            <button
                                onClick={() => handleDelete(comment.id)}
                                className="delete-comment"
                                aria-label="Delete comment"
                            >
                                🗑️
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default CommentSection;
