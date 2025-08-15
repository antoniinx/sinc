const bcrypt = require('bcryptjs');
const { run, queryOne } = require('./config/database');

async function createTestUsers() {
  try {
    const users = [
      {
        name: 'Test User 1',
        email: 'test1@example.com',
        password: 'password123'
      },
      {
        name: 'Test User 2', 
        email: 'test2@example.com',
        password: 'password123'
      },
      {
        name: 'Test User 3',
        email: 'test3@example.com', 
        password: 'password123'
      }
    ];

    for (const user of users) {
      // Check if user already exists
      const existingUser = await queryOne('SELECT id FROM users WHERE email = ?', [user.email]);
      
      if (!existingUser.rows.length) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await run('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', 
          [user.name, user.email, hashedPassword]);
        console.log(`✅ Created user: ${user.name} (${user.email})`);
      } else {
        console.log(`⏭️  User already exists: ${user.name} (${user.email})`);
      }
    }

    console.log('\n🎉 Test users ready!');
    console.log('\n📧 Test accounts:');
    users.forEach(user => {
      console.log(`   ${user.email} / ${user.password}`);
    });
    
    console.log('\n🔗 You can now test friend functionality:');
    console.log('   1. Login with test1@example.com');
    console.log('   2. Go to Friends page');
    console.log('   3. Search for test2@example.com or test3@example.com');
    console.log('   4. Send friend requests and test calendar sharing');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  }
}

createTestUsers();
