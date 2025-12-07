// frontend/src/components/Projects/ProjectList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CreateProjectModal from './CreateProjectModal';
import './ProjectList.css';

function ProjectList() {
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        // Filter projects based on search and role filter
        let filtered = projects;

        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (filterRole !== 'all') {
            filtered = filtered.filter(p => p.user_role === filterRole);
        }

        setFilteredProjects(filtered);
    }, [projects, searchTerm, filterRole]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/projects', {
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                setProjects(data.projects || []);
            } else {
                setError('Failed to load projects');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleProjectCreated = () => {
        setShowModal(false);
        fetchProjects();
    };

    const getProjectIcon = (role) => {
        const icons = {
            owner: '👑',
            admin: '⚙️',
            manager: '📊',
            member: '👤'
        };
        return icons[role] || '📁';
    };

    const getProjectColor = (index) => {
        const colors = ['#667eea', '#48bb78', '#ed8936', '#9f7aea', '#f56565', '#38b2ac'];
        return colors[index % colors.length];
    };

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading projects...</p>
            </div>
        );
    }

    return (
        <div className="project-list-container">
            <div className="project-list-header">
                <div>
                    <h1>📁 My Projects</h1>
                    <p className="subtitle">Collaborate with your team on shared tasks</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary">
                    + New Project
                </button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {/* Search and Filters */}
            <div className="project-controls">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="filter-group">
                    <label>Filter by role:</label>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Projects</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="member">Member</option>
                    </select>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="projects-stats">
                <div className="stat-item">
                    <span className="stat-value">{projects.length}</span>
                    <span className="stat-label">Total Projects</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{projects.filter(p => p.user_role === 'owner').length}</span>
                    <span className="stat-label">Owned by You</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{projects.filter(p => p.user_role !== 'owner').length}</span>
                    <span className="stat-label">Shared with You</span>
                </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📁</div>
                    <h3>{searchTerm ? 'No matching projects' : 'No projects yet'}</h3>
                    <p>
                        {searchTerm
                            ? 'Try a different search term'
                            : 'Create your first project to start collaborating!'}
                    </p>
                    {!searchTerm && (
                        <button onClick={() => setShowModal(true)} className="btn-primary">
                            Create Project
                        </button>
                    )}
                </div>
            ) : (
                <div className="projects-grid">
                    {filteredProjects.map((project, index) => (
                        <Link
                            key={project.id}
                            to={`/projects/${project.id}`}
                            className="project-card"
                            style={{ '--project-color': getProjectColor(index) }}
                        >
                            <div className="project-card-header">
                                <div className="project-icon" style={{ background: getProjectColor(index) }}>
                                    {getProjectIcon(project.user_role)}
                                </div>
                                <span className={`role-badge role-${project.user_role}`}>
                                    {project.user_role}
                                </span>
                            </div>

                            <h3 className="project-title">{project.name}</h3>
                            <p className="project-description">
                                {project.description || 'No description provided'}
                            </p>

                            <div className="project-stats">
                                <div className="stat">
                                    <span className="stat-icon">📋</span>
                                    <span>{project.task_count || 0} tasks</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-icon">👥</span>
                                    <span>{project.member_count || 1} members</span>
                                </div>
                            </div>

                            <div className="project-footer">
                                <span className="view-link">View Project →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {showModal && (
                <CreateProjectModal
                    onClose={() => setShowModal(false)}
                    onSuccess={handleProjectCreated}
                />
            )}
        </div>
    );
}

export default ProjectList;
