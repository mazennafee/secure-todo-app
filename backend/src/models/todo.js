// backend/src/models/todo.js
// Example todo model with utility functions

import pool from '../db/index.js';

export const TodoModel = {
    // Find all todos for a user
    async findByUserId(userId) {
        const result = await pool.query(
            'SELECT id, title, description, completed, created_at, updated_at FROM todos WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        return result.rows;
    },

    // Find todo by ID and user ID
    async findById(id, userId) {
        const result = await pool.query(
            'SELECT id, title, description, completed, created_at, updated_at FROM todos WHERE id = $1 AND user_id = $2',
            [id, userId]
        );
        return result.rows[0] || null;
    },

    // Create new todo
    async create(userId, title, description = '', completed = false) {
        const result = await pool.query(
            'INSERT INTO todos (user_id, title, description, completed) VALUES ($1, $2, $3, $4) RETURNING id, title, description, completed, created_at, updated_at',
            [userId, title, description, completed]
        );
        return result.rows[0];
    },

    // Update todo
    async update(id, userId, updates) {
        const { title, description, completed } = updates;

        const result = await pool.query(
            'UPDATE todos SET title = COALESCE($1, title), description = COALESCE($2, description), completed = COALESCE($3, completed), updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND user_id = $5 RETURNING id, title, description, completed, created_at, updated_at',
            [title, description, completed, id, userId]
        );
        return result.rows[0] || null;
    },

    // Delete todo
    async delete(id, userId) {
        const result = await pool.query(
            'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, userId]
        );
        return result.rows[0] || null;
    }
};
