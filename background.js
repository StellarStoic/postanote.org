document.addEventListener('DOMContentLoaded', function() {
    applyStoredBackground(); // Apply stored background on page load
});
        // Apply stored background on load
        function applyStoredBackground() {
            const storedIndex = localStorage.getItem('selectedBackgroundIndex');

        if (storedIndex) {
            if (storedIndex.startsWith('url:')) {
            // Custom URL case
            const customUrl = storedIndex.replace('url:', '');
            document.body.style.backgroundImage = `url('${customUrl}')`;
            document.body.style.backgroundColor = ''; // Clear solid color
            } else if (storedIndex.startsWith('#')) {
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