let footerTimeout;
const footer = document.querySelector('.footerDynamic'); // Select by class

if (footer) {
    function showFooter(temporary = true) {
        footer.style.opacity = '1';
        footer.style.pointerEvents = 'auto'; // Enable interaction

        // If it's a temporary show, hide after 1.5 seconds
        if (temporary) {
            clearTimeout(footerTimeout);
            footerTimeout = setTimeout(() => {
                if (!isAtBottom()) {
                    hideFooter();
                }
            }, 1500);
        }
    }

    function hideFooter() {
        footer.style.opacity = '0';
        footer.style.pointerEvents = 'none'; // Disable interaction when hidden
    }

    function isAtBottom() {
        return window.innerHeight + window.scrollY >= document.body.offsetHeight;
    }

    function contentAllowsScroll() {
        return document.body.offsetHeight > window.innerHeight;
    }

    // Show footer when scrolling down
    window.addEventListener('scroll', () => {
        if (isAtBottom()) {
            showFooter(false); // Keep footer visible when at bottom
        } else {
            showFooter(true); // Temporary show when scrolling
        }
    });

    // Check if scrolling is possible on page load
    if (!contentAllowsScroll()) {
        showFooter(false); // Show footer permanently if no scrolling
    } else {
        hideFooter(); // Hide initially if scrolling is possible
    }
}
