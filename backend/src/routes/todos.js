// backend/src/routes/todos.js
import express from 'express';
import { body, param, validationResult } from 'express-validator';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const createTodoValidation = [
    body('title').trim().isLength({ min: 1, max: 200 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('completed').optional().isBoolean()
];

const updateTodoValidation = [
    param('id').isInt(),
    body('title').optional().trim().isLength({ min: 1, max: 200 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('completed').optional().isBoolean()
];

// GET /api/todos - Get all todos for authenticated user
router.get('/', async (req, res) => {
    try {
        // Parameterized query prevents SQL injection
        // Check for project_id filter
        const { project_id } = req.query;
        let query = 'SELECT id, title, description, completed, created_at, updated_at FROM todos WHERE user_id = $1';
        const params = [req.user.userId];

        if (project_id) {
            query += ' AND project_id = $2';
            params.push(project_id);
        } else {
            // If no project_id specified (Dashboard view), ONLY return personal todos
            query += ' AND project_id IS NULL';
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);

        res.json({
            todos: result.rows,
            count: result.rows.length
        });

    } catch (error) {
        console.error('Get todos error:', error);
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
});

// POST /api/todos - Create new todo
router.post('/', createTodoValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description = '', completed = false, project_id = null } = req.body;

        // Parameterized query prevents SQL injection
        const result = await pool.query(
            'INSERT INTO todos (user_id, title, description, completed, project_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, description, completed, project_id, created_at, updated_at',
            [req.user.userId, title, description, completed, project_id]
        );

        res.status(201).json({
            message: 'Todo created successfully',
            todo: result.rows[0]
        });

    } catch (error) {
        console.error('Create todo error:', error);
        res.status(500).json({ error: 'Failed to create todo' });
    }
});

// PATCH /api/todos/:id - Update todo
router.patch('/:id', updateTodoValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { title, description, completed } = req.body;

        // Build dynamic update query
        const updates = [];
        const values = [req.user.userId, id];
        let paramCount = 3;

        if (title !== undefined) {
            updates.push(`title = $${paramCount}`);
            values.push(title);
            paramCount++;
        }
        if (description !== undefined) {
            updates.push(`description = $${paramCount}`);
            values.push(description);
            paramCount++;
        }
        if (completed !== undefined) {
            updates.push(`completed = $${paramCount}`);
            values.push(completed);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);

        // Parameterized query with user ownership check
        const query = `
      UPDATE todos 
      SET ${updates.join(', ')} 
      WHERE user_id = $1 AND id = $2 
      RETURNING id, title, description, completed, created_at, updated_at
    `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Todo not found or unauthorized' });
        }

        res.json({
            message: 'Todo updated successfully',
            todo: result.rows[0]
        });

    } catch (error) {
        console.error('Update todo error:', error);
        res.status(500).json({ error: 'Failed to update todo' });
    }
});

// DELETE /api/todos/:id - Delete todo
router.delete('/:id', [param('id').isInt()], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;

        // Parameterized query with user ownership check
        const result = await pool.query(
            'DELETE FROM todos WHERE user_id = $1 AND id = $2 RETURNING id',
            [req.user.userId, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Todo not found or unauthorized' });
        }

        res.json({
            message: 'Todo deleted successfully',
            id: result.rows[0].id
        });

    } catch (error) {
        console.error('Delete todo error:', error);
        res.status(500).json({ error: 'Failed to delete todo' });
    }
});

export default router;
