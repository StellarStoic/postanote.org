document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);

    // Define a list of unsafe tags or attributes to check for
    const unsafePatterns = [
        /<script[\s\S]*?>/i,     // Matches <script> tags
        /<iframe[\s\S]*?>/i,     // Matches <iframe> tags
        /<embed[\s\S]*?>/i,      // Matches <embed> tags
        /<object[\s\S]*?>/i,     // Matches <object> tags
        /<link[\s\S]*?>/i,       // Matches <link> tags
        /<style[\s\S]*?>/i,      // Matches <style> tags
        /<svg[\s\S]*?>/i,        // Matches <svg> tags
        /onerror\s*=/i,          // Matches `onerror` attributes in tags
        /javascript:/i,          // Matches `javascript:` URLs
        /data:\s*text\/html/i    // Matches `data:text/html` payloads
    ];

    let isMalicious = false;
    let offendingParam = "";  // To store the name of the offending parameter
    let offendingValue = "";  // To store the value of the offending parameter

    // Check each URL parameter for unsafe content
    for (const [key, value] of urlParams.entries()) {
        unsafePatterns.forEach((pattern) => {
            if (pattern.test(value)) {
                console.warn(`Blocked parameter: ${key} with value: ${value}`);
                isMalicious = true;
                offendingParam = key;
                offendingValue = value;
            }
        });
    }

    // Redirect to an explanation page if malicious content is detected
    if (isMalicious) {
        // Pass details about the malicious parameter to the explanation page
        const explanationURL = `youAreSafeNow.html?param=${encodeURIComponent(
            offendingParam
        )}&value=${encodeURIComponent(offendingValue)}`;
        window.location.href = explanationURL;
    }
});
