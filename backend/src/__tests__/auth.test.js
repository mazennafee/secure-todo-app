// backend/src/__tests__/auth.test.js
import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.js';

// Mock database and dependencies
jest.mock('../db/index.js');
jest.mock('../models/refreshToken.js');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth API', () => {
    describe('POST /api/auth/register', () => {
        test('should reject registration with weak password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'weak',
                    name: 'Test User'
                });

            expect(res.status).toBe(400);
        });

        test('should validate email format', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'StrongPass1!',
                    name: 'Test User'
                });

            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        test('should require email and password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({});

            expect(res.status).toBe(400);
        });
    });
});
