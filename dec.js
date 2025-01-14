// Decrypt URL parameters using AES
function decryptData(encryptedData, password) {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, password);
        return bytes.toString(CryptoJS.enc.Utf8); // Return the raw decrypted query string
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
}

// Extract and decrypt data from the URL, then reload the page with decoded parameters
function decryptAndRedirect(url, password) {
    const params = new URL(url).searchParams;
    const encryptedData = params.get('data');

    if (!encryptedData) {
        alert("No encrypted data found in the URL!");
        return false;
    }

    const decryptedData = decryptData(encryptedData, password);

    if (!decryptedData) {
        alert("Invalid password or corrupted data!");
        return false;
    }

    // Replace the current URL with the decrypted parameters
    const baseUrl = url.split('?')[0];
    const newUrl = `${baseUrl}?${decryptedData}`;
    window.location.replace(newUrl); // Redirect to the decoded URL
    return true;
}

// Check if the current URL is already decrypted
function isUrlDecrypted(url) {
    const params = new URL(url).searchParams;
    return !params.has('x'); // If 'x' is absent, the URL is considered decrypted
}

// Check if the encrypted URL was previously decrypted
function wasUrlDecrypted(encryptedUrl) {
    const urlHash = CryptoJS.SHA256(encryptedUrl).toString();
    const storedHash = localStorage.getItem('decryptedUrlHash');
    console.log(`Current URL Hash: ${urlHash}`);
    console.log(`Stored URL Hash: ${storedHash}`);
    return storedHash === urlHash;
}

// Store the hash of the encrypted URL
function storeDecryptedUrl(encryptedUrl) {
    const urlHash = CryptoJS.SHA256(encryptedUrl).toString();
    console.log(`Storing URL Hash: ${urlHash}`);
    localStorage.setItem('decryptedUrlHash', urlHash);
}
