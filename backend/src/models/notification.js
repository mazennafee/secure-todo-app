// backend/src/models/notification.js
import pool from '../db/index.js';

export const NotificationModel = {
    // Create notification
    async create(userId, type, title, message = '', referenceId = null, referenceType = null) {
        const result = await pool.query(
            'INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, type, title, message, referenceId, referenceType]
        );
        return result.rows[0];
    },

    // Get user notifications (unread first)
    async findByUserId(userId, limit = 50) {
        const result = await pool.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY read ASC, created_at DESC LIMIT $2',
            [userId, limit]
        );
        return result.rows;
    },

    // Mark as read
    async markAsRead(notificationId, userId) {
        const result = await pool.query(
            'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2 RETURNING *',
            [notificationId, userId]
        );
        return result.rows[0] || null;
    },

    // Mark all as read
    async markAllAsRead(userId) {
        await pool.query(
            'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false',
            [userId]
        );
    },

    // Delete notification
    async delete(notificationId, userId) {
        const result = await pool.query(
            'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
            [notificationId, userId]
        );
        return result.rows[0] || null;
    },

    // Get unread count
    async getUnreadCount(userId) {
        const result = await pool.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false',
            [userId]
        );
        return parseInt(result.rows[0].count);
    }
};
