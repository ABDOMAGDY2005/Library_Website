// ==========================================
// 0. API CONFIG
// ==========================================
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

// Fetch Books
async function getAllBooks() {
    const res = await fetch(`${API_BASE}/books/`, {
        method: "GET",
        headers: authHeaders()
    });
    return res.json();
}

// ==========================================
// 1. Books Data (From API)
// ==========================================
let books = [];
let filteredBooks = [];

// ==========================================
// 2. Render Books
// ==========================================
function renderBooks() {
    const grid = document.getElementById("booksGrid");
    grid.innerHTML = "";

    filteredBooks.forEach((book) => {
        const isAvailable = book.Available_Copies > 0;

        grid.innerHTML += `
          <div class="book-card">
            
            <div class="book-image">
              <i class="fas fa-book"></i>
            </div>

            <div class="book-content">
              <h3>${book.Book_Name}</h3>
              <p><strong>Author:</strong> ${book.Author_Name}</p>
              <span class="badge">${book.Category_Name}</span>
              <p class="copies ${isAvailable ? "available" : "unavailable"}">
                ${isAvailable ? `${book.Available_Copies} copies available` : "Out of stock"}
              </p>

              <button class="book-btn ${isAvailable ? "borrow" : "reserve"}"
                onclick="${isAvailable 
                    ? `borrowBook(${book.ID})` 
                    : `reserveBook(${book.ID})`}">
                ${isAvailable ? "Borrow" : "Reserve"}
              </button>
            </div>

          </div>
        `;
    });

    document.getElementById("countBooks").textContent = filteredBooks.length;
}

// ==========================================
// 3. Populate Filters
// ==========================================
function populateFilters() {
    const categoryFilter = document.getElementById("categoryFilter");
    const authorFilter = document.getElementById("authorFilter");

    let categories = [...new Set(books.map(b => b.Category_Name))];
    categories.forEach((c) => {
        categoryFilter.innerHTML += `<option value="${c}">${c}</option>`;
    });

    let authors = [...new Set(books.map(b => b.Author_Name))];
    authors.forEach((a) => {
        authorFilter.innerHTML += `<option value="${a}">${a}</option>`;
    });
}

// ==========================================
// 4. Apply Filters + Search
// ==========================================
function applyFilters() {
    const searchVal = document.getElementById("searchInput").value.toLowerCase();
    const categoryVal = document.getElementById("categoryFilter").value;
    const authorVal = document.getElementById("authorFilter").value;

    filteredBooks = books.filter((book) => {
        return (
            book.Book_Name.toLowerCase().includes(searchVal) &&
            (categoryVal === "" || book.Category_Name === categoryVal) &&
            (authorVal === "" || book.Author_Name === authorVal)
        );
    });

    renderBooks();
}

// ==========================================
// 5. Reset Filters
// ==========================================
function resetFilters() {
    document.getElementById("searchInput").value = "";
    document.getElementById("categoryFilter").value = "";
    document.getElementById("authorFilter").value = "";

    filteredBooks = [...books];
    renderBooks();
}

async function borrowBook(id) {
    try {
        // Call the backend API to borrow the book
        const result = await fetch(`${API_BASE}/books/borrow`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ bookId: id })
        });

        const data = await result.json();

        if (result.ok) {
            // Successfully borrowed
            alert(data.message || "Book borrowed successfully!");
            
            // Update local state if needed
            let book = books.find(b => b.ID === id);
            if (book) {
                // Note: The actual Available_Copies should be fetched from the server
                // For now, we'll decrement it locally as a temporary update
                if (book.Available_Copies > 0) {
                    book.Available_Copies--;
                }
                
                // Update filteredBooks version
                let fb = filteredBooks.find(b => b.ID === id);
                if (fb) fb.Available_Copies = book.Available_Copies;

                // If copies reached 0 → show reserve option
                if (book.Available_Copies === 0) {
                    console.log("Book is now out of stock! Consider adding reservation functionality.");
                }

                // Re-render UI
                renderBooks();
            }
        } else {
            // Error from backend
            alert(data.error || "Failed to borrow book");
        }
    } catch (error) {
        console.error("Error borrowing book:", error);
        alert("An error occurred while borrowing the book");
    }
}

async function reserveBook(id) {
    try {
        // Check if book is available locally (optional check)
        const book = books.find(b => b.ID === id);
        if (book && book.Available_Copies > 0) {
            const shouldReserve = confirm(
                "This book is currently available. Do you want to reserve it anyway?\n" +
                "Note: You cannot reserve a book that has available copies."
            );
            
            if (!shouldReserve) {
                return;
            }
        }

        // Call the backend API to reserve the book
        const result = await fetch(`${API_BASE}/books/reserve`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ bookId: id })
        });

        const data = await result.json();

        if (result.ok) {
            // Successfully reserved
            alert(data.message || "Book reserved successfully!");
            
            // Optional: Update UI to show reservation status
            // You might want to add visual feedback that this book is reserved
            console.log(`Book ${id} reserved successfully`);
            
            // If you want to refresh the book list to show updated status
            // await fetchBooks();
            // renderBooks();
        } else {
            // Error from backend
            alert(data.error || "Failed to reserve book");
        }
    } catch (error) {
        console.error("Error reserving book:", error);
        alert("An error occurred while reserving the book");
    }
}

// ==========================================
// 7. Load Books From API on Page Load
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const data = await getAllBooks();
        books = data;
        filteredBooks = [...books];

        populateFilters();
        renderBooks();
    } catch (err) {
        console.error("Error loading books:", err);
    }

    document.getElementById("searchInput").addEventListener("input", applyFilters);
    document.getElementById("categoryFilter").addEventListener("change", applyFilters);
    document.getElementById("authorFilter").addEventListener("change", applyFilters);
});
