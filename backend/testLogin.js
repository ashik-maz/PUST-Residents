async function testLogin() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: '240115',
        password: 'student'
      })
    });
    const data = await res.json();
    console.log(res.status, data);
  } catch (err) {
    console.error(err);
  }
}
testLogin();