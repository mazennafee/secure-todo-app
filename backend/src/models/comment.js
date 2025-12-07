// backend/src/models/comment.js
import pool from '../db/index.js';

export const CommentModel = {
    // Create comment
    async create(todoId, userId, content) {
        const result = await pool.query(
            'INSERT INTO comments (todo_id, user_id, content) VALUES ($1, $2, $3) RETURNING id, todo_id, user_id, content, created_at, updated_at',
            [todoId, userId, content]
        );
        return result.rows[0];
    },

    // Get comments for a todo
    async findByTodoId(todoId) {
        const result = await pool.query(
            `SELECT c.id, c.todo_id, c.user_id, c.content, c.created_at, c.updated_at,
                    u.name as user_name, u.email as user_email
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.todo_id = $1
             ORDER BY c.created_at ASC`,
            [todoId]
        );
        return result.rows;
    },

    // Update comment
    async update(commentId, userId, content) {
        const result = await pool.query(
            'UPDATE comments SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
            [content, commentId, userId]
        );
        return result.rows[0] || null;
    },

    // Delete comment
    async delete(commentId, userId) {
        const result = await pool.query(
            'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING id',
            [commentId, userId]
        );
        return result.rows[0] || null;
    }
};
