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

// STATISTICS
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
        console.error('Failed to fetch statistics:', error);
        // Return empty statistics object to prevent page crash
        return { statistics: {} };
    }
}

// Helper to safely update DOM elements
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.innerText = value;
    } else {
        console.warn(`Element with id '${id}' not found`);
    }
}

// Format currency
function formatCurrency(amount) {
    return '$' + (amount || 0).toFixed(2);
}

// Load and display statistics
async function loadDashboard() {
    try {
        // Show loading state
        updateElement('totalMembers', '...');
        updateElement('totalBooks', '...');
        updateElement('activeBorrows', '...');
        updateElement('totalFines', '$...');
        
        const data = await getStatistics();
        
        if (!data.statistics) {
            console.warn('No statistics data found');
            // Set default values
            updateElement('totalMembers', 0);
            updateElement('totalBooks', 0);
            updateElement('activeBorrows', 0);
            updateElement('totalFines', '$0');
            return;
        }

        const {
            userCount,
            bookCount,
            notReturnedCount,
            totalFines
        } = data.statistics;

        // Update DOM with data
        updateElement('totalMembers', userCount || 0);
        updateElement('totalBooks', bookCount || 0);
        updateElement('activeBorrows', notReturnedCount || 0);
        updateElement('totalFines', formatCurrency(totalFines));
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        // Show error state
        updateElement('totalMembers', 'Error');
        updateElement('totalBooks', 'Error');
        updateElement('activeBorrows', 'Error');
        updateElement('totalFines', '$Error');
    }
}

// Initialize when page loads
window.addEventListener("load", loadDashboard);