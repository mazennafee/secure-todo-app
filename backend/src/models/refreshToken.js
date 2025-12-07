// backend/src/models/refreshToken.js
import pool from '../db/index.js';
import crypto from 'crypto';

export const RefreshTokenModel = {
    // Generate a secure random token
    generateToken() {
        return crypto.randomBytes(40).toString('hex');
    },

    // Store refresh token in database
    async create(userId, token, expiresAt) {
        const result = await pool.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING id, token, expires_at',
            [userId, token, expiresAt]
        );
        return result.rows[0];
    },

    // Find valid refresh token
    async findValidToken(token) {
        const result = await pool.query(
            'SELECT id, user_id, token, expires_at, revoked FROM refresh_tokens WHERE token = $1 AND expires_at > NOW() AND revoked = false',
            [token]
        );
        return result.rows[0] || null;
    },

    // Revoke a specific token
    async revoke(token) {
        const result = await pool.query(
            'UPDATE refresh_tokens SET revoked = true WHERE token = $1 RETURNING id',
            [token]
        );
        return result.rows[0] || null;
    },

    // Revoke all tokens for a user
    async revokeAllForUser(userId) {
        await pool.query(
            'UPDATE refresh_tokens SET revoked = true WHERE user_id = $1 AND revoked = false',
            [userId]
        );
    },

    // Delete expired tokens (cleanup)
    async deleteExpired() {
        await pool.query(
            'DELETE FROM refresh_tokens WHERE expires_at < NOW()'
        );
    },

    // Rotate token (revoke old, create new)
    async rotate(oldToken, userId) {
        // Revoke old token
        await this.revoke(oldToken);

        // Create new token
        const newToken = this.generateToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        return await this.create(userId, newToken, expiresAt);
    }
};
