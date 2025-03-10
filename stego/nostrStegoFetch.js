/*
 * nostrStagoFetch.js
 *
 * This script connects to one or more Nostr relays (provided by the user or defaults)
 * via WebSockets, sends a REQ message for a specific event ID, and processes
 * the returned event content to extract any hidden message.
 *
 */

function fetchNostrEvent() {
    const eventId = document.getElementById("nostrEventId").value.trim();
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
            } else {
                // Fallback to three-char zero-width method
                const altDecoded = decodeMessageWithThreeChar(content, password);
                if (altDecoded && altDecoded.trim()) {
                hiddenMessage = `\n${altDecoded}`;
                } else {
                hiddenMessage = "No hidden message found.";
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
        
        // Remove this error message after 7 seconds using the traditional method:
        setTimeout(() => {
          if (errorMsg.parentNode) {
            errorMsg.parentNode.removeChild(errorMsg);
          }
          // If no errors remain, hide the container.
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
  