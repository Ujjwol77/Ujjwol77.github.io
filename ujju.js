// Function to toggle dark mode and rain effect
document.getElementById('mode-toggle').addEventListener('change', function() {
    document.body.classList.toggle('dark-mode'); // Toggle dark mode class on body
    const rainContainer = document.querySelector('.rain'); // Select the rain effect container

    // Toggle dark and light classes on the rain effect container based on the mode
    if (document.body.classList.contains('dark-mode')) {
        rainContainer.classList.remove('light');
        rainContainer.classList.add('dark');
    } else {
        rainContainer.classList.remove('dark');
        rainContainer.classList.add('light');
    }
});

// Function to toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.querySelector('.password-toggle');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordToggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        passwordInput.type = 'password';
        passwordToggle.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

// Function to handle form submission
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Get form inputs
    let username = document.getElementById('username').value.trim();
    let password = document.getElementById('password').value.trim();

    // Validate inputs
    if (username === '' || password === '') {
        alert('Please enter both username and password.');
        return;
    }

    // Add your authentication logic here (replace with actual logic)
    if (username === 'admin' && password === 'password') {
        alert('Login successful!');
        // Redirect to the new page after successful login
        window.location.href = "new-page.html";
    } else {
        alert('Invalid username or password. Please try again.');
    }
});
