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

function clearEncodeOutput() {
    const encodedOutput = document.getElementById("encodedOutput");
    if (encodedOutput) encodedOutput.textContent = "";
}

function clearDecodeOutput() {
    const decodedOutput = document.getElementById("decodedOutput");
    if (decodedOutput) decodedOutput.textContent = "";
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
    clearEncodeOutput(); // Clear the output area before encoding

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
    clearDecodeOutput(); // Clear only decoding output
    showLoader(); // Show loader when decoding starts (if defined)
    
    let encodedMsg = document.getElementById('encodedMessage').value.trim();
    let key = document.getElementById('decryptionKey').value;

    // Check if the encoded message is too large to decode safely.
    const MAX_ENCODED_LENGTH = 10000000;
    if (encodedMsg.length > MAX_ENCODED_LENGTH) {
        alert("Encoded message is too large to decode safely. Please use a smaller message.");
        hideLoader();
        return;
    }

    if (!encodedMsg.includes(MARKER)) { 
        // Try alternative three-char method
        const altDecoded = decodeMessageWithThreeChar(encodedMsg, key);
        if (altDecoded) {
            document.getElementById('decodedOutput').textContent = `\n${altDecoded}`;
            // ✅ First, check for confetti trigger
            let confettiTriggered = checkForConfettiTrigger(altDecoded);
            
            // ✅ If confetti was NOT triggered, then trigger sparkles
            if (!confettiTriggered) {
                triggerSparkleEffect();
            }
        } else {
            // Last resort: try emoji-based decoding
            const emojiDecoded = decodeEmoji(encodedMsg);
            if (emojiDecoded && emojiDecoded !== "No secrets found.") {
                document.getElementById('decodedOutput').textContent = `\n${emojiDecoded}`;
                // ✅ First, check for confetti trigger
                let confettiTriggered = checkForConfettiTrigger(emojiDecoded);
                
                // ✅ If confetti was NOT triggered, then trigger sparkles
                if (!confettiTriggered) {
                    triggerSparkleEffect();
                }
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
    const isEncrypted = decodedText.startsWith("U2FsdGVkX1"); // Detect if the message is encrypted (starts with AES prefix)

    if (isEncrypted && !key) {
        const decodedOutput = document.getElementById('decodedOutput');
        displayTruncatedText(decodedOutput, decodedText, 300); // Show it first
        hideLoader();
    
        // Slight delay ensures output renders before alert appears
        setTimeout(() => {
            alert("This message appears to be encrypted. Enter a decryption key to decode it.");
        }, 100);
    
        return; // ✅ Stop here, no sparkles/confetti
    }
    
    if (key) {
        const decrypted = decrypt(decodedText, key);
        if (decrypted === "Invalid Key!") {
            hideLoader();
            alert("Invalid decryption key!");
            return;
        }
        decodedText = decrypted;
    }
    
    const decodedOutput = document.getElementById('decodedOutput');
    displayTruncatedText(decodedOutput, decodedText, 300);

    // ✅ First, check for confetti trigger
    let confettiTriggered = checkForConfettiTrigger(decodedText);
    
    // ✅ If confetti was NOT triggered, then trigger sparkles
    if (!confettiTriggered) {
        triggerSparkleEffect();
    }

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
