// Dynamically load fontList.js
function loadFontList(callback) {
    const script = document.createElement('script');
    script.src = 'fontList.js';
    script.onload = callback;
    script.onerror = () => console.error('Failed to load fontList.js');
    document.head.appendChild(script);
}

// Apply font from storage or URL parameters
function applyFont() {
    const params = new URLSearchParams(window.location.search);
    const urlFontIndex = params.get('f');  // Font from URL
    const storedFontIndex = localStorage.getItem('selectedFontIndex') || sessionStorage.getItem('selectedFontIndex');
    
    // Priority: Storage > URL > Default to 1 (Inconsolata)
    const fontIndex = storedFontIndex || urlFontIndex || '1';

    // Check if fontList is loaded
    if (typeof fontList === 'undefined') {
        console.error('Font list not loaded. Retrying...');
        setTimeout(applyFont, 50);  // Retry if fontList isn't ready yet
        return;
    }

    // Apply font or fallback to sans-serif
    if (fontList[fontIndex]) {
        const fontImport = fontList[fontIndex];

        if (fontImport.includes(':')) {
            // Load Bunny font dynamically
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `https://fonts.bunny.net/css?family=${fontImport}`;
            document.head.appendChild(link);

            // Extract font name and replace dashes with spaces
            const fontName = fontImport.split(':')[0].replace(/-/g, ' '); 
            document.documentElement.style.setProperty('--main-font', `'${fontName}', sans-serif`);
            console.log(`Applied Bunny font: ${fontName} (Index: ${fontIndex})`);
        } else {
            // Apply system fonts directly (like Arial, sans-serif)
            document.documentElement.style.setProperty('--main-font', fontImport);
            console.log(`Applied system font: ${fontImport} (Index: ${fontIndex})`);
        }

        // Save the applied font index to storage if it was from the URL
        if (urlFontIndex) {
            localStorage.setItem('selectedFontIndex', urlFontIndex);  // Persist user choice
            console.log(`Saved font index to storage: ${urlFontIndex}`);
        }
    } else {
        // Fallback to sans-serif if font index not found
        console.warn(`Font index (${fontIndex}) not found. Applying sans-serif.`);
        document.documentElement.style.setProperty('--main-font', 'sans-serif');
    }
}

// Load font list first, then apply font
loadFontList(() => {
    console.log('Font list loaded. Applying font...');
    applyFont();
});
