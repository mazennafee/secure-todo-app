// frontend/src/components/Attachments/AttachmentsList.jsx
import { useState, useEffect } from 'react';
import './AttachmentsList.css';

function AttachmentsList({ todoId, refreshTrigger }) {
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttachments();
    }, [todoId, refreshTrigger]);

    const fetchAttachments = async () => {
        try {
            const res = await fetch(`/api/upload/todo/${todoId}/list`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setAttachments(data.attachments || []);
            }
        } catch (err) {
            console.error('Failed to fetch attachments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (attachmentId, filename) => {
        try {
            const res = await fetch(`/api/upload/${attachmentId}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (err) {
            console.error('Download failed:', err);
        }
    };

    const handleDelete = async (attachmentId) => {
        if (!window.confirm('Delete this file?')) return;
        try {
            const res = await fetch(`/api/upload/${attachmentId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                fetchAttachments();
            }
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const getFileIcon = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            pdf: '📄',
            doc: '📝',
            docx: '📝',
            txt: '📝',
            jpg: '🖼️',
            jpeg: '🖼️',
            png: '🖼️',
            gif: '🖼️',
            zip: '📦',
            rar: '📦',
            mp4: '🎬',
            mp3: '🎵'
        };
        return icons[ext] || '📎';
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    if (loading) return null;
    if (attachments.length === 0) return null;

    return (
        <div className="attachments-section">
            <h4>📎 Attachments ({attachments.length})</h4>
            <div className="attachments-list">
                {attachments.map(att => (
                    <div key={att.id} className="attachment-item">
                        <span className="file-icon">{getFileIcon(att.filename)}</span>
                        <div className="file-info">
                            <div className="file-name">{att.filename}</div>
                            <div className="file-meta">
                                {formatFileSize(att.file_size)} • {new Date(att.created_at).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="file-actions">
                            <button
                                onClick={() => handleDownload(att.id, att.filename)}
                                className="download-btn"
                                title="Download"
                            >
                                ⬇️
                            </button>
                            <button
                                onClick={() => handleDelete(att.id)}
                                className="delete-file-btn"
                                title="Delete"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AttachmentsList;
