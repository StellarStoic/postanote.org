/*
 * nostrStagoFetch.js
 *
 * This script connects to one or more Nostr relays (provided by the user or defaults)
 * via WebSockets, sends a REQ message for a specific event ID, and processes
 * the returned event content to extract any hidden message.
 *
 * --- Added Conversion Functions for HEX, note1 and nevent ---
 * The functions below are integrated from your test file.
 * They handle:
 *   - Converting note1 -> HEX (ignoring any "nostr:" prefix)
 *   - Decoding nevent strings (extracting the event HEX and relay URLs, plus TLV values)
 */

function hexToBytes(hex) {
    if (hex.length % 2 !== 0) throw new Error("Invalid hex length");
    let bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  }
  
  function bytesToHex(bytes) {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  // Convert a note1 string to HEX (32-byte event id)
  function note1ToHex(note1) {
    const clean = note1.replace(/^nostr:/i, '').toLowerCase();
    console.log("Clean note1 input:", clean);
    const decoded = bech32.decode(clean);
    console.log("Decoded note1:", decoded);
    if (typeof decoded !== "object" || !decoded.words) {
      throw new Error(typeof decoded === "object" ? "Decoded result missing words" : decoded);
    }
    if (decoded.prefix !== 'note') {
      throw new Error('Invalid prefix for note1: ' + decoded.prefix);
    }
    const bytes = bech32.fromWords(decoded.words);
    console.log("Converted bytes from note1:", bytes);
    if (bytes.length !== 32) {
      throw new Error('Invalid payload length for note1: ' + bytes.length);
    }
    return bytesToHex(bytes);
  }
  
  // --- Nevent Decoding Helpers ---
  function lenientDecode(bechString, limit) {
    if (!limit) limit = 1000;
    bechString = bechString.toLowerCase();
    var pos = bechString.lastIndexOf('1');
    if (pos < 1 || pos + 7 > bechString.length) {
      throw new Error("Invalid bech32 string");
    }
    var hrp = bechString.substring(0, pos);
    var data = [];
    for (var i = pos + 1; i < bechString.length; i++) {
      var d = "qpzry9x8gf2tvdw0s3jn54khce6mua7l".indexOf(bechString.charAt(i));
      if (d === -1) {
        throw new Error("Unknown character: " + bechString.charAt(i));
      }
      data.push(d);
    }
    // Remove the last 6 digits (checksum)
    return { hrp: hrp, data: data.slice(0, data.length - 6) };
  }
  
  function decodeTLV(bytes) {
    let items = [];
    let i = 0;
    while (i < bytes.length) {
      if (i + 2 > bytes.length) break; // need at least type and length
      let type = bytes[i++];
      let len = bytes[i++];
      if (i + len > bytes.length) break;
      let value = bytes.slice(i, i + len);
      items.push({ type: type, value: value });
      i += len;
    }
    return items;
  }
  
  // Decode a nevent string into its TLV fields.
  // Returns an object: { eventId, relays, pubKey, kind, unknown }
  function neventToEvent(neventStr) {
    const clean = neventStr.replace(/^nostr:/i, '').toLowerCase();
    console.log("Clean nevent input:", clean);
    const decoded = lenientDecode(clean, 1000);
    console.log("Leniently decoded nevent:", decoded);
    if (decoded.hrp !== 'nevent') {
      throw new Error("Invalid prefix for nevent: " + decoded.hrp);
    }
    const payload = new Uint8Array(bech32m.fromWords(decoded.data));
    console.log("Decoded TLV payload for nevent:", payload);
    const tlvs = decodeTLV(payload);
    console.log("TLV items:", tlvs);
    let eventId = null;
    let relays = [];
    let pubKey = null;
    let kind = null;
    let unknown = [];
    for (let item of tlvs) {
      switch(item.type) {
        case 0:
          if (item.value.length === 32) {
            eventId = bytesToHex(item.value);
          } else {
            unknown.push(item);
          }
          break;
        case 1:
          // Decode relay as UTF-8 text
          relays.push(new TextDecoder("utf-8").decode(item.value));
          break;
        case 2:
          if (item.value.length === 32) {
            pubKey = bytesToHex(item.value);
          } else {
            unknown.push(item);
          }
          break;
        case 3:
          if (item.value.length === 4) {
            kind = (item.value[0] << 24) | (item.value[1] << 16) | (item.value[2] << 8) | item.value[3];
          } else {
            unknown.push(item);
          }
          break;
        default:
          unknown.push(item);
      }
    }
    if (!eventId) {
      throw new Error("Missing event ID in TLV");
    }
    return { eventId, relays, pubKey, kind, unknown };
  }
  
  /*
   * End Conversion Functions
   *
   * ----------------------------------------------------------------------------------
   * The main function fetchNostrEvent now uses these conversions to support HEX,
   * note1, and nevent inputs. If a nevent string is provided, the decoded relay
   * URLs will override existing relay inputs.
   */
  
  function fetchNostrEvent() {
    // Get the raw input from the event id field.
    let inputVal = document.getElementById("nostrEventId").value.trim();
    
    try {
      if (/^[0-9a-fA-F]{64}$/.test(inputVal)) {
        // Input is a valid HEX string. Nothing to convert.
        console.log("Input is HEX:", inputVal.toLowerCase());
      } else if (/^(nostr:)?note1/.test(inputVal)) {
        // Input is a note1 string; convert to HEX.
        let hex = note1ToHex(inputVal);
        console.log("Converted note1 to HEX:", hex);
        // Optionally update the input field with the HEX value:
        document.getElementById("nostrEventId").value = hex;
        inputVal = hex;
      } else if (/^(nostr:)?nevent/.test(inputVal)) {
        // Input is a nevent string; decode to extract HEX and relay URLs.
        let eventObj = neventToEvent(inputVal);
        console.log("Decoded nevent:", eventObj);
        // Update the input field with the HEX eventId:
        document.getElementById("nostrEventId").value = eventObj.eventId;
        inputVal = eventObj.eventId;
        
        // Update the relay inputs with the decoded relay URLs:
        let relayContainer = document.getElementById("relayContainer");
        // Clear any existing relay inputs:
        while (relayContainer.firstChild) {
          relayContainer.removeChild(relayContainer.firstChild);
        }
        eventObj.relays.forEach((relay, index) => {
          // Create a label for the relay input
          let label = document.createElement("label");
          label.setAttribute("for", "relayInput" + index);
          label.textContent = "Relay URL:";
          relayContainer.appendChild(label);
          // Create a new input element for the relay URL
          let input = document.createElement("input");
          input.type = "text";
          input.id = "relayInput" + index;
          input.placeholder = "wss://your-relay.example";
          input.value = relay;
          relayContainer.appendChild(input);
        });
      } else {
        throw new Error("Invalid input format. Please enter a 64-character HEX, note1, or nevent string.");
      }
    } catch (e) {
      console.error("Conversion error:", e);
      alert("Conversion error: " + e.message);
      hideLoader();
      return;
    }
    
    // At this point, inputVal is guaranteed to be a HEX string.
    const eventId = inputVal.toLowerCase();
    const password = document.getElementById("nostrDecryptionKey").value;
    
    if (!eventId) {
      alert("Please enter a Nostr event ID.");
      return;
    }
    
    showLoader();
  
    // At the start of fetchNostrEvent, create or clear the error container:
    let errorContainer = document.getElementById("relayErrors");
    if (errorContainer) {
      errorContainer.innerHTML = "";
      errorContainer.style.display = "block";
    } else {
      errorContainer = document.createElement("div");
      errorContainer.id = "relayErrors";
      // Position it at the center of the viewport:
      errorContainer.style.position = "fixed";
      errorContainer.style.top = "50%";
      errorContainer.style.left = "50%";
      errorContainer.style.transform = "translate(-50%, -50%)";
      errorContainer.style.zIndex = "11000";
      errorContainer.style.width = "80%";
      errorContainer.style.textAlign = "center";
      errorContainer.style.color = "red";
      document.querySelector(".nostr-section").appendChild(errorContainer);
    }
  
    // Gather relay URLs from all input fields in the relayContainer.
    const relayInputs = document.querySelectorAll("#relayContainer input");
    const relayUrls = [];
    relayInputs.forEach(input => {
      const url = input.value.trim();
      if (url) {
        relayUrls.push(url);
      }
    });
  
    // If no relay is provided, use default relays.
    if (relayUrls.length === 0) {
      relayUrls.push("wss://relay.nostr.band/");
      relayUrls.push("wss://relay.damus.io/");
      relayUrls.push("wss://nos.lol/");
      relayUrls.push("wss://relay.primal.net/");
    }
  
    // Array to hold all WebSocket connections for later closure.
    const wsConnections = [];
    let foundEvent = false;
    let closedCount = 0; // Counter for closed/errored connections
  
    // Generate a unique subscription id to use across all relays.
    const subscriptionId = "nostr-stego-" + Math.random().toString(36).substr(2, 10);
  
    relayUrls.forEach(relayUrl => {
      const ws = new WebSocket(relayUrl);
      wsConnections.push(ws);
  
      ws.onopen = () => {
        // Send a REQ message according to the Nostr protocol:
        // ["REQ", subscriptionId, { "ids": [eventId] }]
        ws.send(JSON.stringify(["REQ", subscriptionId, { "ids": [eventId] }]));
      };
  
      ws.onmessage = (event) => {
        if (foundEvent) return; // We already processed an event from another relay.
  
        let message;
        try {
          message = JSON.parse(event.data);
        } catch (e) {
          console.error("Invalid JSON received:", event.data);
          return;
        }
  
        // Check if the message is an EVENT message with our subscription id.
        if (Array.isArray(message) && message[0] === "EVENT" && message[1] === subscriptionId) {
          foundEvent = true; // Mark that we have received an event.
          
          const eventData = message[2];
          const content = eventData.content;
          let hiddenMessage = "";
  
          // Check for file stego marker first.
          if (content.includes(FILE_MARKER)) {
            const markerIndex = content.lastIndexOf(FILE_MARKER);
            const payloadText = content.substring(markerIndex + FILE_MARKER.length);
            const firstDelimiter = payloadText.indexOf("||");
            if (firstDelimiter === -1) {
              hiddenMessage = "Invalid payload format.";
            } else {
              const flag = payloadText.substring(0, firstDelimiter).trim();
              const payloadStr = payloadText.substring(firstDelimiter + 2).trim();
              let payloadJSON;
  
              if (flag === "ENC") {
                if (password.trim() === "") {
                  hiddenMessage = "Decryption key required for encrypted data.";
                } else {
                  const decrypted = decryptFileData(payloadStr, password);
                  if (decrypted === "Invalid Key!") {
                    hiddenMessage = "Invalid decryption key!";
                  } else {
                    try {
                      payloadJSON = JSON.parse(decrypted);
                    } catch (e) {
                      hiddenMessage = "Failed to parse hidden data.";
                    }
                  }
                }
              } else {
                try {
                  payloadJSON = JSON.parse(payloadStr);
                } catch (e) {
                  hiddenMessage = "Failed to parse hidden data.";
                }
              }
  
              if (payloadJSON && payloadJSON.data) {
                if (payloadJSON.type === "text/plain") {
                  hiddenMessage = window.atob(payloadJSON.data);
                } else {
                  hiddenMessage = "[Hidden file content not displayed]";
                }
              } else {
                hiddenMessage = "No valid hidden data found.";
              }
            }
          } else {
            // Try two-char zero-width method first
            let decodedText = null;
  
            if (content.includes(MARKER)) {
                const hiddenPart = content.split(MARKER)[1];
                const binaryString = hiddenPart.replace(new RegExp(ZWNJ, 'g'), "0")
                                            .replace(new RegExp(ZWJ, 'g'), "1");
                decodedText = binaryToText(binaryString);
                if (password) decodedText = decrypt(decodedText, password);
            }
  
            if (decodedText && decodedText.trim()) {
                hiddenMessage = `\n${decodedText}`;
                checkForConfettiTrigger(decodedText); // Check if we need to trigger confetti
            } else {
                // Fallback to three-char zero-width method
                const altDecoded = decodeMessageWithThreeChar(content, password);
                if (altDecoded && altDecoded.trim()) {
                    hiddenMessage = `\n${altDecoded}`;
                    checkForConfettiTrigger(altDecoded); // Check for confetti on three-char decoding
                } else {
                    // Final fallback: emoji-based decoding
                    const emojiDecoded = decodeEmoji(content);
                    if (emojiDecoded && emojiDecoded !== "No secrets found.") {
                        hiddenMessage = `\n${emojiDecoded}`;
                        checkForConfettiTrigger(emojiDecoded); // Check for confetti on emoji decoding
                    } else {
                        hiddenMessage = "No hidden message found using any method.";
                    }
                }
            }
        }
  
          // Display the hidden message.
          const outputElement = document.getElementById("nostrOutput");
          displayTruncatedText(outputElement, hiddenMessage, 300);
          outputElement.style.display = "block";
  
          // Also display the original event content in a separate, dimmed container.
          const originalElement = document.getElementById("nostrOriginal");
          originalElement.textContent = content;
          originalElement.style.display = "block";
  
          // Close all WebSocket connections.
          wsConnections.forEach(wsConn => {
            try {
              wsConn.send(JSON.stringify(["CLOSE", subscriptionId]));
              wsConn.close();
            } catch (e) { /* Ignore errors on close */ }
          });
          hideLoader();
        }
      };
  
      ws.onerror = (err) => {
        console.error("WebSocket error on relay " + relayUrl, err);
        // Create an error message element
        let errorMsg = document.createElement("p");
        errorMsg.textContent = "Connection to relay " + relayUrl + " failed.";
        errorMsg.style.textAlign = "center";
        errorContainer.appendChild(errorMsg);
        
        // Remove this error message after 7 seconds:
        setTimeout(() => {
          if (errorMsg.parentNode) {
            errorMsg.parentNode.removeChild(errorMsg);
          }
          if (errorContainer.childElementCount === 0) {
            errorContainer.style.display = "none";
          }
        }, 7000);
        
        closedCount++;
        if (closedCount === relayUrls.length && !foundEvent) {
          hideLoader();
        }
      };
  
      ws.onclose = () => {
        closedCount++;
        if (closedCount === relayUrls.length && !foundEvent) {
          hideLoader();
        }
      };
    });
  }
  
  document.getElementById("fetchNostrButton").addEventListener("click", fetchNostrEvent);
  
  document.getElementById("addRelayButton").addEventListener("click", function () {
    const relayContainer = document.getElementById("relayContainer");
    // Count existing relay input fields to create a unique id
    const relayCount = relayContainer.querySelectorAll("input").length;
    const newRelayId = "relayInput" + relayCount;
  
    // Create a new label for the relay input
    const newLabel = document.createElement("label");
    newLabel.setAttribute("for", newRelayId);
    newLabel.textContent = "Relay URL:";
  
    // Create a new input element for the relay URL
    const newInput = document.createElement("input");
    newInput.type = "text";
    newInput.id = newRelayId;
    newInput.placeholder = "wss://your-relay.example";
  
    // Append the new elements to the relay container
    relayContainer.appendChild(newLabel);
    relayContainer.appendChild(newInput);
  });
  