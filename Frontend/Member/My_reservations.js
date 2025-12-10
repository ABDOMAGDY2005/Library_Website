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

// API URLs
const API_RESERVED_URL = `http://localhost:3000/api/books/reserved`;
const API_BORROW_URL = `http://localhost:3000/api/books/borrow`;
const API_CANCEL_RESERVE_URL = `http://localhost:3000/api/books/cancelReserve`;

document.addEventListener('DOMContentLoaded', () => {
    const userEmail = localStorage.getItem('userEmail');
    const userPassword = localStorage.getItem('userPassword');
    
    if (!userEmail || !userPassword) {
        alert("Please login first");
        window.location.href = "../Home/login.html";
        return;
    }
    
    fetchMyReservedBooks();
});

async function fetchMyReservedBooks() {
    const grid = document.getElementById('reservationsGrid');
    const alertMessage = document.getElementById('alertMessage');

    try {
        grid.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading your reservations...</p>
            </div>
        `;

        const response = await fetch(API_RESERVED_URL, {
            method: 'GET',
            headers: authHeaders()
        });

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("Server returned non-JSON:", text.substring(0, 200));
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Failed to fetch data: ${response.status}`);
        }

        const reservations = await response.json();
        displayReservations(reservations);

    } catch (error) {
        console.error('Error:', error);
        grid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading data: ${error.message}</p>
                <button onclick="fetchMyReservedBooks()">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
}

function displayReservations(reservations) {
    const grid = document.getElementById('reservationsGrid');
    const alertMessage = document.getElementById('alertMessage');
    
    grid.innerHTML = '';

    if (!reservations || reservations.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>You have no reservations yet.</p>
                <a href="books.html" class="btn-view">Browse Books</a>
            </div>
        `;
        return;
    }

    // Show ALL reservations including cancelled ones
    reservations.forEach(res => {
        const card = createReservationCard(res);
        grid.appendChild(card);
    });
}

function createReservationCard(res) {
    const card = document.createElement('div');
    card.className = 'book-card';

    let badgeClass = '';
    let badgeText = '';
    
    switch(res.status) {
        case 'Waiting for a copy of the book':
            badgeClass = 'pending';
            badgeText = 'Pending';
            break;
        case 'Waiting for user to borrow':
            badgeClass = 'approved';
            badgeText = 'Ready for Pickup';
            break;
        case 'Finished':
            badgeClass = 'completed';
            badgeText = 'Completed';
            break;
        case 'Cancelled before a copy was available':
            badgeClass = 'cancelled';
            badgeText = 'Cancelled';
            break;
        default:
            badgeClass = 'pending';
            badgeText = res.status || 'Pending';
    }

    card.innerHTML = `
        <div class="book-badge ${badgeClass}">${badgeText}</div>
        <div class="book-image"><i class="fas fa-bookmark"></i></div>
        <div class="book-content">
            <h3 class="book-title">${res.book_name || 'Unknown Title'}</h3>
            <p class="book-author">Book ID: ${res.Book_ID}</p>
            
            <div class="res-info">
                <div class="res-row">
                    <span>Reserved:</span>
                    <span class="res-val">${formatDate(res.reservation_date)}</span>
                </div>
                ${res.book_availble_date ? `
                    <div class="res-row">
                        <span>Available Since:</span>
                        <span class="res-val">${formatDate(res.book_availble_date)}</span>
                    </div>
                ` : ''}
                <div class="res-row">
                    <span>Reservation ID:</span>
                    <span class="res-val">#${res.reservation_id}</span>
                </div>
            </div>

            ${res.status === 'Waiting for user to borrow' ? `
                <button onclick="borrowReservedBook(${res.reservation_id}, ${res.Book_ID})" class="btn-view" style="background: var(--success);">
                    <i class="fas fa-book"></i> Borrow Book Now
                </button>
            ` : ''}

            ${res.status === 'Waiting for a copy of the book' ? `
                <button onclick="cancelReservation(${res.reservation_id})" class="btn-view" style="background: var(--danger);">
                    <i class="fas fa-times"></i> Cancel Reservation
                </button>
            ` : ''}
        </div>
    `;

    return card;
}

async function borrowReservedBook(reservationId, bookId) {
    if (confirm('Are you sure you want to borrow this book now?')) {
        try {
            const response = await fetch(API_BORROW_URL, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ bookId: bookId })
            });

            // Check if response is JSON
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                if (response.ok) {
                    showAlert('Book borrowed successfully!', 'success');
                    fetchMyReservedBooks();
                    return;
                }
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            if (response.ok) {
                const result = await response.json();
                showAlert(result.message || 'Book borrowed successfully!', 'success');
                fetchMyReservedBooks();
            } else {
                const error = await response.json();
                throw new Error(error.error || `HTTP ${response.status}`);
            }
            
        } catch (error) {
            console.error('Borrow error:', error);
            showAlert('Error borrowing book: ' + error.message, 'error');
        }
    }
}

async function cancelReservation(reservationId) {
    if (confirm('Are you sure you want to cancel this reservation?')) {
        try {
            const response = await fetch(API_CANCEL_RESERVE_URL, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({
                    id: reservationId
                })
            });

            if (response.ok) {
                // Show simple alert (the built-in confirm/alert works reliably)
                alert('Reservation cancelled successfully!');
                
                // Immediately refresh the data
                fetchMyReservedBooks();
                
            } else {
                // Handle non-successful responses
                let errorMsg = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                } catch (e) {
                    // If not a JSON response
                    const text = await response.text();
                    errorMsg = text || errorMsg;
                }
                alert('Error: ' + errorMsg);
            }
            
        } catch (error) {
            console.error('Cancel error:', error);
            alert('Error: ' + error.message);
        }
    }
}

function formatDate(dateString) {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
    });
}

function showAlert(message, type) {
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.textContent = message;
    alertMessage.className = `alert-box alert-${type}`;
    alertMessage.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertMessage.style.display = 'none';
    }, 5000);
}