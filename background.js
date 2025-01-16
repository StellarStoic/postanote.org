document.addEventListener('DOMContentLoaded', function() {
    applyStoredBackground(); // Apply stored background on page load
});

// function applyStoredBackground() {
//     const storedIndex = localStorage.getItem('selectedBackgroundIndex');
//     if (storedIndex && backgroundImages[storedIndex]) {
//         document.body.style.backgroundImage = `url('img/background/${backgroundImages[storedIndex]}')`;
//         document.getElementById('dim-overlay').style.display = 'block';
//     }
// }

        // Apply stored background on load
        function applyStoredBackground() {
            const storedIndex = localStorage.getItem('selectedBackgroundIndex');

        if (storedIndex) {
            if (storedIndex.startsWith('#')) {
                // HEX color case
                document.body.style.backgroundColor = storedIndex;
                document.body.style.backgroundImage = ''; // Clear image
            } else if (backgroundImages[storedIndex]) {
                // Image index case
                document.body.style.backgroundImage = `url('img/background/${backgroundImages[storedIndex]}')`;
                document.body.style.backgroundColor = ''; // Clear solid color
            }
            document.getElementById('dim-overlay').style.display = 'block';
        }
    }