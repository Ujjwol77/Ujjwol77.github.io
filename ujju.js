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
