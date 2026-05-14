import fetch from 'node-fetch';

async function test(email) {
  try {
    const res = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: "password123"
      })
    });
    const data = await res.json();
    console.log('Login Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Test failed:', err);
  }
}

// I'll need to find an email that was registered.
// I'll use the one from my previous test_register.js if I knew it, 
// or I can just register a new one and login immediately.

async function registerAndLogin() {
  const email = "test_login_" + Date.now() + "@example.com";
  console.log('Registering:', email);
  await fetch('http://localhost:4000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "Test User",
      email: email,
      password: "password123",
      role: "PATIENT"
    })
  });
  
  console.log('Logging in...');
  await test(email);
}

registerAndLogin();
