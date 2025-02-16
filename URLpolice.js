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

console.log("🟢 URLpolice.js is running!");

document.addEventListener("DOMContentLoaded", async () => {
    console.log("✅ DOM is fully loaded, executing URLpolice.js");

    const urlParams = new URLSearchParams(window.location.search);
    let currentUrl = `https://snofl.com/index.html?${urlParams.toString()}`;

    // **Ensure spaces are handled consistently**  
    currentUrl = decodeURIComponent(currentUrl).replace(/\+/g, " ").replace(/%20/g, " ").trim();
    console.log("🟢 Checking URL (fully normalized):", currentUrl);

    try {
        const response = await fetch("/blockedUrls.json");
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const blockedUrls = await response.json();
        console.log("🟢 Blocked URLs Loaded:", blockedUrls);

        for (const entry of blockedUrls) {
            let blockedUrlDecoded = decodeURIComponent(entry.full_url)
                .replace(/\+/g, " ")
                .replace(/%20/g, " ")
                .trim();
            console.log("🔍 Checking against blocklist (normalized):", blockedUrlDecoded);

            // 1. **Exact Full URL Match**
            if (blockedUrlDecoded && currentUrl === blockedUrlDecoded) {
                console.warn(`🚫 Blocked exact match URL: ${currentUrl}`);
                redirectToWarning(entry.reason);
                return;
            }

            // 2. **Check if 'p=' parameter matches, ignoring other parameters**
            const blockedParams = new URLSearchParams(blockedUrlDecoded);
            if (blockedParams.has("p") && urlParams.get("p") === blockedParams.get("p")) {
                console.warn(`🚫 Blocked URL due to 'p=' parameter: ${currentUrl}`);
                redirectToWarning(entry.reason);
                return;
            }

            // 3. **Block Shortened URLs if they match exactly**
            if (entry.shortened && entry.shortened.toLowerCase() !== "none" && entry.shortened !== "") {
                if (window.location.href === `https://snofl.com/${entry.shortened}`) {
                    console.warn(`🚫 Blocked shortened URL: ${window.location.href}`);
                    redirectToWarning(entry.reason);
                    return;
                }
            }
        }
        console.log("✅ No blocked URL detected.");
    } catch (error) {
        console.error("❌ Error loading blocked URLs list:", error);
    }
});

function redirectToWarning(reason) {
    console.log(`🚨 Redirecting user due to block: ${reason}`);
    const warningUrl = `https://snofl.com/index.html?f=1&b=%233d48e6&t=Requested%20page%20was%20blocked%20because%20of&s=violating%20our%20terms%20of%20service.%20Reason%3A&p=${encodeURIComponent(reason)}&h=bummer`;
    console.log(`➡️ Redirecting to: ${warningUrl}`);
    window.location.href = warningUrl;
}


