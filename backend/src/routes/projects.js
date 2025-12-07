// backend/src/routes/projects.js
import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { ProjectModel } from '../models/project.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/projects - Get all projects for user
router.get('/', async (req, res) => {
    try {
        const projects = await ProjectModel.findByUserId(req.user.userId);
        res.json({ projects });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// POST /api/projects - Create project
router.post('/', [
    body('name').trim().isLength({ min: 1, max: 200 }),
    body('description').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description } = req.body;
        const project = await ProjectModel.create(req.user.userId, name, description);

        res.status(201).json({
            message: 'Project created successfully',
            project
        });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// GET /api/projects/:id - Get project by ID
router.get('/:id', [param('id').isInt()], async (req, res) => {
    try {
        const project = await ProjectModel.findById(req.params.id, req.user.userId);

        if (!project || !project.user_role) {
            return res.status(404).json({ error: 'Project not found or access denied' });
        }

        const members = await ProjectModel.getMembers(req.params.id);

        res.json({ project, members });
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// PATCH /api/projects/:id - Update project
router.patch('/:id', [
    param('id').isInt(),
    body('name').optional().trim().isLength({ min: 1, max: 200 }),
    body('description').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Check permission
        const project = await ProjectModel.findById(req.params.id, req.user.userId);
        if (!project || !['owner', 'admin'].includes(project.user_role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const updated = await ProjectModel.update(req.params.id, req.body);
        res.json({ message: 'Project updated', project: updated });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', [param('id').isInt()], async (req, res) => {
    try {
        const project = await ProjectModel.findById(req.params.id, req.user.userId);
        if (!project || project.user_role !== 'owner') {
            return res.status(403).json({ error: 'Only project owner can delete' });
        }

        await ProjectModel.delete(req.params.id);
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// POST /api/projects/:id/members - Add member
router.post('/:id/members', [
    param('id').isInt(),
    param('id').isInt(),
    body('email').isEmail().normalizeEmail(), // Accept email instead of userId
    body('role').optional().isIn(['owner', 'admin', 'member'])
], async (req, res) => {
    try {
        const project = await ProjectModel.findById(req.params.id, req.user.userId);
        if (!project || !['owner', 'admin'].includes(project.user_role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        // Find user by email
        const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [req.body.email]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = userResult.rows[0].id;

        // Prevent adding yourself again (optional, depending on logic)
        // if (userId === req.user.userId) ...

        const member = await ProjectModel.addMember(
            req.params.id,
            userId,
            req.body.role || 'member'
        );

        res.status(201).json({ message: 'Member added', member });
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({ error: 'Failed to add member' });
    }
});

// DELETE /api/projects/:id/members/:userId - Remove member
router.delete('/:id/members/:userId', [
    param('id').isInt(),
    param('userId').isInt()
], async (req, res) => {
    try {
        const project = await ProjectModel.findById(req.params.id, req.user.userId);
        if (!project || !['owner', 'admin'].includes(project.user_role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        await ProjectModel.removeMember(req.params.id, req.params.userId);
        res.json({ message: 'Member removed' });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ error: 'Failed to remove member' });
    }
});

export default router;
