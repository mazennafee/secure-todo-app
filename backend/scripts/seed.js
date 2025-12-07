// backend/scripts/seed.js
import pool from '../src/db/index.js';
import bcrypt from 'bcrypt';

const seedDatabase = async () => {
    try {
        console.log('🌱 Seeding database...');

        // Create demo user
        const hashedPassword = await bcrypt.hash('Demo123!', 12);

        const userResult = await pool.query(
            `INSERT INTO users (email, password_hash, name) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
            ['demo@example.com', hashedPassword, 'Demo User']
        );

        const userId = userResult.rows[0].id;
        console.log(`✅ Created demo user with ID: ${userId}`);

        // Create sample todos
        const todos = [
            ['Complete project documentation', 'Write comprehensive README and API docs', false],
            ['Review security configurations', 'Check all env vars and secrets', true],
            ['Set up CI/CD pipeline', 'Configure GitHub Actions for automated testing', false],
            ['Conduct security audit', 'Run OWASP ZAP and review findings', false]
        ];

        for (const [title, description, completed] of todos) {
            await pool.query(
                'INSERT INTO todos (user_id, title, description, completed) VALUES ($1, $2, $3, $4)',
                [userId, title, description, completed]
            );
        }

        console.log(`✅ Created ${todos.length} sample todos`);
        console.log('\n🎉 Database seeded successfully!');
        console.log('\nDemo credentials:');
        console.log('Email: demo@example.com');
        console.log('Password: Demo123!');

        await pool.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();
