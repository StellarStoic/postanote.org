// enc.js
// Encrypt URL parameters using AES
function encryptData(data, password) {
    return CryptoJS.AES.encrypt(data, password).toString();
}

// Generate encrypted URL
function generateEncryptedUrl(baseUrl, parameters, password) {
    if (!password) {
        alert("Password is required to encrypt the URL!");
        return null;
    }

    // Reverse the `ln` parameter only during encryption
    if (parameters.ln) {
        parameters.ln = reverseString(parameters.ln);
    }

    // Extract and remove `c` (clue) from encryption
    const hint = parameters.c || ""; // Fallback to empty string if no hint
    delete parameters.c;

    // Preserve the original query string format
    // `h` and `r` keeps commas and spaces stays %20 not +
    const queryString = Object.entries(parameters)
        .filter(([_, value]) => value !== "" && value !== null)
        .map(([key, value]) => {
            // Keep commas unencoded for `h` and `r`
            if (key === 'h' || key === 'r') {
                return `${encodeURIComponent(key)}=${value}`;
            }
            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        })
        .join("&");

    const encryptedData = CryptoJS.AES.encrypt(queryString, password).toString();
    return `${baseUrl}?${hint ? `c=${encodeURIComponent(hint)}&` : ""}x=1&data=${encodeURIComponent(encryptedData)}`;
    // return `${baseUrl}?x=1&data=${encodeURIComponent(encryptedData)}`;
}
