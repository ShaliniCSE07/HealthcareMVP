import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('http://localhost:4000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Test Patient",
        email: "test_patient_" + Date.now() + "@example.com",
        password: "password123",
        role: "PATIENT"
      })
    });
    const data = await res.json();
    console.log('Registration Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
