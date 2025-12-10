// dashboard.js - Dashboard specific functionality
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

async function loadDashboardData() {
    try {
        // Load borrowed books using correct endpoint
        const borrowedRes = await fetch(`${API_BASE}/books/borrowed`, {
            method: "GET",
            headers: authHeaders()
        });
        
        if (borrowedRes.ok) {
            const borrowedBooks = await borrowedRes.json();
            
            // Update borrowed count
            document.getElementById('borrowedCount').textContent = borrowedBooks.length;
            
            // Calculate total fines
            let totalFine = 0;
            borrowedBooks.forEach(book => {
                totalFine += parseFloat(book.Fine || 0);
            });
            
            // Update fine amount
            document.getElementById('fineAmount').textContent = `$${totalFine.toFixed(2)}`;
        } else {
            console.error("Borrowed API error:", borrowedRes.status);
            document.getElementById('borrowedCount').textContent = '0';
            document.getElementById('fineAmount').textContent = '$0';
        }
        
        // Load reserved books using correct endpoint
        const reservedRes = await fetch(`${API_BASE}/books/reserved`, {
            method: "GET",
            headers: authHeaders()
        });
        
        if (reservedRes.ok) {
            const reservedBooks = await reservedRes.json();
            
            // Count pending reservations
            const pendingReservations = reservedBooks.filter(book => {
                const status = book.status || '';
                return status.includes('Waiting');
            }).length;
            
            // Update reservation count
            document.getElementById('reservationCount').textContent = pendingReservations;
        } else {
            console.error("Reserved API error:", reservedRes.status);
            document.getElementById('reservationCount').textContent = '0';
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set defaults on error
        document.getElementById('borrowedCount').textContent = '0';
        document.getElementById('fineAmount').textContent = '$0';
        document.getElementById('reservationCount').textContent = '0';
    }
}

// Update welcome message with username
function updateWelcomeMessage() {
    const userEmail = localStorage.getItem('userEmail') || '';
    const userName = userEmail.split('@')[0] || 'Reader';
    const welcomeTitle = document.getElementById('welcomeTitle');
    if (welcomeTitle) {
        welcomeTitle.textContent = `Welcome back, ${userName}!`;
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if(!isLoggedIn()){
        window.location.href = "../Home/login.html";
    } else {
        updateWelcomeMessage();
        loadDashboardData();
    }
});