function isLoggedIn() {
    const email = localStorage.getItem("userEmail");
    const password = localStorage.getItem("userPassword");
    return email !== null && password !== null && email !== "" && password !== "";
}

function logout() {
    // Remove stored login info
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPassword");
    localStorage.removeItem("is_admin");

    // Redirect to login page
    window.location.href = "../Home/home.html";
}

// Listen for storage changes (in case user logs in/out from another tab)
window.addEventListener('storage', function(e) {
    // Check if admin state changed
    if(e.key ==='is_admin'){
        console.log('Authentication lost. Redirecting to home...');
        window.location.href = '../Home/home.html';
    }

    if (e.key === 'userEmail' || e.key === 'userPassword' ) {
        // Get current values IMMEDIATELY
        const currentUserEmail    = localStorage.getItem('userEmail');
        const currentUserPassword = localStorage.getItem('userPassword');
        
        // If email OR password is missing → REDIRECT TO HOME
        if (!currentUserEmail || !currentUserPassword) {
            window.location.href = '../Home/home.html';
        }
    }
});