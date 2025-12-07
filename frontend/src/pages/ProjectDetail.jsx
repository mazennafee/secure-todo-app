// frontend/src/pages/ProjectDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CommentSection from '../components/Comments/CommentSection';
import AttachmentsList from '../components/Attachments/AttachmentsList';
import AddMemberModal from '../components/Projects/AddMemberModal';
import './ProjectDetail.css';

function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [members, setMembers] = useState([]);
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState({ title: '', description: '' });
    const [selectedTodo, setSelectedTodo] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [attachmentRefresh, setAttachmentRefresh] = useState(0);
    const [error, setError] = useState('');
    const [currentUserRole, setCurrentUserRole] = useState('');

    useEffect(() => {
        fetchProject();
        fetchProjectTodos();
    }, [id]);

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${id}`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setProject(data.project);
                setMembers(data.members || []);
                setCurrentUserRole(data.project.user_role);
            } else {
                setError('Failed to load project');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    const fetchProjectTodos = async () => {
        try {
            // Get todos filtered by project
            const res = await fetch(`/api/todos?project_id=${id}`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setTodos(data.todos || []);
            }
        } catch (err) {
            console.error('Failed to fetch todos:', err);
        }
    };

    const handleAddTodo = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...newTodo,
                    project_id: parseInt(id)
                })
            });
            if (res.ok) {
                setNewTodo({ title: '', description: '' });
                setShowAddForm(false);
                fetchProjectTodos();
            }
        } catch (err) {
            setError('Failed to add todo');
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
            if (res.ok) fetchProjectTodos();
        } catch (err) {
            setError('Failed to update todo');
        }
    };

    const handleDeleteTodo = async (todoId) => {
        if (!window.confirm('Delete this todo?')) return;
        try {
            const res = await fetch(`/api/todos/${todoId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) fetchProjectTodos();
        } catch (err) {
            setError('Failed to delete todo');
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
                setAttachmentRefresh(prev => prev + 1); // Trigger list refresh
                // Reset file input
                const fileInput = document.getElementById(`file-upload-${todoId}`);
                if (fileInput) fileInput.value = '';
            }
        } catch (err) {
            setError('Upload failed');
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm('Remove this member?')) return;
        try {
            const res = await fetch(`/api/projects/${id}/members/${memberId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) fetchProject();
        } catch (err) {
            setError('Failed to remove member');
        }
    };

    const handleDeleteProject = async () => {
        if (!window.confirm('Delete this entire project? This cannot be undone!')) return;
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                navigate('/projects');
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to delete project');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    const canDelete = currentUserRole === 'owner' || currentUserRole === 'admin';
    const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin' || currentUserRole === 'manager';

    if (!project) return <div className="loading">Loading...</div>;

    return (
        <div className="project-detail-container">
            <div className="project-header">
                <div>
                    <button onClick={() => navigate('/projects')} className="back-btn">
                        ← Back to Projects
                    </button>
                    <h1>📁 {project.name}</h1>
                    <p>{project.description || 'No description'}</p>
                    <div className="your-role">
                        Your Role: <span className={`role-badge role-${currentUserRole}`}>
                            {currentUserRole}
                        </span>
                    </div>
                </div>
                {canDelete && (
                    <button onClick={handleDeleteProject} className="delete-project-btn">
                        🗑️ Delete Project
                    </button>
                )}
            </div>

            {error && <div className="error-msg">{error}</div>}

            {/* Project Todos Section */}
            <div className="project-section">
                <div className="section-header">
                    <h2>📋 Tasks ({todos.length})</h2>
                    <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
                        {showAddForm ? 'Cancel' : '+ New Task'}
                    </button>
                </div>

                {showAddForm && (
                    <form onSubmit={handleAddTodo} className="add-todo-form">
                        <input
                            type="text"
                            placeholder="Task title"
                            value={newTodo.title}
                            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder="Description (optional)"
                            value={newTodo.description}
                            onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                        />
                        <button type="submit" className="btn-primary">Add Task</button>
                    </form>
                )}

                <div className="todos-list">
                    {todos.length === 0 ? (
                        <p className="empty-state">No tasks yet. Create one to get started!</p>
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
                                                id={`file-upload-${todo.id}`}
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
                                        {canDelete && (
                                            <button onClick={() => handleDeleteTodo(todo.id)} className="delete-btn">
                                                🗑️
                                            </button>
                                        )}
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
            </div>

            {/* Team Members Section */}
            <div className="project-section">
                <div className="section-header">
                    <h2>👥 Team Members ({members.length})</h2>
                    {canManageMembers && (
                        <button
                            onClick={() => setShowAddMemberModal(true)}
                            className="btn-primary"
                        >
                            + Add Member
                        </button>
                    )}
                </div>

                <div className="members-list">
                    {members.map(member => (
                        <div key={member.id} className="member-card">
                            <div className="member-info">
                                <div className="member-avatar">
                                    {member.name[0].toUpperCase()}
                                </div>
                                <div>
                                    <strong>{member.name}</strong>
                                    <span className="member-email">{member.email}</span>
                                </div>
                            </div>
                            <div className="member-actions">
                                <span className={`role-badge role-${member.role}`}>
                                    {member.role}
                                </span>
                                {canDelete && member.role !== 'owner' && (
                                    <button
                                        onClick={() => handleRemoveMember(member.id)}
                                        className="remove-btn"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showAddMemberModal && (
                <AddMemberModal
                    projectId={id}
                    onClose={() => setShowAddMemberModal(false)}
                    onSuccess={fetchProject}
                />
            )}
        </div>
    );
}

export default ProjectDetail;
