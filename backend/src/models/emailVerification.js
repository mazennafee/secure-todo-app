// backend/src/models/emailVerification.js
import pool from '../db/index.js';
import crypto from 'crypto';

export const EmailVerificationModel = {
    // Generate 6-digit verification code
    generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },

    // Store verification code with registration data
    async create(email, code, password, name) {
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Delete any existing codes for this email
        await pool.query('DELETE FROM email_verifications WHERE email = $1', [email]);

        const result = await pool.query(
            'INSERT INTO email_verifications (email, code, password_temp, name_temp, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [email, code, password, name, expiresAt]
        );
        return result.rows[0];
    },

    // Verify code and return user data
    async verify(email, code) {
        const result = await pool.query(
            'SELECT password_temp as password, name_temp as name FROM email_verifications WHERE email = $1 AND code = $2 AND expires_at > NOW() AND verified = false',
            [email, code]
        );

        if (result.rows.length === 0) {
            return null;
        }

        // Mark as verified
        await pool.query(
            'UPDATE email_verifications SET verified = true WHERE email = $1 AND code = $2',
            [email, code]
        );

        return result.rows[0];
    },

    // Clean up expired codes
    async cleanExpired() {
        await pool.query('DELETE FROM email_verifications WHERE expires_at < NOW()');
    }
};
