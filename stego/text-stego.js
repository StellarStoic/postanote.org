// Alternative Zero-Width characters for hiding data
const ZWSP = '\u200B';  // Zero Width Space
const ZWNJ = '\u200C';  // Zero Width Non-Joiner
const ZWJ = '\u200D';   // Zero Width Joiner
const MARKER = ZWSP + ZWNJ + ZWJ;  // Unique marker to identify hidden text

// Encrypt function
function encrypt(text, key) {
    return CryptoJS.AES.encrypt(text, key).toString();
}

// Decrypt function
function decrypt(text, key) {
    try {
        return CryptoJS.AES.decrypt(text, key).toString(CryptoJS.enc.Utf8) || "Invalid Key!";
    } catch {
        return "Invalid Key!";
    }
}

// Convert text to binary
function textToBinary(text) {
    return Array.from(text)
        .map(char => char.codePointAt(0).toString(2).padStart(32, '0'))  // 32-bit Unicode binary
        .join(ZWSP);
}

// Convert binary back to text
function binaryToText(binaryString) {
    if (!binaryString) return "";
    return binaryString.split(ZWSP)
        .map(bin => String.fromCodePoint(parseInt(bin, 2)))
        .join('');
}

// **Encode Function** - Handles encryption and text-only steganography
function encodeMessage() {
    let msg1 = document.getElementById('visibleMessage').value.trim();
    let hiddenText = document.getElementById('hiddenMessage').value.trim();
    let key = document.getElementById('encryptionKey').value;

    if (!msg1) {
        alert("Visible message cannot be empty!");
        return;
    }
    if (!hiddenText) {
        alert("Hidden message cannot be empty!");
        return;
    }

    // If encryption key is provided, encrypt the hidden text.
    if (key) hiddenText = encrypt(hiddenText, key);
    let hiddenBinary = textToBinary(hiddenText);
    let stegoText = msg1 + MARKER + hiddenBinary.replace(/0/g, ZWNJ).replace(/1/g, ZWJ);
    document.getElementById('encodedOutput').textContent = stegoText;
}


// **Decode Function** - Extracts and displays hidden text
function decodeMessage() {
    showLoader(); // Show loader when decoding starts (if defined)
    
    let encodedMsg = document.getElementById('encodedMessage').value.trim();
    let key = document.getElementById('decryptionKey').value;

    // Check if the encoded message is too large to decode safely.
    const MAX_ENCODED_LENGTH = 1000000;
    if (encodedMsg.length > MAX_ENCODED_LENGTH) {
        alert("Encoded message is too large to decode safely. Please use a smaller message.");
        hideLoader();
        return;
    }

    // if (!encodedMsg.includes(MARKER)) {
    //     document.getElementById('decodedOutput').textContent = "No hidden message found!";
    //     hideLoader();
    //     return;
    // }

    if (!encodedMsg.includes(MARKER)) { 
        // Try alternative three-char method
        const altDecoded = decodeMessageWithThreeChar(encodedMsg, key);
        if (altDecoded) {
            document.getElementById('decodedOutput').textContent = `\n${altDecoded}`;
            checkForConfettiTrigger(altDecoded); // Check if we need to trigger confetti
        } else {
            // Last resort: try emoji-based decoding
            const emojiDecoded = decodeEmoji(encodedMsg);
            if (emojiDecoded && emojiDecoded !== "No secrets found.") {
                document.getElementById('decodedOutput').textContent = `\n${emojiDecoded}`;
                checkForConfettiTrigger(emojiDecoded); // Check for confetti on emoji decoding
            } else {
                document.getElementById('decodedOutput').textContent = "No hidden message found using any method.";
            }
        }
        hideLoader();
        return;
    }

    let hiddenPart = encodedMsg.split(MARKER)[1];
    let binaryString = hiddenPart.replace(new RegExp(ZWNJ, 'g'), "0").replace(new RegExp(ZWJ, 'g'), "1");
    let decodedText = binaryToText(binaryString);
    
    if (key) decodedText = decrypt(decodedText, key);
    
    const decodedOutput = document.getElementById('decodedOutput');
    displayTruncatedText(decodedOutput, decodedText, 300);
    hideLoader(); // Hide loader when decoding is done
}



// Attach Event Listeners
document.getElementById("encodeButton").addEventListener("click", encodeMessage);
document.getElementById("decodeButton").addEventListener("click", decodeMessage);

document.getElementById('encodedMessage').addEventListener('focus', function() {
    let currentValue = this.value;
    if (currentValue.includes(MARKER)) {
      // Keep only the visible (carrier) text
      this.value = currentValue.split(MARKER)[0];
    }
  });
