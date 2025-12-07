// frontend/src/components/Projects/CreateProjectModal.jsx
import { useState } from 'react';
import './CreateProjectModal.css';

function CreateProjectModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                onSuccess();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to create project');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>🚀 Create New Project</h3>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>

                <form onSubmit={handleSubmit} className="create-project-form">
                    <div className="form-group">
                        <label>Project Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Marketing Campaign 2024"
                            required
                            maxLength={200}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="What is this project about?"
                            rows={4}
                            maxLength={1000}
                        />
                        <small>{formData.description.length}/1000 characters</small>
                    </div>

                    {error && <div className="error-msg">{error}</div>}

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>

                <div className="modal-info">
                    <p>💡 <strong>Tip:</strong> You'll be set as the project owner and can add team members after creation.</p>
                </div>
            </div>
        </div>
    );
}

export default CreateProjectModal;
