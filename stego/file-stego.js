// Marker for file steganography payload
const FILE_MARKER = "STEGOFILE||";

// Helper functions for Base64 conversion
function arrayBufferToBase64(buffer) {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  let binary_string = window.atob(base64);
  let len = binary_string.length;
  let bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

// Encrypt/decrypt functions for file steganography (using Base64 strings)
function encryptFileData(dataStr, key) {
  return CryptoJS.AES.encrypt(dataStr, key).toString();
}

function decryptFileData(encryptedData, key) {
  try {
    return CryptoJS.AES.decrypt(encryptedData, key).toString(CryptoJS.enc.Utf8) || "Invalid Key!";
  } catch (e) {
    return "Invalid Key!";
  }
}

// Encode a file into a carrier file with extra info
function encodeFileStego() {
    showLoader(); // Show the loader when starting

  const carrierInput = document.getElementById('carrierFile');
  const hiddenInput = document.getElementById('fileHiddenFile');
  const hiddenTextInput = document.getElementById('hiddenText').value.trim();
  const encryptionKey = document.getElementById('fileEncryptionKey').value;



  if (carrierInput.files.length === 0) {
    alert("Please select a carrier file.");
    hideLoader(); // Hide loader on error
    return;
  }

  if (hiddenInput.files.length > 0 && hiddenTextInput !== "") {
    alert("You can only hide either a file or text, not both. Please choose one.");
    hideLoader();
    return;
  }

  if (hiddenInput.files.length === 0 && hiddenTextInput === "") {
    alert("Please enter hidden text or select a hidden file.");
    hideLoader(); // Hide loader on error
    return;
  }

  const carrierFile = carrierInput.files[0];

  // 🖼️ If the carrier file is an image, show a thumbnail preview
  if (carrierFile.type.startsWith("image/")) {
    const thumbnail = document.getElementById("carrierThumbnail");
    thumbnail.src = URL.createObjectURL(carrierFile);
    thumbnail.style.display = "block";
  }

  let hiddenMeta = null;

  if (hiddenInput.files.length > 0) {
    const hiddenFile = hiddenInput.files[0];
    const readerHidden = new FileReader();

    readerHidden.onload = function (eHidden) {
      let hiddenData = hiddenFile.type.startsWith("image/")
        ? eHidden.target.result
        : arrayBufferToBase64(eHidden.target.result);

      hiddenMeta = {
        name: hiddenFile.name,
        type: hiddenFile.type,
        data: hiddenData,
      };

      proceedWithEncoding(hiddenMeta, carrierFile, encryptionKey);
    };

    if (hiddenFile.type.startsWith("image/")) {
      readerHidden.readAsDataURL(hiddenFile);
    } else {
      readerHidden.readAsArrayBuffer(hiddenFile);
    }
  } else {
    // Only hidden text is provided
    hiddenMeta = {
      name: "hidden_text.txt",
      type: "text/plain",
    //   data: window.btoa(hiddenTextInput),
    data: btoa(unescape(encodeURIComponent(hiddenTextInput))), // Ensure UTF-8 encoding,
    };
    proceedWithEncoding(hiddenMeta, carrierFile, encryptionKey);
  }
}

// Handles encoding process
function proceedWithEncoding(hiddenMeta, carrierFile, encryptionKey) {
  const readerCarrier = new FileReader();
  readerCarrier.onload = function (eCarrier) {
    let payloadStr;
    let flag;

    if (encryptionKey.trim() !== "") {
      payloadStr = encryptFileData(JSON.stringify(hiddenMeta), encryptionKey);
      flag = "ENC";
    } else {
      payloadStr = JSON.stringify(hiddenMeta);
      flag = "RAW";
    }

    // Build payload string: marker + flag + delimiter + payloadStr
    const payload = FILE_MARKER + flag + "||" + payloadStr;

    // Display the encoded text in the new output container
    const encodedOutput = document.getElementById('encodedFileTextOutput');
    encodedOutput.textContent = payload;
    displayTruncatedText(encodedOutput, payload);  // This will show only 300 chars if the payload is longer
    encodedOutput.style.display = 'block';

    const carrierBytes = new Uint8Array(eCarrier.target.result);
    const payloadBytes = new TextEncoder().encode(payload);
    const combined = new Uint8Array(carrierBytes.length + payloadBytes.length);
    combined.set(carrierBytes);
    combined.set(payloadBytes, carrierBytes.length);

    const stegoBlob = new Blob([combined], { type: carrierFile.type });
    const downloadLink = document.getElementById('stegoDownloadLink');
    downloadLink.href = URL.createObjectURL(stegoBlob);
    downloadLink.download = "stego_" + carrierFile.name;
    downloadLink.style.display = 'block';
    downloadLink.textContent = "Download Stego File";

    hideLoader(); // Hide the loader when finished
  };

  readerCarrier.readAsArrayBuffer(carrierFile);
}

// Decode a hidden file from a stego file and restore its original name and type
function decodeFileStego() {
  const stegoInput = document.getElementById('stegoFile');
  const decryptionKey = document.getElementById('fileDecryptionKey').value;

  if (stegoInput.files.length === 0) {
    alert("Please select a stego file.");
    return;
  }

  const readerStego = new FileReader();
  readerStego.onload = function (e) {
    const buffer = e.target.result;
    const bytes = new Uint8Array(buffer);
    let text = new TextDecoder().decode(bytes);

    // Look for the marker in the text
    const markerIndex = text.lastIndexOf(FILE_MARKER);
    if (markerIndex === -1) {
      alert("No hidden file or text found.");
      return;
    }

    const payloadText = text.substring(markerIndex + FILE_MARKER.length);
    const firstDelimiter = payloadText.indexOf("||");

    if (firstDelimiter === -1) {
      alert("Invalid payload format.");
      return;
    }

    const flag = payloadText.substring(0, firstDelimiter).trim();
    const payloadStr = payloadText.substring(firstDelimiter + 2).trim();

    let payloadJSON;
    if (flag === "ENC") {
      if (decryptionKey.trim() === "") {
        alert("Decryption key required for encrypted data.");
        return;
      }

      const decrypted = decryptFileData(payloadStr, decryptionKey);
      if (decrypted === "Invalid Key!") {
        alert("Invalid decryption key!");
        return;
      }

      try {
        payloadJSON = JSON.parse(decrypted);
      } catch (e) {
        alert("Failed to parse hidden data.");
        return;
      }
    } else {
      try {
        payloadJSON = JSON.parse(payloadStr);
      } catch (e) {
        alert("Failed to parse hidden data.");
        return;
      }
    }

    if (!payloadJSON || !payloadJSON.data) {
      alert("No valid hidden data found.");
      return;
    }

    // If the extracted data is an image, display a thumbnail
    if (payloadJSON.type.startsWith("image/")) {
        // Display image preview as before
        const imgPreview = document.getElementById("decodedThumbnail");
        imgPreview.src = payloadJSON.data;
        imgPreview.style.display = "block";

        // ✅ Ensure the download button exists and is placed correctly
        let downloadLink = document.getElementById("imageHiddenDownloadLink");

        if (!downloadLink) {
            downloadLink = document.createElement("a");
            downloadLink.id = "imageHiddenDownloadLink";
            downloadLink.textContent = "Download Decoded Image";
            downloadLink.className = "download-button";
            downloadLink.style.display = "none"; // Initially hidden
        }

        downloadLink.href = payloadJSON.data;
        downloadLink.download = payloadJSON.name || "decoded_image.png";
        downloadLink.style.display = "block"; // Make it visible

        // Place btn below the decoded image
        const thumbnailContainer = document.querySelector(".decodedImage-thumbnail-container");
        if (thumbnailContainer && !thumbnailContainer.contains(downloadLink)) {
            thumbnailContainer.appendChild(downloadLink);
        }

        // 🎇 Trigger sparkle effect for successful image extraction
        triggerSparkleEffect();


      } else if (payloadJSON.type === "text/plain") {
        // For plain text, decode and display in the text container
        // Convert Base64 to UTF-8 correctly
        const decodedText = decodeURIComponent(escape(atob(payloadJSON.data))); 
        hiddenMessage = `\n${decodedText}`;
        const textContainer = document.getElementById("decodedHiddenText");
        displayTruncatedText(textContainer, decodedText, 300);
        textContainer.style.display = "block";

        // ✅ First, check if confetti should trigger
        let confettiTriggered = checkForConfettiTrigger(decodedText);

        // ✅ If confetti did NOT trigger, then trigger sparkles
        if (!confettiTriggered) {
            triggerSparkleEffect();
        }

        // ✅ Get the existing copy button and make it visible
        let copyButton = document.getElementById("copyDecodedTextButton");
        if (copyButton) {
            copyButton.style.display = "inline-block";
        }

        // ✅ Update the function to copy the correct text
        copyButton.onclick = function () {
            navigator.clipboard.writeText(decodedText).then(() => {
                alert("Copied to clipboard!");
            }).catch(err => {
                alert("Failed to copy!");
            });
        };

      } else {
        // For any other type, treat it as a downloadable file
        const hiddenBuffer = base64ToArrayBuffer(payloadJSON.data);
        const hiddenBlob = new Blob([hiddenBuffer], { type: payloadJSON.type || "application/octet-stream" });
        const downloadLink = document.getElementById('fileHiddenDownloadLink');
        downloadLink.download = payloadJSON.name || "extracted_hidden_file";
        downloadLink.href = URL.createObjectURL(hiddenBlob);
        downloadLink.style.display = 'block';
        downloadLink.textContent = "Download Hidden File";
        // 🎇 Trigger sparkle effect for extracted hidden files
        triggerSparkleEffect();
      }
  };

  readerStego.readAsArrayBuffer(stegoInput.files[0]);
}
