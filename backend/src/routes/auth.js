// backend/src/routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import pool from '../db/index.js';
import { validateEmail, validatePassword } from '../utils/validate.js';
import { RefreshTokenModel } from '../models/refreshToken.js';
import { EmailVerificationModel } from '../models/emailVerification.js';
import { setAuthCookies, clearAuthCookies } from '../utils/cookies.js';

const router = express.Router();

// Strict rate limiter for auth routes (5 attempts per 15 mins)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many login attempts, please try again after 15 minutes.' }
});

// Validation rules
const registerValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().isLength({ min: 1, max: 100 })
];

const loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
];

// POST /api/auth/register - Step 1: Send verification code
router.post('/register', authLimiter, [
    body('email').isEmail().normalizeEmail(),
    body('password').custom(validatePassword).withMessage('Password must be 8+ chars with uppercase, lowercase, number, special char, and no repeated characters'),
    body('name').trim().isLength({ min: 2, max: 100 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, name } = req.body;

        // Check if user already exists
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Generate and store verification code (in production, send via email)
        const code = EmailVerificationModel.generateCode();
        await EmailVerificationModel.create(email, code, password, name); // Store password and name temporarily

        // For development/testing, log the code
        console.log(`📧 Verification code for ${email}: ${code}`);

        res.status(200).json({
            message: 'Verification code sent to email',
            email,
            // In production, remove this line and send via email
            devCode: process.env.NODE_ENV === 'development' ? code : undefined
        });

    } catch (error) {
        console.error('Registration initiation error:', error);
        res.status(500).json({ error: 'Failed to initiate registration' });
    }
});

// POST /api/auth/verify-email - Step 2: Verify email and complete registration
router.post('/verify-email', authLimiter, [
    body('email').isEmail().normalizeEmail(),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, code } = req.body;

        // Verify the code and retrieve temporary user data
        const verificationData = await EmailVerificationModel.verify(email, code);

        if (!verificationData) {
            return res.status(400).json({ error: 'Invalid or expired verification code' });
        }

        const { password, name } = verificationData;

        // Hash password with bcrypt
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user - parameterized query prevents SQL injection
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
            [email, hashedPassword, name]
        );

        const user = result.rows[0];

        // Generate JWT access token with short expiry (include role for RBAC)
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        );

        // Generate and store refresh token
        const refreshToken = RefreshTokenModel.generateToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await RefreshTokenModel.create(user.id, refreshToken, expiresAt);

        // Set tokens in HTTP-only cookies
        setAuthCookies(res, accessToken, refreshToken);

        res.status(201).json({
            message: 'Email verified and registration complete',
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Email verification failed' });
    }
});

// POST /api/auth/login - Login user
router.post('/login', authLimiter, loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Get user from database - parameterized query
        const result = await pool.query(
            'SELECT id, email, password_hash, name FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            // Don't reveal whether user exists
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Verify password with bcrypt - CRITICAL SECURITY CHECK
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Get user role for JWT
        const userRole = user.role || 'user';

        // Generate JWT access token (include role for RBAC)
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, role: userRole },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        );

        // Generate and store refresh token
        const refreshToken = RefreshTokenModel.generateToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await RefreshTokenModel.create(user.id, refreshToken, expiresAt);

        // Set tokens in HTTP-only cookies
        setAuthCookies(res, accessToken, refreshToken);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
            // Tokens are now in HTTP-only cookies, not in response body
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', async (req, res) => {
    try {
        // Get refresh token from cookie instead of body
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        // Verify refresh token from database
        const tokenData = await RefreshTokenModel.findValidToken(refreshToken);

        if (!tokenData) {
            return res.status(401).json({ error: 'Invalid or expired refresh token' });
        }

        // Get user data
        const userResult = await pool.query(
            'SELECT id, email, name FROM users WHERE id = $1',
            [tokenData.user_id]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];

        // Generate new access token
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        );

        // Rotate refresh token (security best practice)
        const newRefreshToken = await RefreshTokenModel.rotate(refreshToken, user.id);

        // Set new tokens in cookies
        setAuthCookies(res, accessToken, newRefreshToken.token);

        res.json({
            message: 'Token refreshed successfully'
            // Tokens are now in HTTP-only cookies, not in response body
        });

    } catch (error) {
        console.error('Refresh error:', error);
        res.status(500).json({ error: 'Token refresh failed' });
    }
});

// POST /api/auth/logout - Revoke refresh token
router.post('/logout', async (req, res) => {
    try {
        // Get refresh token from cookie
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            // Revoke the refresh token
            await RefreshTokenModel.revoke(refreshToken);
        }

        // Clear cookies
        clearAuthCookies(res);

        res.json({ message: 'Logged out successfully' });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

export default router;
