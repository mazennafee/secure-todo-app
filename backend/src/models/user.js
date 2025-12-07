// backend/src/models/user.js
// Example user model with utility functions
// In a larger app, you might use an ORM like Sequelize or TypeORM

import pool from '../db/index.js';
import bcrypt from 'bcrypt';

export const UserModel = {
    // Find user by email
    async findByEmail(email) {
        const result = await pool.query(
            'SELECT id, email, password_hash, name, created_at FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0] || null;
    },

    // Find user by ID
    async findById(id) {
        const result = await pool.query(
            'SELECT id, email, name, created_at FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    },

    // Create new user
    async create(email, password, name) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await pool.query(
            'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
            [email, hashedPassword, name]
        );
        return result.rows[0];
    },

    // Verify password
    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    },

    // Update user
    async update(id, updates) {
        const { name, email } = updates;
        const result = await pool.query(
            'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, email, name',
            [name, email, id]
        );
        return result.rows[0] || null;
    }
};
