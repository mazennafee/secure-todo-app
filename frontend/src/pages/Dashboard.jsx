import React, { useState, useEffect } from 'react';
import CommentSection from '../components/Comments/CommentSection';
import AttachmentsList from '../components/Attachments/AttachmentsList';
import './Dashboard.css';

function Dashboard() {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState({ title: '', description: '' });
    const [selectedTodo, setSelectedTodo] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
    const [attachmentRefresh, setAttachmentRefresh] = useState(0);

    useEffect(() => {
        fetchTodos();
    }, []);

    useEffect(() => {
        // Calculate stats whenever todos change
        const total = todos.length;
        const completed = todos.filter(t => t.status === 'completed').length;
        const pending = total - completed;
        setStats({ total, completed, pending });
    }, [todos]);

    const fetchTodos = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/todos', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setTodos(data.todos || []);
            }
        } catch (err) {
            console.error('Failed to fetch todos:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTodo = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newTodo)
            });
            if (res.ok) {
                setNewTodo({ title: '', description: '' });
                setShowAddForm(false);
                fetchTodos();
            }
        } catch (err) {
            console.error('Failed to add todo:', err);
        }
    };

    const handleToggleStatus = async (todo) => {
        const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
        try {
            const res = await fetch(`/api/todos/${todo.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchTodos();
        } catch (err) {
            console.error('Failed to update todo:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this todo?')) return;
        try {
            const res = await fetch(`/api/todos/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) fetchTodos();
        } catch (err) {
            console.error('Failed to delete todo:', err);
        }
    };

    const handleFileUpload = async (todoId, file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`/api/upload/todo/${todoId}`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            if (res.ok) {
                alert('File uploaded successfully!');
                setAttachmentRefresh(prev => prev + 1);
            }
        } catch (err) {
            console.error('Upload failed:', err);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>📋 My Personal Tasks</h1>
                    <p className="subtitle">Manage your personal todos (project tasks are in Projects)</p>
                </div>
                <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
                    {showAddForm ? 'Cancel' : '+ New Todo'}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card stat-total">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Tasks</div>
                    </div>
                </div>
                <div className="stat-card stat-completed">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.completed}</div>
                        <div className="stat-label">Completed</div>
                    </div>
                </div>
                <div className="stat-card stat-pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.pending}</div>
                        <div className="stat-label">Pending</div>
                    </div>
                </div>
                <div className="stat-card stat-progress">
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                        <div className="stat-value">
                            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                        </div>
                        <div className="stat-label">Progress</div>
                    </div>
                </div>
            </div>

            {showAddForm && (
                <form onSubmit={handleAddTodo} className="add-todo-form">
                    <input
                        type="text"
                        placeholder="Todo title"
                        value={newTodo.title}
                        onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                        required
                        autoFocus
                    />
                    <textarea
                        placeholder="Description (optional)"
                        value={newTodo.description}
                        onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                    />
                    <button type="submit" className="btn-primary">Add Todo</button>
                </form>
            )}

            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading your tasks...</p>
                </div>
            ) : (
                <div className="todos-list">
                    {todos.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📝</div>
                            <h3>No personal tasks yet</h3>
                            <p>Create your first todo to get started!</p>
                        </div>
                    ) : (
                        todos.map(todo => (
                            <div key={todo.id} className="todo-card">
                                <div className="todo-main">
                                    <input
                                        type="checkbox"
                                        checked={todo.status === 'completed'}
                                        onChange={() => handleToggleStatus(todo)}
                                        className="todo-checkbox"
                                    />
                                    <div className="todo-content">
                                        <h3 className={todo.status === 'completed' ? 'completed' : ''}>
                                            {todo.title}
                                        </h3>
                                        {todo.description && <p>{todo.description}</p>}
                                        <AttachmentsList todoId={todo.id} refreshTrigger={attachmentRefresh} />
                                    </div>
                                    <div className="todo-actions">
                                        <label className="upload-btn">
                                            📎
                                            <input
                                                type="file"
                                                onChange={(e) => handleFileUpload(todo.id, e.target.files[0])}
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                        <button
                                            onClick={() => setSelectedTodo(selectedTodo === todo.id ? null : todo.id)}
                                            className="comment-btn"
                                        >
                                            💬
                                        </button>
                                        <button onClick={() => handleDelete(todo.id)} className="delete-btn">
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                {selectedTodo === todo.id && (
                                    <div className="todo-comments">
                                        <CommentSection todoId={todo.id} />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default Dashboard;
