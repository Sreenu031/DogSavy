document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role })
  });

  const data = await res.json();
  if (res.ok) {
     localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);

    alert('Login successful!');
    localStorage.setItem('token', data.token);
    // Redirect to dashboard/report
    window.location.href = role === 'ngo' ? '../pages/ngoDashboard.html' : '../pages/userDashboard.html';
  } else {
    alert(data.error);
  }
});
