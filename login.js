document.getElementById('loginForm').addEventListener('submit', function(event) {
    // Prevent the default form submission
    event.preventDefault();

    // Get input values
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Get error message spans
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');

    // Reset error messages
    usernameError.textContent = '';
    passwordError.textContent = '';

    let isValid = true;

    // --- Validation Checks ---

    // 1. Username / Email validation
    if (username === '') {
        usernameError.textContent = 'Username or email is required.';
        isValid = false;
    }

    // 2. Password validation
    if (password === '') {
        passwordError.textContent = 'Password is required.';
        isValid = false;
    } else if (password.length < 6) {
        // Basic password length check
        passwordError.textContent = 'Password must be at least 6 characters long.';
        isValid = false;
    }

    // If all checks pass, you can proceed with the login logic
    if (isValid) {
        // Here you would typically send the data to a server
        alert('Login successful! Redirecting...');
        window.location.href = 'index.html';
        // Example: window.location.href = '/dashboard';
    }
});