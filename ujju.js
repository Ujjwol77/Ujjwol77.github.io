// Function to toggle dark mode
document.getElementById('mode-toggle').addEventListener('change', function() {
    document.body.classList.toggle('dark-mode');
    document.querySelector('.star-container').classList.toggle('show-stars');
});

// Function to display stars on page load
window.onload = function() {
    document.querySelector('.star-container').classList.add('show-stars');
}

// Function to handle form submission
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    // Add your authentication logic here
    if (username === 'admin' && password === 'password') {
        alert('Login successful!');
        // Redirect to admin panel page
    } else {
        alert('Invalid username or password. Please try again.');
    }
});
