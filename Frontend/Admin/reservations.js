// reservations.js - Simplified version without actions

// Base API URL
const API_BASE = "http://localhost:3000/api";

// Global variables
let allReservations = [];
let statistics = {};

// Helper for auth headers
function authHeaders() {
    const userEmail = localStorage.getItem("userEmail") || "";
    const userPassword = localStorage.getItem("userPassword") || "";
    
    return {
        "Content-Type": "application/json",
        "email": userEmail,
        "password": userPassword
    };
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication first
    if (!isLoggedIn()) {
        window.location.href = "../Home/login.html";
        return;
    }
    
    await loadStatistics();
    await loadReservations();
});

// Load statistics
async function loadStatistics() {
    try {
        const res = await fetch(`${API_BASE}/stats/`, {
            method: "GET",
            headers: authHeaders()
        });

        if (!res.ok) {
            throw new Error(`Statistics API Error: ${res.status}`);
        }

        const data = await res.json();
        statistics = data.statistics || {};
        
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Load reservations from API
async function loadReservations() {
    try {
        // Show loading state
        const tbody = document.getElementById('reservationsTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem;">
                        <div class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i> Loading reservations...
                        </div>
                    </td>
                </tr>
            `;
        }
        
        // Call the API endpoint for all reservations
        const res = await fetch(`${API_BASE}/books/reserved/all`, {
            method: "GET",
            headers: authHeaders()
        });

        if (!res.ok) {
            throw new Error(`Reservations API Error: ${res.status}`);
        }

        const data = await res.json();
        
        // Transform the API response
        allReservations = data.map(item => ({
            reservation_id: item.reservation_id,
            user_id: item.User_ID || item.user_id,
            user_name: item.user_name,
            reservation_date: item.reservation_date,
            book_availble_date: item.book_availble_date,
            r_status: mapStatus(item.status),
            book_id: item.Book_ID || item.book_id,
            book_name: item.book_name,
        }));

        // Update stats and render table
        updateStats();
        filterReservations('all');

    } catch (error) {
        console.error('Error loading reservations:', error);
        const tbody = document.getElementById('reservationsTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 3rem; color: var(--danger);">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div>Error loading reservations. Please try again.</div>
                    </td>
                </tr>
            `;
        }
        
        // Set default stats
        updateElement('pendingCount', '0');
        updateElement('approvedCount', '0');
        updateElement('cancelledCount', '0');
    }
}

// Helper function to map backend status to frontend status
function mapStatus(backendStatus) {
    const statusMap = {
        'Waiting for user to borrow': 'pending',
        'Waiting for a copy of the book': 'pending',
        'Finished': 'complete',
        'Cancelled before a copy was available': 'cancelled',
        'pending': 'pending',
        'approved': 'complete',
        'complete': 'complete',
        'cancelled': 'cancelled'
    };
    
    return statusMap[backendStatus] || 'pending';
}

// Update statistics display
function updateStats() {
    const pending = allReservations.filter(r => r.r_status === 'pending').length;
    const complete = allReservations.filter(r => r.r_status === 'complete').length;
    const cancelled = allReservations.filter(r => r.r_status === 'cancelled').length;

    updateElement('pendingCount', pending);
    updateElement('approvedCount', complete);
    updateElement('cancelledCount', cancelled);
}

// Helper to update DOM elements
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Filter reservations by status
function filterReservations(status, event) {
    // Update active tab
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    if (event) {
        event.target.classList.add('active');
    } else {
        // Find the corresponding tab button
        const tabBtn = document.querySelector(`.tab-btn[onclick*="${status}"]`);
        if (tabBtn) {
            tabBtn.classList.add('active');
        }
    }

    // Filter data
    let filtered = [];
    if (status === 'all') {
        filtered = allReservations;
    } else {
        filtered = allReservations.filter(r => r.r_status === status);
    }

    renderTable(filtered);
}

// Render reservations table
function renderTable(data) {
    const tbody = document.getElementById('reservationsTableBody');
    
    if (!tbody) {
        console.error('Table body element not found');
        return;
    }
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 3rem;" class="empty-state">
                    <i class="fas fa-bookmark"></i>
                    <div>No reservations found</div>
                </td>
            </tr>
        `;
        return;
    }

    // Add rows for each reservation
    data.forEach((r, index) => {
        const userName = r.user_name || `User #${r.user_id}`;
        const date = r.reservation_date ? new Date(r.reservation_date).toLocaleDateString() : 'N/A';
        const statusClass = `status-${r.r_status}`;
        const bookTitle = r.book_name || 'Unknown Book';
        const displayStatus = r.r_status.charAt(0).toUpperCase() + r.r_status.slice(1);
        
        const row = document.createElement('tr');
        row.className = 'animate-card';
        row.style.animationDelay = `${index * 0.05}s`;
        
        row.innerHTML = `
            <td><strong>#${r.reservation_id}</strong></td>
            <td>${userName}</td>
            <td>${bookTitle}</td>
            <td>${date}</td>
            <td>
                <span class="status-badge ${statusClass}">
                    ${displayStatus}
                </span>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}