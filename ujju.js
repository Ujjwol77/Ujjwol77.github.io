// Function to toggle dark mode
document.getElementById('mode-toggle').addEventListener('change', function() {
    document.body.classList.toggle('dark-mode');
    document.querySelector('.star-container').classList.toggle('show-stars');
});

// Function to display stars on page load
window.onload = function() {
    generateStars();
}

// Function to generate stars
function generateStars() {
    const starContainer = document.querySelector('.star-container');
    const numberOfStars = 50; // Change this number to adjust the quantity of stars

    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        starContainer.appendChild(star);
    }
}

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
// Function to generate stars
function generateStars() {
    const starContainer = document.querySelector('.star-container');
    const numberOfStars = 50; // Change this number to adjust the quantity of stars

    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        starContainer.appendChild(star);
    }
}

// Generate stars on page load
window.onload = function() {
    generateStars();
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
        // Redirect to admin panel page or perform other actions
    } else {
        alert('Invalid username or password. Please try again.');
    }
});
