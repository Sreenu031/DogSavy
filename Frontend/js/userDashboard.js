import { API_URL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const welcome = document.getElementById('welcome');
  const logoutBtn = document.getElementById('logoutBtn');
  const dogForm = document.getElementById('dogForm');
  const reportsBody = document.getElementById('reportsBody');
  const reportsCards = document.getElementById('reportsCards');
  const locationInput = document.getElementById('location');
  const dogImageInput = document.getElementById('dogImage');
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  let userName = '';

  // Redirect to login if not authenticated or not user
  if (!token || role !== 'user') {
    window.location.href = '../pages/login.html';
    return;
  }

  // Mobile menu toggle
  hamburger?.addEventListener('click', () => {
    navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
  });

  // File upload preview
  dogImageInput?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    const uploadDesign = document.querySelector('.file-upload-design');
    
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        uploadDesign.innerHTML = `
          <img src="${e.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 8px; object-fit: cover;">
          <span style="margin-top: 10px; display: block;">File selected: ${file.name}</span>
        `;
      };
      reader.readAsDataURL(file);
    }
  });

  // Fetch user info from token (decode JWT)
  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }
  const payload = parseJwt(token);

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

  // Show loading for reports
  showLoading(reportsBody, 'Loading your reports...');
  showLoading(reportsCards, 'Loading your reports...');

  // Fetch user reports and validate token
  fetch(`${API_URL}api/user/my-reports`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => {
    if (res.status === 401 || res.status === 403) {
      // Token invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/pages/login.html';
      return Promise.reject('Unauthorized');
    }
    return res.json();
  })
  .then(data => {
    if (data.length && data[0].reportedBy && data[0].reportedBy.name) {
      userName = data[0].reportedBy.name;
    }
    welcome.textContent = `Welcome, ${userName || 'User'}!`;
    displayReports(data);
  })
  .catch(err => {
    if (err !== 'Unauthorized') {
      welcome.textContent = `Welcome, User!`;
      showError(reportsBody, 'Failed to load reports. Please try refreshing the page.');
      showError(reportsCards, 'Failed to load reports. Please try refreshing the page.');
    }
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '../pages/login.html';
  });

  // Auto-detect location with better UX
  if (navigator.geolocation) {
    locationInput.placeholder = 'Detecting your location...';
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        locationInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        locationInput.dataset.latitude = latitude;
        locationInput.dataset.longitude = longitude;
      },
      error => {
        locationInput.value = '';
        locationInput.placeholder = 'Location detection failed. Please enter manually.';
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  } else {
    locationInput.placeholder = 'Geolocation not supported. Please enter manually.';
  }

  // Handle report form submit with better UX
  dogForm.addEventListener('submit', e => {
    e.preventDefault();
    
    const submitBtn = dogForm.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
    
    const file = document.getElementById('dogImage').files[0];
    const description = document.getElementById('description').value;
    let [latitude, longitude] = locationInput.value.split(',').map(s => parseFloat(s.trim()));
    
    if (!file) {
      showNotification('Please select an image.', 'error');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      return;
    }
    
    if (isNaN(latitude) || isNaN(longitude)) {
      showNotification('Location is required.', 'error');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      fetch(`${API_URL}api/user/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          imageUrl: reader.result,
          description,
          latitude,
          longitude
        })
      })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          window.location.href = '/pages/login.html';
          return Promise.reject('Unauthorized');
        }
        return res.json();
      })
      .then(data => {
        showNotification(data.message || 'Report submitted successfully!', 'success');
        // Refresh reports
        return fetch(`${API_URL}api/user/my-reports`, {
          headers: { Authorization: `Bearer ${token}` }
        });
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
      .then(displayReports)
      .then(() => {
        // Clear form fields
        dogForm.reset();
        // Reset file upload design
        const uploadDesign = document.querySelector('.file-upload-design');
        uploadDesign.innerHTML = `
          <i class="fas fa-cloud-upload-alt"></i>
          <span>Choose file or drag and drop</span>
          <small>PNG, JPG up to 10MB</small>
        `;
        // Re-fill location if needed
        locationInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      })
      .catch(err => {
        if (err !== 'Unauthorized') {
          showNotification('Failed to submit report. Please try again.', 'error');
        }
      })
      .finally(() => {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      });
    };
    reader.readAsDataURL(file);
  });

  // Display reports in both table and card format
  function displayReports(reports) {
    displayTableReports(reports);
    displayCardReports(reports);
  }

  // Display reports in table format (desktop)
  function displayTableReports(reports) {
    reportsBody.innerHTML = '';
    if (!reports.length) {
      reportsBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: #666;">
            <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
            No reports found. Start by reporting a stray dog!
          </td>
        </tr>
      `;
      return;
    }
    
    reports.forEach(report => {
      let ngoInfo = '-';
      if (report.assignedNgo && report.assignedNgo.organizationName && report.assignedNgo.latitude && report.assignedNgo.longitude) {
        const lat = report.assignedNgo.latitude;
        const lng = report.assignedNgo.longitude;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        ngoInfo = `
          <div style="text-align: center;">
            <strong>${report.assignedNgo.organizationName}</strong><br>
            <a href="${mapsUrl}" target="_blank" class="btn btn-directions" style="margin-top: 0.5rem;">
              <i class="fas fa-directions"></i> Get Directions
            </a>
          </div>
        `;
      }

      const statusColor = getStatusColor(report.status);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <img class="dog-img" src="${report.imageUrl}" alt="Reported Dog" loading="lazy">
        </td>
        <td>
          <div style="font-weight: 500;">${new Date(report.createdAt).toLocaleDateString()}</div>
          <div style="font-size: 0.875rem; color: #666;">${new Date(report.createdAt).toLocaleTimeString()}</div>
        </td>
        <td>
          <div style="font-size: 0.875rem;">
            ${report.location.latitude.toFixed(5)}, ${report.location.longitude.toFixed(5)}
          </div>
        </td>
        <td>
          <span style="
            background: ${statusColor.bg}; 
            color: ${statusColor.text}; 
            padding: 0.25rem 0.75rem; 
            border-radius: 20px; 
            font-size: 0.875rem; 
            font-weight: 500;
            display: inline-block;
          ">
            ${report.status}
          </span>
        </td>
        <td>${ngoInfo}</td>
      `;
      reportsBody.appendChild(tr);
    });
  }

  // Display reports in card format (mobile)
  function displayCardReports(reports) {
    reportsCards.innerHTML = '';
    if (!reports.length) {
      reportsCards.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: #666; background: white; border-radius: 15px;">
          <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; color: #ccc;"></i>
          <h3 style="margin-bottom: 1rem;">No Reports Yet</h3>
          <p>Start by reporting a stray dog to help make a difference!</p>
        </div>
      `;
      return;
    }
    
    reports.forEach(report => {
      const statusColor = getStatusColor(report.status);
      const card = document.createElement('div');
      card.className = 'report-card';
      
      let ngoSection = '';
      if (report.assignedNgo && report.assignedNgo.organizationName && report.assignedNgo.latitude && report.assignedNgo.longitude) {
        const lat = report.assignedNgo.latitude;
        const lng = report.assignedNgo.longitude;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        ngoSection = `
          <div class="detail-row">
            <span class="detail-label">NGO Assigned:</span>
            <span class="detail-value">${report.assignedNgo.organizationName}</span>
          </div>
          <div style="text-align: center; margin-top: 1rem;">
            <a href="${mapsUrl}" target="_blank" class="btn btn-directions">
              <i class="fas fa-directions"></i> Get Directions
            </a>
          </div>
        `;
      } else {
        ngoSection = `
          <div class="detail-row">
            <span class="detail-label">NGO Assigned:</span>
            <span class="detail-value">Not assigned yet</span>
          </div>
        `;
      }
      
      card.innerHTML = `
        <div class="card-header">
          <div class="card-image">
            <img src="${report.imageUrl}" alt="Reported Dog" loading="lazy">
          </div>
          <div class="card-info">
            <h3>Report ID:${report._id ? report._id.slice(-6).toUpperCase() : 'N/A'}</h3>
            <span style="
              background: ${statusColor.bg}; 
              color: ${statusColor.text}; 
              padding: 0.25rem 0.75rem; 
              border-radius: 15px; 
              font-size: 0.875rem; 
              font-weight: 500;
            ">
              ${report.status}
            </span>
          </div>
        </div>
        <div class="card-details">
          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${new Date(report.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time:</span>
            <span class="detail-value">${new Date(report.createdAt).toLocaleTimeString()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Location:</span>
            <span class="detail-value">${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}</span>
          </div>
          ${report.description ? `
            <div class="detail-row">
              <span class="detail-label">Notes:</span>
              <span class="detail-value">${report.description}</span>
            </div>
          ` : ''}
          ${ngoSection}
        </div>
      `;
      reportsCards.appendChild(card);
    });
  }

  // Get status color scheme
  function getStatusColor(status) {
    const statusColors = {
      'pending': { bg: '#fef3c7', text: '#d97706' },
      'assigned': { bg: '#dbeafe', text: '#2563eb' },
      'in-progress': { bg: '#e0e7ff', text: '#6366f1' },
      'completed': { bg: '#d1fae5', text: '#059669' },
      'cancelled': { bg: '#fee2e2', text: '#dc2626' }
    };
    return statusColors[status.toLowerCase()] || { bg: '#f3f4f6', text: '#374151' };
  }

  // Show notification function
  function showNotification(message, type = 'info') {
    // Remove existing notifications
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
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }

  // Add CSS animations for notifications
  if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
});