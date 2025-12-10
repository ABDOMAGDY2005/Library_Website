// borrow_management.js - Updated to match reservations structure and use correct API

const API_BASE = "http://localhost:3000/api";
let allLoans = [];
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

// ==========================================
// 1. Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    setupSidebar();
    await loadStatistics();
    await loadLoans();
});

// ==========================================
// 2. Load Statistics
// ==========================================
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
        
        // Update sidebar badge if statistics available
        const borrowsBadge = document.querySelector('a[href="borrow_management.html"] .nav-badge');
        if (borrowsBadge && statistics.notReturnedCount !== undefined) {
            borrowsBadge.textContent = statistics.notReturnedCount > 99 ? '99+' : statistics.notReturnedCount;
        }

    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// ==========================================
// 3. Load Loans Data from API
// ==========================================
async function loadLoans() {
    try {
        // Call the API endpoint for all borrowed books
        const res = await fetch(`${API_BASE}/books/borrowed/all`, {
            method: "GET",
            headers: authHeaders()
        });

        if (!res.ok) {
            throw new Error(`Loans API Error: ${res.status}`);
        }

        const data = await res.json();
        console.log("Loans API Response:", data);
        
        // Transform the API response to match the expected structure
        allLoans = data.map(item => ({
            borrow_id: item.ID,
            user_id: item.User_ID,
            user_name: item.user_name,
            book_id: item.Book_ID,
            book_name: item.book_name,
            borrow_date: item.borrow_date,
            expected_return_date: item.expected_return_date,
            actual_return_date: item.actual_return_date,
            status: mapStatus(item.status),
            fine: item.Fine || 0
        }));

        console.log("Transformed Loans:", allLoans);

        // Update Stats
        updateStats();

        // SHOW ALL LOANS ON PAGE LOAD
        renderTable(allLoans);

    } catch (error) {
        console.error('Error loading loans:', error);
        const tbody = document.getElementById('loansTableBody');
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: red;">Error loading loans: ${error.message}</td></tr>`;
        
        // Initialize stats with zeros
        document.getElementById('activeCount').textContent = '0';
        document.getElementById('overdueCount').textContent = '0';
        document.getElementById('returnedCount').textContent = '0';
    }
}

// Helper function to map backend status to frontend status
function mapStatus(backendStatus) {
    const statusMap = {
        'Not Returned': 'active',
        'Returned': 'returned',
        'active': 'active',
        'returned': 'returned'
    };
    
    return statusMap[backendStatus] || 'active';
}

// ==========================================
// 4. Update UI & Stats
// ==========================================
function updateStats() {
    const active = allLoans.filter(l => l.status === 'active').length;
    const overdue = calculateOverdueCount();
    const returned = allLoans.filter(l => l.status === 'returned').length;

    // Update the stat cards
    document.getElementById('activeCount').textContent = active;
    document.getElementById('overdueCount').textContent = overdue;
    document.getElementById('returnedCount').textContent = returned;
    
    // Update additional statistics from the stats API if available
    updateAdditionalStats();
}

function calculateOverdueCount() {
    const today = new Date();
    return allLoans.filter(loan => {
        if (loan.status !== 'active') return false;
        if (!loan.expected_return_date) return false;
        
        const dueDate = new Date(loan.expected_return_date);
        return dueDate < today;
    }).length;
}

function updateAdditionalStats() {
    // If we have statistics from the stats API, update additional information
    if (statistics) {
        console.log("Available statistics:", statistics);
        
        // Calculate total fines from active loans
        const totalFines = allLoans.reduce((sum, loan) => sum + (loan.fine || 0), 0);
        const finesElement = document.getElementById('totalFines');
        if (finesElement) {
            finesElement.textContent = `$${totalFines.toFixed(2)}`;
        }
    }
}

function filterLoans(status) {
    // If tab buttons exist, update active tab styling
    const tabBtn = event?.target;
    if (tabBtn && tabBtn.classList.contains('tab-btn')) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        tabBtn.classList.add('active');
    }

    // Filter logic
    let filtered = [];
    if (status === 'all') {
        filtered = allLoans;
    } else if (status === 'overdue') {
        filtered = allLoans.filter(loan => {
            if (loan.status !== 'active') return false;
            if (!loan.expected_return_date) return false;
            const dueDate = new Date(loan.expected_return_date);
            return dueDate < new Date();
        });
    } else {
        filtered = allLoans.filter(l => l.status === status);
    }

    renderTable(filtered);
}

function renderTable(data) {
    const tbody = document.getElementById('loansTableBody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">No loans found.</td></tr>';
        return;
    }

    data.forEach(loan => {
        // Prepare Data for Display
        const userName = loan.user_name || `User #${loan.user_id}`;
        const borrowDate = loan.borrow_date ? new Date(loan.borrow_date).toLocaleDateString() : 'N/A';
        const dueDate = loan.expected_return_date ? new Date(loan.expected_return_date).toLocaleDateString() : 'N/A';
        
        // Determine status and styling
        let statusClass = `status-${loan.status}`;
        let displayStatus = loan.status.charAt(0).toUpperCase() + loan.status.slice(1);
        
        // Check if loan is overdue
        if (loan.status === 'active' && loan.expected_return_date) {
            const today = new Date();
            const due = new Date(loan.expected_return_date);
            if (due < today) {
                statusClass = 'status-overdue';
                displayStatus = 'Overdue';
            }
        }
        
        // Format fine amount
        const fineAmount = loan.fine ? `$${parseFloat(loan.fine).toFixed(2)}` : '$0.00';

        const row = `
            <tr class="animate-card">
                <td>#${loan.borrow_id}</td>
                <td>${userName}</td>
                <td>${loan.book_name} (ID: ${loan.book_id})</td>
                <td>${borrowDate}</td>
                <td>${dueDate}</td>
                <td><span class="status-badge ${statusClass}">${displayStatus}</span></td>
                <td>${fineAmount}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// ==========================================
// 5. Actions (Mark as Returned)
// ==========================================
async function markAsReturned(id) {
    const loan = allLoans.find(l => l.borrow_id === id);
    if (!loan) {
        alert('Loan not found!');
        return;
    }
    
    if(!confirm(`Mark book "${loan.book_name}" as returned?\n\nUser: ${loan.user_name}\nFine Amount: $${loan.fine || 0}`)) return;

    try {
        // Note: You need to create this endpoint in your backend
        const res = await fetch(`${API_BASE}/borrow/${id}/return`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ 
                actual_return_date: new Date().toISOString().split('T')[0]
            })
        });

        if (res.ok) {
            // Reload data to reflect changes
            await loadLoans();
            alert(`Book "${loan.book_name}" marked as returned successfully!`);
        } else {
            const errorText = await res.text();
            throw new Error(`Failed to mark as returned: ${errorText}`);
        }
    } catch (err) {
        console.error(err);
        alert(`Error marking as returned: ${err.message}`);
    }
}

// ==========================================
// 6. View Details (Modal)
// ==========================================
function viewDetails(id) {
    const loan = allLoans.find(l => l.borrow_id === id);
    if (!loan) {
        alert('Loan not found!');
        return;
    }
    
    // Format dates
    const formattedBorrowDate = loan.borrow_date 
        ? new Date(loan.borrow_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'Not specified';
    
    const formattedDueDate = loan.expected_return_date 
        ? new Date(loan.expected_return_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'Not specified';
    
    const formattedReturnDate = loan.actual_return_date 
        ? new Date(loan.actual_return_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'Not yet returned';
    
    // Calculate days overdue if applicable
    let daysOverdue = 0;
    let isOverdue = false;
    if (loan.status === 'active' && loan.expected_return_date) {
        const today = new Date();
        const dueDate = new Date(loan.expected_return_date);
        if (dueDate < today) {
            isOverdue = true;
            daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
        }
    }

    const modalBody = document.getElementById('newLoanModal');
    modalBody.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Loan Details</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="loan-details">
                    <div class="detail-row">
                        <span class="detail-label">Loan ID:</span>
                        <span class="detail-value">#${loan.borrow_id}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">User:</span>
                        <span class="detail-value">${loan.user_name} (ID: ${loan.user_id})</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Book:</span>
                        <span class="detail-value">${loan.book_name} (ID: ${loan.book_id})</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Borrow Date:</span>
                        <span class="detail-value">${formattedBorrowDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Due Date:</span>
                        <span class="detail-value ${isOverdue ? 'text-danger' : ''}">
                            ${formattedDueDate}
                            ${isOverdue ? ` (${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue)` : ''}
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Return Date:</span>
                        <span class="detail-value">${formattedReturnDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value status-badge status-${loan.status}">
                            ${loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Fine Amount:</span>
                        <span class="detail-value">$${parseFloat(loan.fine || 0).toFixed(2)}</span>
                    </div>
                    <hr>
                    
                    <div class="modal-actions" style="margin-top: 20px; display: flex; gap: 10px;">
                        ${loan.status === 'active' ? `
                            <button class="btn btn-success" onclick="markAsReturned(${loan.borrow_id})">
                                <i class="fas fa-check-circle"></i> Mark as Returned
                            </button>
                            <button class="btn btn-warning" onclick="extendDueDate(${loan.borrow_id})">
                                <i class="fas fa-calendar-plus"></i> Extend Due Date
                            </button>
                        ` : ''}
                        ${loan.status === 'returned' ? `
                            <button class="btn btn-secondary" disabled>
                                <i class="fas fa-check-double"></i> Already Returned
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

    modalBody.style.display = 'flex';
}

async function extendDueDate(id) {
    const loan = allLoans.find(l => l.borrow_id === id);
    if (!loan) return;
    
    const newDueDate = prompt('Enter new due date (YYYY-MM-DD):', loan.expected_return_date);
    if (!newDueDate) return;
    
    try {
        const res = await fetch(`${API_BASE}/borrow/${id}/extend`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ 
                expected_return_date: newDueDate
            })
        });

        if (res.ok) {
            await loadLoans();
            alert('Due date extended successfully!');
        } else {
            throw new Error('Failed to extend due date');
        }
    } catch (err) {
        console.error(err);
        alert('Error extending due date');
    }
}

function closeModal() {
    document.getElementById('newLoanModal').style.display = 'none';
}

// ==========================================
// 7. Helpers
// ==========================================
function setupSidebar() {
    const menuToggle = document.querySelector(".menu-toggle");
    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            document.querySelector(".sidebar").classList.toggle("active");
        });
    }
}

function logout() {
    localStorage.clear();
    window.location.href = '../Home/login.html';
}

// Add CSS for modal actions and styling
const style = document.createElement('style');
style.textContent = `
    .modal-actions .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        transition: all 0.3s ease;
    }
    .modal-actions .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .modal-actions .btn-success {
        background-color: #28a745;
        color: white;
    }
    .modal-actions .btn-success:hover {
        background-color: #218838;
    }
    .modal-actions .btn-warning {
        background-color: #ffc107;
        color: #212529;
    }
    .modal-actions .btn-warning:hover {
        background-color: #e0a800;
    }
    .modal-actions .btn-secondary {
        background-color: #6c757d;
        color: white;
        cursor: not-allowed;
        opacity: 0.65;
    }
    .detail-row {
        margin-bottom: 12px;
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #eee;
    }
    .detail-row:last-child {
        border-bottom: none;
    }
    .detail-label {
        font-weight: 600;
        color: #555;
        min-width: 180px;
    }
    .detail-value {
        color: #333;
        text-align: right;
    }
    .text-danger {
        color: #dc3545 !important;
        font-weight: 600;
    }
    
    /* Status badges */
    .status-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }
    .status-active {
        background-color: #d1ecf1;
        color: #0c5460;
    }
    .status-returned {
        background-color: #d4edda;
        color: #155724;
    }
    .status-overdue {
        background-color: #f8d7da;
        color: #721c24;
    }
    
    /* Table row click for details */
    .animate-card {
        cursor: pointer;
        transition: background-color 0.2s ease;
    }
    .animate-card:hover {
        background-color: #f8f9fa;
    }
    
    /* Stats grid styling */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }
    .stat-card {
        background: white;
        border-radius: 10px;
        padding: 20px;
        display: flex;
        align-items: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        transition: transform 0.3s ease;
    }
    .stat-card:hover {
        transform: translateY(-5px);
    }
    .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        font-size: 24px;
    }
    .icon-borrowed { background: #d1ecf1; color: #0c5460; }
    .icon-overdue { background: #f8d7da; color: #721c24; }
    .icon-returned { background: #d4edda; color: #155724; }
    .stat-info {
        flex: 1;
    }
    .stat-title {
        font-size: 14px;
        color: #6c757d;
        margin-bottom: 5px;
    }
    .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #343a40;
    }
    
    /* Table styling */
    .table-card {
        margin-top: 20px;
    }
    table {
        width: 100%;
        border-collapse: collapse;
    }
    th {
        background-color: #f8f9fa;
        padding: 12px;
        text-align: left;
        font-weight: 600;
        color: #495057;
        border-bottom: 2px solid #dee2e6;
    }
    td {
        padding: 12px;
        border-bottom: 1px solid #dee2e6;
    }
    tr:last-child td {
        border-bottom: none;
    }
`;
document.head.appendChild(style);

// Add click event to table rows for viewing details
document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('loansTableBody');
    if (tableBody) {
        tableBody.addEventListener('click', function(e) {
            const row = e.target.closest('tr');
            if (row) {
                const loanId = row.cells[0].textContent.replace('#', '');
                viewDetails(parseInt(loanId));
            }
        });
    }
});