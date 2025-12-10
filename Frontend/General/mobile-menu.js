// mobile-menu.js - Reusable mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu elements
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileCloseBtn = document.getElementById('mobileCloseBtn');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    // If sidebar doesn't exist, return early
    if (!sidebar) return;
    
    // Toggle mobile menu
    function toggleMobileMenu() {
        sidebar.classList.toggle('active');
        if (mobileOverlay) {
            mobileOverlay.style.display = sidebar.classList.contains('active') ? 'block' : 'none';
        }
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    }
    
    // Close mobile menu
    function closeMobileMenu() {
        sidebar.classList.remove('active');
        if (mobileOverlay) {
            mobileOverlay.style.display = 'none';
        }
        document.body.style.overflow = '';
    }
    
    // Event listeners
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener('click', closeMobileMenu);
    }
    
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeMobileMenu);
    }
    
    // Close menu when clicking on a nav item (on mobile)
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });
    
    // Close menu on window resize (desktop)
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });
    
    // Prevent scrolling when menu is open
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeMobileMenu();
        }
    });
});