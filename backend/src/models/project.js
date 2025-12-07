// backend/src/models/project.js
import pool from '../db/index.js';

export const ProjectModel = {
    // Create new project
    async create(ownerId, name, description = '') {
        const result = await pool.query(
            'INSERT INTO projects (owner_id, name, description) VALUES ($1, $2, $3) RETURNING id, name, description, owner_id, created_at',
            [ownerId, name, description]
        );

        const project = result.rows[0];

        // Auto-add owner as project member with 'owner' role
        await pool.query(
            'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
            [project.id, ownerId, 'owner']
        );

        return project;
    },

    // Get all projects user has access to
    async findByUserId(userId) {
        const result = await pool.query(
            `SELECT DISTINCT p.id, p.name, p.description, p.owner_id, p.created_at, p.updated_at,
                    pm.role as user_role
             FROM projects p
             LEFT JOIN project_members pm ON p.id = pm.project_id
             WHERE pm.user_id = $1
             ORDER BY p.created_at DESC`,
            [userId]
        );
        return result.rows;
    },

    // Get project by ID (with permission check)
    async findById(projectId, userId) {
        const result = await pool.query(
            `SELECT p.id, p.name, p.description, p.owner_id, p.created_at, p.updated_at,
                    pm.role as user_role
             FROM projects p
             LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $2
             WHERE p.id = $1`,
            [projectId, userId]
        );
        return result.rows[0] || null;
    },

    // Update project
    async update(projectId, updates) {
        const { name, description } = updates;
        const result = await pool.query(
            'UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
            [name, description, projectId]
        );
        return result.rows[0] || null;
    },

    // Delete project
    async delete(projectId) {
        const result = await pool.query(
            'DELETE FROM projects WHERE id = $1 RETURNING id',
            [projectId]
        );
        return result.rows[0] || null;
    },

    // Add member to project
    async addMember(projectId, userId, role = 'member') {
        const result = await pool.query(
            'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT (project_id, user_id) DO UPDATE SET role = $3 RETURNING *',
            [projectId, userId, role]
        );
        return result.rows[0];
    },

    // Remove member from project
    async removeMember(projectId, userId) {
        const result = await pool.query(
            'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING id',
            [projectId, userId]
        );
        return result.rows[0] || null;
    },

    // Get project members
    async getMembers(projectId) {
        const result = await pool.query(
            `SELECT u.id, u.email, u.name, pm.role, pm.joined_at
             FROM project_members pm
             JOIN users u ON pm.user_id = u.id
             WHERE pm.project_id = $1
             ORDER BY pm.joined_at`,
            [projectId]
        );
        return result.rows;
    }
};
