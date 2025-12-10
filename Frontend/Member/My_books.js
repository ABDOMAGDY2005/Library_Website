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
const API_BORROWED_URL = `http://localhost:3000/api/books/borrowed`;
const API_RETURN_URL = `http://localhost:3000/api/books/return`;

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const userEmail = localStorage.getItem('userEmail');
    const userPassword = localStorage.getItem('userPassword');
    
    if (!userEmail || !userPassword) {
        alert("Please login first");
        window.location.href = "../Home/login.html";
        return;
    }
    
    // Call the real API
    fetchMyBorrowedBooks();
});

// Fetch borrowed books from real API
async function fetchMyBorrowedBooks() {
    const grid = document.getElementById('loansGrid');
    const alertContainer = document.getElementById('fineAlertContainer');

    try {
        grid.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading your books...</p>
            </div>
        `;

        const response = await fetch(API_BORROWED_URL, {
            method: 'GET',
            headers: authHeaders()
        });

        if (response.status === 401 || response.status === 403) {
            alert("Session expired. Please login again.");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userPassword");
            localStorage.removeItem("is_admin");
            window.location.href = "../Home/login.html";
            return;
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        
        const books = await response.json();
        displayBooks(books);

    } catch (error) {
        console.error('Error fetching books:', error);
        grid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading data: ${error.message}</p>
                <p style="font-size:0.9rem; margin-top:1rem;">Please check:</p>
                <ul>
                    <li>Server is running on port 3000</li>
                    <li>API endpoint is correct</li>
                    <li>You are logged in</li>
                </ul>
                <button onclick="fetchMyBorrowedBooks()">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
}

function displayBooks(books) {
    const grid = document.getElementById('loansGrid');
    const alertContainer = document.getElementById('fineAlertContainer');

    grid.innerHTML = '';

    if (!books || books.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <p>You have no active borrows.</p>
                <a href="books.html" class="btn-view">Browse Books</a>
            </div>
        `;
        return;
    }

    let totalFine = 0;

    books.forEach(book => {
        const fine = parseFloat(book.Fine) || 0;
        
        // Check if book is overdue (Not Returned and expected_return_date has passed)
        const today = new Date();
        const dueDate = new Date(book.expected_return_date);
        const isOverdue = book.status === 'Not Returned' && dueDate < today;
        
        if (isOverdue) {
            totalFine += fine;
        }

        const card = createBookCard(book, fine, isOverdue);
        grid.appendChild(card);
    });

    if (totalFine > 0) {
        alertContainer.innerHTML = `
            <div class="alert-box">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>Action Required:</strong> You have overdue books. 
                    Total Fine: <strong>$${totalFine.toFixed(2)}</strong>
                </div>
            </div>
        `;
    } else {
        alertContainer.innerHTML = '';
    }
}

function createBookCard(book, fine, isOverdue) {
    const badgeClass = isOverdue ? 'overdue' : 'borrowed';
    let badgeText = isOverdue ? 'Overdue' : 'Active borrow';
    if (book.status === 'Returned'){
        badgeText = 'Completed';
    }

    const card = document.createElement('div');
    card.className = 'book-card';

    card.innerHTML = `
        <div class="book-badge ${badgeClass}">${badgeText}</div>
        <div class="book-image"><i class="fas fa-book"></i></div>
        <div class="book-content">
            <h3 class="book-title">${book.book_name || 'Unknown Title'}</h3>
            
            <div class="loan-info">
                <div class="loan-date-row">
                    <span>Borrowed:</span>
                    <span class="val">${formatDate(book.borrow_date)}</span>
                </div>
                <div class="loan-date-row">
                    <span>Due Date:</span>
                    <span class="val" style="color: ${isOverdue ? 'var(--danger)' : 'var(--dark)'}">
                        ${formatDate(book.expected_return_date)}
                    </span>
                </div>
                <div class="loan-date-row">
                    <span>Status:</span>
                    <span class="val">${book.status || 'Unknown'}</span>
                </div>
            </div>

            ${(isOverdue && fine > 0) ? `
                <div class="fine-badge">
                    <i class="fas fa-coins"></i> 
                    Fine: $${fine.toFixed(2)}
                </div>
            ` : ''}

            ${book.status === 'Not Returned' ? `
                <button onclick="returnBook(${book.Book_ID})" class="btn-view">
                    <i class="fas fa-undo"></i> Return Book
                </button>
            ` : ''}
        </div>
    `;

    return card;
}

// Function to return a book
async function returnBook(bookId) {
    if (confirm('Are you sure you want to return this book?')) {
        try {
            const response = await fetch(API_RETURN_URL, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ bookId })
            });

            if (response.status === 401 || response.status === 403) {
                alert("Session expired. Please login again.");
                localStorage.removeItem("userEmail");
                localStorage.removeItem("userPassword");
                localStorage.removeItem("is_admin");
                window.location.href = "../Home/login.html";
                return;
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to return book');
            }

            const result = await response.json();
            alert(result.message || 'Book returned successfully!');
            
            // Refresh the book list
            fetchMyBorrowedBooks();
            
        } catch (error) {
            console.error('Return error:', error);
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