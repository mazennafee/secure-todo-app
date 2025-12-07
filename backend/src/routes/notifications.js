// backend/src/routes/notifications.js
import express from 'express';
import { param, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { NotificationModel } from '../models/notification.js';

const router = express.Router();

router.use(authenticateToken);

// GET /api/notifications - Get user notifications
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const notifications = await NotificationModel.findByUserId(req.user.userId, limit);
        const unreadCount = await NotificationModel.getUnreadCount(req.user.userId);

        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// PATCH /api/notifications/:id/read - Mark as read
router.patch('/:id/read', [param('id').isInt()], async (req, res) => {
    try {
        const notification = await NotificationModel.markAsRead(req.params.id, req.user.userId);

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ message: 'Marked as read', notification });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

// POST /api/notifications/read-all - Mark all as read
router.post('/read-all', async (req, res) => {
    try {
        await NotificationModel.markAllAsRead(req.user.userId);
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ error: 'Failed to update notifications' });
    }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', [param('id').isInt()], async (req, res) => {
    try {
        const notification = await NotificationModel.delete(req.params.id, req.user.userId);

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

export default router;
