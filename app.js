const API_URL = 'http://localhost:3000/api';

document.getElementById('admissionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const data = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    course: document.getElementById('course').value
  };
  
  try {
    const response = await fetch(`${API_URL}/admissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      showMessage('Application submitted successfully!', 'success');
      e.target.reset();
      loadApplications();
    } else {
      showMessage('Failed to submit application', 'error');
    }
  } catch (error) {
    showMessage('Error connecting to server', 'error');
  }
});

async function loadApplications() {
  try {
    const response = await fetch(`${API_URL}/admissions`);
    const students = await response.json();
    
    const list = document.getElementById('applicationsList');
    list.innerHTML = students.map(s => `
      <div class="application-card">
        <h3>${s.name}</h3>
        <p>Email: ${s.email}</p>
        <p>Course: ${s.course}</p>
        <p>Status: <span class="status-${s.status}">${s.status}</span></p>
        <select onchange="updateStatus(${s.id}, this.value)">
          <option value="pending" ${s.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="approved" ${s.status === 'approved' ? 'selected' : ''}>Approved</option>
          <option value="rejected" ${s.status === 'rejected' ? 'selected' : ''}>Rejected</option>
        </select>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading applications:', error);
  }
}

async function updateStatus(id, status) {
  try {
    await fetch(`${API_URL}/admissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    loadApplications();
  } catch (error) {
    console.error('Error updating status:', error);
  }
}

function showMessage(text, type) {
  const msg = document.getElementById('message');
  msg.textContent = text;
  msg.className = type;
  setTimeout(() => msg.textContent = '', 3000);
}

loadApplications();
