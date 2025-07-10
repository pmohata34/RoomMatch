// Global JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Navigation mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Form handling
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignupSubmit();
        });
    }

    // Password toggle functionality
    const passwordToggle = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function() {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            this.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }

    // Password validation
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            validatePassword(this.value);
        });
    }

    // Survey preference selection
    const preferenceOptions = document.querySelectorAll('.preference-option');
    preferenceOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from siblings
            const siblings = this.parentElement.querySelectorAll('.preference-option');
            siblings.forEach(sibling => sibling.classList.remove('selected'));
            
            // Add selected class to clicked option
            this.classList.add('selected');
        });
    });

    // Filter functionality
    const applyFiltersBtn = document.querySelector('.apply-filters');
    const clearFiltersBtn = document.querySelector('.clear-filters');
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            applyFilters();
        });
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            clearFilters();
        });
    }

    // Newsletter subscription
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleNewsletterSubmit(this);
        });
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .step, .testimonial');
    animateElements.forEach(el => observer.observe(el));
});

// Form submission handlers
function handleSignupSubmit() {
    const formData = new FormData(document.getElementById('signupForm'));
    const userData = Object.fromEntries(formData);
    
    // Basic validation
    if (!userData.firstName || !userData.lastName || !userData.email) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (!userData.terms) {
        showNotification('Please accept the terms and conditions', 'error');
        return;
    }
    
    // Simulate API call
    showNotification('Account created successfully! Redirecting to survey...', 'success');
    
    setTimeout(() => {
        window.location.href = 'survey.html';
    }, 1500);
}

function handleNewsletterSubmit(form) {
    const email = form.querySelector('input[type="email"]').value;
    
    if (!email) {
        showNotification('Please enter your email address', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    showNotification('Successfully subscribed to newsletter!', 'success');
    form.reset();
}

// Utility functions
function validatePassword(password) {
    const requirements = document.querySelectorAll('.requirement');
    
    // Check length
    if (requirements[0]) {
        const lengthValid = password.length >= 8;
        requirements[0].style.color = lengthValid ? '#10b981' : '#ef4444';
    }
    
    // Check for symbol, number, or uppercase
    if (requirements[1]) {
        const complexValid = /[A-Z]/.test(password) || /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password);
        requirements[1].style.color = complexValid ? '#10b981' : '#ef4444';
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transition: all 0.3s ease;
        max-width: 400px;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#6366f1',
        warning: '#f59e0b'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function applyFilters() {
    const filters = {
        college: document.querySelector('input[placeholder="e.g., State University"]').value,
        gender: document.querySelector('select').value,
        ageRange: document.querySelector('input[type="range"]').value,
        sleepSchedule: document.querySelectorAll('select')[1].value,
        noiseTolerance: document.querySelectorAll('select')[2].value,
        cleanliness: document.querySelectorAll('select')[3].value
    };
    
    console.log('Applying filters:', filters);
    showNotification('Filters applied successfully!', 'success');
    
    // In a real app, this would trigger a new search
    // For now, we'll just show a notification
}

function clearFilters() {
    const inputs = document.querySelectorAll('.filters-sidebar input, .filters-sidebar select');
    inputs.forEach(input => {
        if (input.type === 'range') {
            input.value = input.max;
        } else {
            input.value = '';
        }
    });
    
    showNotification('Filters cleared!', 'info');
}

// API simulation functions (replace with real API calls)
function simulateApiCall(endpoint, data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`API call to ${endpoint} with data:`, data);
            resolve({ success: true, data: data });
        }, 1000);
    });
}

// Local storage utilities
function saveUserData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getUserData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function clearUserData(key) {
    localStorage.removeItem(key);
}

// Theme toggle functionality (optional)
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Load saved theme on page load
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
    }
}

// Initialize theme
loadTheme();