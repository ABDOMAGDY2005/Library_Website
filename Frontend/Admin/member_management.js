const API_BASE = "http://localhost:3000/api";

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

// Get statistics
async function getStatistics() {
    try {
        const res = await fetch(`${API_BASE}/stats/`, {
            method: "GET",
            headers: authHeaders()
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        return await res.json();
    } catch (error) {
        console.error('Error fetching statistics:', error);
        return { statistics: {} };
    }
}

// Get all users
async function getAllUsers() {
    try {
        const res = await fetch(`${API_BASE}/users`, {
            method: "GET",
            headers: authHeaders()
        });
        
        if (!res.ok) {
            throw new Error(`Failed to fetch users: ${res.status}`);
        }
        
        return await res.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

// Render users table
function renderUsersTable(users) {
    const tableBody = document.getElementById('membersTableBody');
    
    if (!tableBody) {
        console.error('Table body element not found');
        return;
    }
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 3rem;" class="empty-state">
                    <i class="fas fa-users-slash"></i>
                    <div>No members found</div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Add rows for each user
    users.forEach(user => {
        const row = document.createElement('tr');
        
        // Format birth date if it exists
        const birthDate = user.Birth_Date 
            ? new Date(user.Birth_Date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
            : 'Not specified';
        
        // Determine member type
        const isAdmin = user.is_Admin === 1;
        const memberType = isAdmin ? 'admin' : 'normal-member';
        const memberTypeLabel = isAdmin ? 'Admin' : 'Normal Member';
        
        row.innerHTML = `
            <td>
                <div class="member-info">
                    <div class="member-name">${user.Name || 'Unknown'}</div>
                </div>
            </td>
            <td>${user.ID || 'N/A'}</td>
            <td>${user.Email || 'No email'}</td>
            <td>
                <span class="member-type-badge ${memberType}">
                    ${memberTypeLabel}
                </span>
            </td>
            <td>${birthDate}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Update statistics display
function updateStatistics(stats) {
    const updateElement = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.innerText = value;
        }
    };
    
    if (stats && stats.statistics) {
        const { adminCount, userCount } = stats.statistics;
        const normalMembers = (userCount || 0) - (adminCount || 0);
        
        updateElement('totalMembers', userCount || 0);
        updateElement('normalMembers', normalMembers > 0 ? normalMembers : 0);
        updateElement('adminMembers', adminCount || 0);
    }
}

// Load all data
async function loadData() {
    try {
        // Show loading state
        const tableBody = document.getElementById('membersTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem;">
                        <div class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i> Loading members...
                        </div>
                    </td>
                </tr>
            `;
        }
        
        // Load statistics and users in parallel
        const [stats, users] = await Promise.all([
            getStatistics(),
            getAllUsers()
        ]);
        
        // Update statistics
        updateStatistics(stats);
        
        // Render users table
        renderUsersTable(users);
        
    } catch (error) {
        console.error('Error loading data:', error);
        
        // Show error message
        const tableBody = document.getElementById('membersTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 3rem; color: var(--danger);">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div>Error loading members. Please try again.</div>
                    </td>
                </tr>
            `;
        }
        
        // Set default values for statistics
        updateElement('totalMembers', 'Error');
        updateElement('normalMembers', 'Error');
        updateElement('adminMembers', 'Error');
    }
}

// Helper to safely update DOM elements
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.innerText = value;
    }
}

// Initialize when page loads
window.addEventListener("load", loadData);