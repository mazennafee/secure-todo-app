// backend/src/routes/comments.js
import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { CommentModel } from '../models/comment.js';
import { NotificationModel } from '../models/notification.js';
import pool from '../db/index.js';

const router = express.Router();

router.use(authenticateToken);

// GET /api/todos/:todoId/comments - Get comments for a todo
router.get('/:todoId/comments', [param('todoId').isInt()], async (req, res) => {
    try {
        const comments = await CommentModel.findByTodoId(req.params.todoId);
        res.json({ comments });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// POST /api/todos/:todoId/comments - Add comment
router.post('/:todoId/comments', [
    param('todoId').isInt(),
    body('content').trim().isLength({ min: 1, max: 2000 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const comment = await CommentModel.create(
            req.params.todoId,
            req.user.userId,
            req.body.content
        );

        // Create notification for todo owner
        const todoResult = await pool.query(
            'SELECT user_id, title FROM todos WHERE id = $1',
            [req.params.todoId]
        );

        if (todoResult.rows[0] && todoResult.rows[0].user_id !== req.user.userId) {
            await NotificationModel.create(
                todoResult.rows[0].user_id,
                'comment',
                'New comment on your todo',
                `${req.user.email} commented on "${todoResult.rows[0].title}"`,
                comment.id,
                'comments'
            );
        }

        res.status(201).json({ message: 'Comment added', comment });
    } catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({ error: 'Failed to create comment' });
    }
});

// PATCH /api/comments/:id - Update comment
router.patch('/:id', [
    param('id').isInt(),
    body('content').trim().isLength({ min: 1, max: 2000 })
], async (req, res) => {
    try {
        const comment = await CommentModel.update(
            req.params.id,
            req.user.userId,
            req.body.content
        );

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found or unauthorized' });
        }

        res.json({ message: 'Comment updated', comment });
    } catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({ error: 'Failed to update comment' });
    }
});

// DELETE /api/comments/:id - Delete comment
router.delete('/:id', [param('id').isInt()], async (req, res) => {
    try {
        const comment = await CommentModel.delete(req.params.id, req.user.userId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found or unauthorized' });
        }

        res.json({ message: 'Comment deleted' });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

export default router;
