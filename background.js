document.addEventListener('DOMContentLoaded', function() {
    applyStoredBackground(); // Apply stored background on page load
});

function applyStoredBackground() {
    const storedIndex = localStorage.getItem('selectedBackgroundIndex');
    if (storedIndex && backgroundImages[storedIndex]) {
        document.body.style.backgroundImage = `url('img/background/${backgroundImages[storedIndex]}')`;
        document.getElementById('dim-overlay').style.display = 'block';
    }
}