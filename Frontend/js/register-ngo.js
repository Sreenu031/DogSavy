document.getElementById('registerNgoForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const organizationName = document.getElementById('organizationName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const latitude = pos.coords.latitude;
    const longitude = pos.coords.longitude;

    const res = await fetch('http://localhost:5000/api/auth/register/ngo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationName,
        email,
        password,
        phone,
        address,
        latitude,
        longitude
      })
    });

    const data = await res.json();
    alert(data.message || data.error);

    // We check if the response status code was in the 200-299 range.
    // Your backend sends a 201, so res.ok will be true.
    if (res.ok) {
      window.location.href = '../pages/login.html';
    }
  }, () => {
    alert("Location permission required for NGO registration.");
  });
});
