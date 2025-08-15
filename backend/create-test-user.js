const bcrypt = require('bcryptjs');
const { run, queryOne } = require('./config/database');

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await queryOne('SELECT * FROM users WHERE email = ?', ['test@example.com']);
    
    if (existingUser.rows.length > 0) {
      console.log('Test user already exists!');
      console.log('Email: test@example.com');
      console.log('Password: test123');
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('test123', saltRounds);

    // Create test user
    await run(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      ['Test User', 'test@example.com', passwordHash]
    );

    console.log('Test user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: test123');
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser();
