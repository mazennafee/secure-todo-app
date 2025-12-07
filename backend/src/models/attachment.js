// backend/src/models/attachment.js
import pool from '../db/index.js';
import fs from 'fs/promises';
import path from 'path';

export const AttachmentModel = {
    // Create attachment record
    async create(userId, filename, originalFilename, filepath, mimetype, sizeBytes, todoId = null, commentId = null) {
        const result = await pool.query(
            'INSERT INTO attachments (user_id, filename, original_filename, filepath, mimetype, size_bytes, todo_id, comment_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [userId, filename, originalFilename, filepath, mimetype, sizeBytes, todoId, commentId]
        );
        return result.rows[0];
    },

    // Get attachments for a todo
    async findByTodoId(todoId) {
        const result = await pool.query(
            `SELECT a.*, u.name as uploaded_by_name
             FROM attachments a
             JOIN users u ON a.user_id = u.id
             WHERE a.todo_id = $1
             ORDER BY a.created_at DESC`,
            [todoId]
        );
        return result.rows;
    },

    // Get attachments for a comment
    async findByCommentId(commentId) {
        const result = await pool.query(
            `SELECT a.*, u.name as uploaded_by_name
             FROM attachments a
             JOIN users u ON a.user_id = u.id
             WHERE a.comment_id = $1
             ORDER BY a.created_at DESC`,
            [commentId]
        );
        return result.rows;
    },

    // Get attachment by ID
    async findById(attachmentId) {
        const result = await pool.query(
            'SELECT * FROM attachments WHERE id = $1',
            [attachmentId]
        );
        return result.rows[0] || null;
    },

    // Delete attachment
    async delete(attachmentId) {
        const result = await pool.query(
            'DELETE FROM attachments WHERE id = $1 RETURNING *',
            [attachmentId]
        );

        if (result.rows[0]) {
            // Delete file from filesystem
            try {
                await fs.unlink(result.rows[0].filepath);
            } catch (error) {
                console.error('Error deleting file:', error);
            }
        }

        return result.rows[0] || null;
    }
};
