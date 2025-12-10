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

// Get all books
async function getAllBooks() {
    try {
        const res = await fetch(`${API_BASE}/books/`, {
            method: "GET",
            headers: authHeaders()
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        return await res.json();
    } catch (error) {
        console.error('Error fetching books:', error);
        return [];
    }
}

// Format books data
function formatBooksData(rawBooks) {
    return rawBooks.map(book => ({
        book_id: book.ID,
        title: book.Book_Name,
        author_name: book.Author_Name,
        category_name: book.Category_Name,
        total_copies: book.Available_Copies,
        available_copies: book.Available_Copies,
    }));
}

// Render books table
function renderBooksTable(books) {
    const tbody = document.getElementById("booksTableBody");
    
    if (!tbody) {
        console.error('Table body element not found');
        return;
    }
    
    // Clear existing rows
    tbody.innerHTML = "";
    
    if (!books || books.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 3rem;" class="empty-state">
                    <i class="fas fa-book"></i>
                    <div>No books found</div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Add rows for each book
    books.forEach((book, index) => {
        const available = book.available_copies || 0;
        const total = book.total_copies || 0;
        
        // Determine availability status
        let availabilityClass = 'available';
        let availabilityText = `${available} Available`;
        
        if (available === 0) {
            availabilityClass = 'out';
            availabilityText = 'Out of Stock';
        } else if (available < 3) {
            availabilityClass = 'low';
            availabilityText = `${available} Left`;
        }
        
        const row = document.createElement('tr');
        row.className = 'fade-in';
        row.style.animationDelay = `${index * 0.05}s`;
        
        row.innerHTML = `
            <td>
                <div class="book-info">
                    <div class="book-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <div>
                        <div class="book-title">${book.title || 'Untitled'}</div>
                        <div class="book-author">ID: ${book.book_id || 'N/A'}</div>
                    </div>
                </div>
            </td>
            <td>${book.author_name || 'Unknown Author'}</td>
            <td>
                <span class="book-badge category-badge">
                    ${book.category_name || 'Uncategorized'}
                </span>
            </td>
            <td>${total}</td>
            <td>
                <span class="book-badge availability-badge ${availabilityClass}">
                    ${availabilityText}
                </span>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Load books data
async function loadBooks() {
    try {
        // Show loading state
        const tbody = document.getElementById("booksTableBody");
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem;">
                        <div class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i> Loading books...
                        </div>
                    </td>
                </tr>
            `;
        }
        
        // Fetch books
        const rawBooks = await getAllBooks();
        const formattedBooks = formatBooksData(rawBooks);
        
        // Render table
        renderBooksTable(formattedBooks);
        
    } catch (error) {
        console.error('Error loading books:', error);
        
        // Show error message
        const tbody = document.getElementById("booksTableBody");
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 3rem; color: var(--danger);">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div>Error loading books. Please try again.</div>
                    </td>
                </tr>
            `;
        }
    }
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function() {
    // Check authentication
    if(!isLoggedIn() || localStorage.getItem('is_admin') != 1){
        window.location.href = "../Home/home.html";
        return;
    }
    
    // Load books
    loadBooks();
});
