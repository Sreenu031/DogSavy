document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const welcomeNgo = document.getElementById('welcomeNgo');
  const logoutBtnNgo = document.getElementById('logoutBtnNgo');
  const incomingBody = document.getElementById('incomingBody');
  const ongoingBody = document.getElementById('ongoingBody');
  const incomingCards = document.getElementById('incomingCards');
  const ongoingCards = document.getElementById('ongoingCards');
  const totalRescued = document.getElementById('totalRescued');
  const ongoingCount = document.getElementById('ongoingCount');
  const pendingCount = document.getElementById('pendingCount');
  const successRate = document.getElementById('successRate');
  const summaryStats = document.getElementById('summaryStats');
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  // Redirect to login if not authenticated or not an NGO
  if (!token || role !== 'ngo') {
    window.location.href = '../pages/login.html';
    return;
  }

  // Mobile menu toggle
  hamburger?.addEventListener('click', () => {
    navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
  });

  // Decode JWT to get user info
  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }

  const payload = parseJwt(token);
  // Display NGO name from the JWT payload if available
  const ngoName = payload?.organizationName || 'NGO';
  welcomeNgo.textContent = `Welcome, ${ngoName}!`;

  // Logout functionality
  logoutBtnNgo.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '../pages/login.html';
  });

  // Show loading state
  function showLoading(element, message = 'Loading...') {
    element.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #666;">
        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
        <p>${message}</p>
      </div>
    `;
  }

  // Show error state
  function showError(element, message = 'Something went wrong') {
    element.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #e53e3e;">
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
        <p>${message}</p>
      </div>
    `;
  }

  // Get status color scheme from CSS
  function getStatusColor(status) {
    const statusClass = {
      'pending': 'status-pending',
      'assigned': 'status-assigned',
      'in-progress': 'status-in-progress',
      'completed': 'status-completed'
    };
    return statusClass[status.toLowerCase()] || '';
  }

  // Fetch incoming rescue requests and display them
  function loadIncoming() {
    showLoading(incomingBody, 'Loading incoming requests...');
    showLoading(incomingCards, 'Loading incoming requests...');

    fetch('http://localhost:5000/api/ngo/nearby-reports', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '../pages/login.html';
        return Promise.reject('Unauthorized');
      }
      return res.json();
    })
    .then(data => {
      displayIncomingReports(data);
    })
    .catch(err => {
      if (err !== 'Unauthorized') {
        showError(incomingBody, 'Failed to load incoming reports.');
        showError(incomingCards, 'Failed to load incoming reports.');
      }
    });
  }

  // Display incoming reports in both table and card format
  function displayIncomingReports(reports) {
    incomingBody.innerHTML = '';
    incomingCards.innerHTML = '';
    if (!reports.length) {
      const message = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: #666;">
            No new rescue requests nearby.
          </td>
        </tr>
      `;
      incomingBody.innerHTML = message;
      incomingCards.innerHTML = `
        <div class="card-message">
          <p>No new rescue requests nearby.</p>
        </div>
      `;
      return;
    }

    reports.forEach(report => {
      // Table view
      const tr = document.createElement('tr');
      const lat = report.location.latitude;
      const lng = report.location.longitude;
      const mapsUrl = `http://google.com/maps?q=${lat},${lng}`;
      const statusClass = getStatusColor(report.status);

      tr.innerHTML = `
        <td><img class="dog-img" src="${report.imageUrl}" alt="Dog" loading="lazy"></td>
        <td>
          ${lat.toFixed(5)}, ${lng.toFixed(5)}<br>
          <a href="${mapsUrl}" target="_blank" class="btn btn-directions">
            <i class="fas fa-directions"></i> Get Directions
          </a>
        </td>
        <td>${new Date(report.createdAt).toLocaleString()}</td>
        <td><span class="${statusClass}">${report.status}</span></td>
        <td>
          <button class="accept-btn" data-id="${report._id}">Accept</button>
          <button class="reject-btn" disabled>Reject</button>
        </td>
      `;
      incomingBody.appendChild(tr);

      // Card view
      const card = document.createElement('div');
      card.className = 'request-card';
      card.innerHTML = `
        <div class="card-header">
          <div class="card-image">
            <img src="${report.imageUrl}" alt="Reported Dog" loading="lazy">
          </div>
          <div class="card-info">
            <h3>Report id:${report._id.slice(-6).toUpperCase()}</h3>
            <span class="${statusClass}">${report.status}</span>
          </div>
        </div>
        <div class="card-details">
          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${new Date(report.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Location:</span>
            <span class="detail-value">${lat.toFixed(4)}, ${lng.toFixed(4)}</span>
          </div>
        </div>
        <div class="card-actions">
          <a href="${mapsUrl}" target="_blank" class="btn btn-directions">
            <i class="fas fa-directions"></i> Directions
          </a>
          <button class="btn accept-btn" data-id="${report._id}">
            <i class="fas fa-check"></i> Accept
          </button>
        </div>
      `;
      incomingCards.appendChild(card);
    });

    // Attach event listeners for the 'Accept' buttons
    document.querySelectorAll('#incomingBody .accept-btn, #incomingCards .accept-btn').forEach(btn => {
      btn.onclick = () => acceptReport(btn.dataset.id);
    });
  }

  // Handle accepting a rescue report
  function acceptReport(reportId) {
    fetch(`http://localhost:5000/api/ngo/accept/${reportId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      showNotification(data.message || 'Rescue accepted!');
      loadIncoming();
      loadOngoing();
      loadSummary();
    })
    .catch(() => {
      showNotification('Failed to accept rescue.', 'error');
    });
  }

  // Fetch and display ongoing rescues
  function loadOngoing() {
    showLoading(ongoingBody, 'Loading ongoing rescues...');
    showLoading(ongoingCards, 'Loading ongoing rescues...');

    fetch('http://localhost:5000/api/ngo/ongoing-rescues', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      displayOngoingReports(data);
    })
    .catch(() => {
      showError(ongoingBody, 'Failed to load ongoing rescues.');
      showError(ongoingCards, 'Failed to load ongoing rescues.');
    });
  }

  // Display ongoing reports in both table and card format
  function displayOngoingReports(reports) {
    ongoingBody.innerHTML = '';
    ongoingCards.innerHTML = '';
    if (!reports.length) {
      const message = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: #666;">
            No ongoing rescues.
          </td>
        </tr>
      `;
      ongoingBody.innerHTML = message;
      ongoingCards.innerHTML = `
        <div class="card-message">
          <p>No ongoing rescues.</p>
        </div>
      `;
      return;
    }

    reports.forEach(report => {
      // Table view
      const tr = document.createElement('tr');
      const statusClass = getStatusColor(report.status);

      tr.innerHTML = `
        <td><img class="dog-img" src="${report.imageUrl}" alt="Dog" loading="lazy"></td>
        <td>${report.location.latitude.toFixed(5)}, ${report.location.longitude.toFixed(5)}</td>
        <td>${new Date(report.createdAt).toLocaleString()}</td>
        <td><span class="${statusClass}">${report.status}</span></td>
        <td>
          <button class="rescue-btn" data-id="${report._id}">Mark Rescued</button>
        </td>
      `;
      ongoingBody.appendChild(tr);

      // Card view
      const card = document.createElement('div');
      card.className = 'rescue-card';
      card.innerHTML = `
        <div class="card-header">
          <div class="card-image">
            <img src="${report.imageUrl}" alt="Reported Dog" loading="lazy">
          </div>
          <div class="card-info">
            <h3>Rescue #${report._id.slice(-6).toUpperCase()}</h3>
            <span class="${statusClass}">${report.status}</span>
          </div>
        </div>
        <div class="card-details">
          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${new Date(report.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Location:</span>
            <span class="detail-value">${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}</span>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn rescue-btn" data-id="${report._id}">
            <i class="fas fa-check-double"></i> Mark Rescued
          </button>
        </div>
      `;
      ongoingCards.appendChild(card);
    });
    
    // Attach event listeners for the 'Mark Rescued' buttons
    document.querySelectorAll('#ongoingBody .rescue-btn, #ongoingCards .rescue-btn').forEach(btn => {
      btn.onclick = () => markRescued(btn.dataset.id);
    });
  }

  // Handle marking a rescue as completed
  function markRescued(reportId) {
    fetch(`http://localhost:5000/api/ngo/rescue/${reportId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      showNotification(data.message || 'Rescue marked as completed!');
      loadOngoing();
      loadSummary();
    })
    .catch(() => {
      showNotification('Failed to mark rescue as completed.', 'error');
    });
  }

  // Load summary statistics for the NGO
  function loadSummary() {
    fetch('http://localhost:5000/api/ngo/summary', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      totalRescued.textContent = data.totalRescued || '0';
      ongoingCount.textContent = data.ongoingRescues || '0';
      pendingCount.textContent = data.pendingRequests || '0';

      const successRateValue = data.totalRescued > 0 ? ((data.totalRescued / (data.totalRescued + data.pendingRequests + data.ongoingRescues)) * 100).toFixed(2) : '0';
      successRate.textContent = `${successRateValue}%`;

      summaryStats.innerHTML = `<strong>Total Rescues Done:</strong> ${data.totalRescued}`;
    })
    .catch(() => {
      summaryStats.innerHTML = `<strong>Total Rescues Done:</strong> Error loading data.`;
    });
  }

  // Show notification function (copied from userDashboard.js)
  function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const colors = {
      success: { bg: '#10b981', icon: 'fas fa-check-circle' },
      error: { bg: '#ef4444', icon: 'fas fa-exclamation-circle' },
      info: { bg: '#3b82f6', icon: 'fas fa-info-circle' },
      warning: { bg: '#f59e0b', icon: 'fas fa-exclamation-triangle' }
    };
    
    const color = colors[type] || colors.info;
    
    notification.style.cssText = `
      position: fixed;
      top: 120px;
      right: 20px;
      background: ${color.bg};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1001;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      max-width: 400px;
      animation: slideInRight 0.3s ease;
      font-family: 'Poppins', sans-serif;
      font-weight: 500;
    `;
    
    notification.innerHTML = `
      <i class="${color.icon}"></i>
      <span>${message}</span>
      <button onclick="this.parentElement.remove()" style="
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: auto;
        padding: 0;
        display: flex;
        align-items: center;
      ">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }

  // Initial load of all sections
  loadIncoming();
  loadOngoing();
  loadSummary();
});