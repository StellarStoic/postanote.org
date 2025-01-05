// Default relays if none are specified
const defaultRelays = [
    "wss://relay.nostr.band",
    "wss://relay.damus.io",
    "wss://njump.me",
    "wss://relay.snort.social",
    "wss://nos.lol"
];

// Decode note1 from a bech32 string (Based on NIP-19)
function decodeNote1(input) {
    const note1Match = input.match(/note1\w+/);
    if (!note1Match) return null;

    const note1 = note1Match[0];
    console.log("Decoding note1:", note1);

    try {
        const { words } = bech32.decode(note1);
        const bytes = bech32.fromWords(words);

        if (bytes.length !== 32) {
            throw new Error("Invalid note1 string. Incorrect byte length.");
        }

        const eventId = bytesToHex(bytes);
        console.log(`Decoded note1 Event ID (Hex): ${eventId}`);
        return { eventId, note1String: note1 };
    } catch (error) {
        console.error("Failed to decode note1:", error);
        return null;
    }
}

// Convert bytes to hex string
function bytesToHex(bytes) {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}


// Fetch the note1 event from relays (stop after first success)
// If event not found, retry with default relays
async function fetchNote1Event(eventId, relays, note1String) {
    const relayList = relays && relays.length ? relays : defaultRelays;
    console.log("Using relays:", relayList);

    let eventFetched = false;
    const paragraph = document.querySelector('#customParagraph');

    // Replace note1 string with colored placeholder
    if (paragraph.innerHTML.includes(note1String)) {
        paragraph.innerHTML = paragraph.innerHTML.replace(
            note1String,
            '<span style="color:rgb(173, 185, 143);">[Event catching...]</span>'
        );
    }

    // Timeout to replace if fetching fails (with soft red)
    const timeoutId = setTimeout(() => {
        if (!eventFetched) {
            paragraph.innerHTML = paragraph.innerHTML.replace(
                '<span style="color: orange;">[Event catching...]</span>',
                '<span style="color: #FF6347;">[Event not found]</span>'  // Soft red (Tomato color)
            );
        }
    }, 10000);  // 10-second timeout for fallback

    for (const relay of relayList) {
        if (eventFetched) break;

        try {
            const socket = new WebSocket(relay);

            socket.onopen = () => {
                const sub = ["REQ", "subscriptionId", { ids: [eventId] }];
                console.log(`Requesting event ${eventId} from ${relay}`);
                socket.send(JSON.stringify(sub));
            };

            socket.onmessage = (message) => {
                const data = JSON.parse(message.data);
                if (data[0] === "EVENT") {
                    if (!eventFetched) {
                        clearTimeout(timeoutId);  // CHANGED: Clear timeout when event is fetched
                        displayNote1Event(data[2], note1String);
                        eventFetched = true;
                    }
                    socket.close();  // Close after first successful fetch
                }
            };

            socket.onclose = () => {
                if (!eventFetched && relay === relayList[relayList.length - 1]) {
                    console.log("Event not found. Retrying with default relays...");
                    if (relayList !== defaultRelays) {
                        fetchNote1Event(eventId, defaultRelays, note1String);
                    }
                }
            };

            socket.onerror = (error) => {
                console.error(`Error connecting to ${relay}:`, error);
            };

        } catch (error) {
            console.error(`Failed to fetch event from ${relay}:`, error);
        }
    }
}


// Toggle Like State and Send Reaction to Relays
async function toggleLike(eventId, pubkey) {
    const likeIcon = document.getElementById(`like-icon-${eventId}`);
    const privateKey = localStorage.getItem("nostr_pk");
    const publicKey = localStorage.getItem("nostr_pub");

    if (!privateKey || !publicKey) {
        alert("Private/Public key not found. Please log in.");
        return;
    }

    // CHANGED: Update local liked_events
    updateLocalLikedEvents(eventId);

    // CHANGED: Sync to HEX{pubkey}.json
    syncLikedEventsToHex(publicKey);

    // Construct Reaction Event (NIP-25)
    const reactionEvent = {
        pubkey: publicKey,
        created_at: Math.floor(Date.now() / 1000),
        kind: 7,
        tags: [
            ["e", eventId],  // Event ID being liked
            ["p", pubkey]   // Pubkey of the event creator
            // ["emoji", "+"]
        ],
        content: "+"
    };

    // Sign and Send the Event
    const signedEvent = await signEvent(reactionEvent, privateKey);
    propagateReaction(signedEvent);

    // CHANGED: Disable the like button after liking
    likeIcon.src = "img/othrIcon/like_1.png";
    likeIcon.dataset.liked = "true";
    likeIcon.style.pointerEvents = "none";  // Disable clicks
    likeIcon.title = "Already Liked";
}

// CHANGED: Update liked events in localStorage (persistent)
function updateLocalLikedEvents(eventId) {
    let likedEvents = JSON.parse(localStorage.getItem("liked_events")) || [];

    // Avoid duplicates
    if (!likedEvents.includes(eventId)) {
        likedEvents.push(eventId);
    }

    // Store updated liked events
    localStorage.setItem("liked_events", JSON.stringify(likedEvents));
}

// CHANGED: Sync liked events to HEX{pubkey}.json
function syncLikedEventsToHex(publicKey) {
    const fileName = `HEX${publicKey}.json`;
    let storedData = localStorage.getItem(fileName);
    let data;

    if (storedData) {
        data = JSON.parse(storedData);
    } else {
        data = { events: [], pk: publicKey };
    }

    // Retrieve liked events from localStorage
    const likedEvents = JSON.parse(localStorage.getItem("liked_events")) || [];
    console.log("Liked Events in localStorage:", likedEvents);

    // Merge liked events back into HEX file
    data.likedEvents = likedEvents;

    // Save updated HEX file
    localStorage.setItem(fileName, JSON.stringify(data));
}

// Store liked events in the user's HEX{pubkey}.json
function storeLikedEvent(eventId, publicKey, eventCreatorPubkey) {
    const fileName = `HEX${publicKey}.json`;
    let storedData = localStorage.getItem(fileName);
    let data;

    // Initialize or parse existing data
    if (storedData) {
        data = JSON.parse(storedData);
    } else {
        data = { events: [], likedEvents: [], pk: publicKey };
    }

    // Ensure likedEvents array exists
    if (!data.likedEvents) {
        data.likedEvents = [];
    }

    // Avoid duplicate likes
    if (!data.likedEvents.includes(eventId)) {
        data.likedEvents.push(eventId);
    }

    // Save back to localStorage
    localStorage.setItem(fileName, JSON.stringify(data));
}

// On Post (kind 1) - Preserve liked events
function saveEvent(event) {
    const publicKey = localStorage.getItem("nostr_pub");
    const fileName = `HEX${publicKey}.json`;
    let storedData = localStorage.getItem(fileName);
    let data;

    if (storedData) {
        data = JSON.parse(storedData);
    } else {
        data = { events: [], pk: publicKey };
    }

    // Add the new event to the events array
    data.events.push(event);

    // Preserve liked events by syncing them back
    data.likedEvents = data.likedEvents || [];
    const localLikedEvents = JSON.parse(localStorage.getItem("liked_events")) || [];
    data.likedEvents = [...new Set([...data.likedEvents, ...localLikedEvents])];

    // Save updated HEX file
    localStorage.setItem(fileName, JSON.stringify(data));
}

// Send the Signed Reaction Event to Relays (Prioritize URL relays)
// Send the Signed Reaction Event to Relays (Prioritize URL relays)
function propagateReaction(event) {
    const params = new URLSearchParams(window.location.search);
    const relayParam = params.getAll('r');

    // Use relays from URL if they exist; fallback to default relays
    const relayList = relayParam.length ? relayParam : defaultRelays;

    let relaysTried = 0;
    let relaysFailed = 0;

    for (const relay of relayList) {
        try {
            const socket = new WebSocket(relay);

            socket.onopen = () => {
                socket.send(JSON.stringify(["EVENT", event]));
                console.log(`Reaction propagated to ${relay}`);
            };

            socket.onmessage = (message) => {
                const data = JSON.parse(message.data);
                console.log(`Relay response from ${relay}:`, data);

                // Check if relay returned 'OK' and propagate to others if not
                if (data[0] === 'OK' && data[2] === true) {
                    socket.close();
                } else {
                    relaysFailed++;
                }
            };

            socket.onerror = (error) => {
                console.error(`Failed to send reaction to ${relay}:`, error);
                relaysFailed++;
            };

            socket.onclose = () => {
                relaysTried++;
                console.log(`Connection to ${relay} closed.`);
                // Retry default relays if all custom relays fail
                if (relaysTried === relayList.length && relaysFailed > 0) {
                    console.warn("All custom relays failed. Retrying with default relays...");
                    fallbackToDefaultRelaysForReactions(event);
                }
            };

        } catch (error) {
            console.error(`WebSocket Error for ${relay}:`, error);
            relaysFailed++;
        }
    }
}

// Fallback to Default Relays if Custom Relays Fail
function fallbackToDefaultRelaysForReactions(event) {
    defaultRelays.forEach(relay => {
        try {
            const socket = new WebSocket(relay);
            socket.onopen = () => {
                socket.send(JSON.stringify(["EVENT", event]));
                console.log(`Reaction propagated to default relay: ${relay}`);
                socket.close();
            };
            socket.onerror = (error) => {
                console.error(`Default relay failed: ${relay}`, error);
            };
        } catch (error) {
            console.error(`Error sending to default relay ${relay}:`, error);
        }
    });
}

// Sign the Reaction Event
async function signEvent(event, privateKey) {
    const encoder = new TextEncoder();
    const message = JSON.stringify([
        0, event.pubkey, event.created_at, event.kind, event.tags, event.content
    ]);
    const hash = await crypto.subtle.digest("SHA-256", encoder.encode(message));
    const id = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join("");

    event.id = id;
    event.sig = await schnorr.sign(id, privateKey);
    return event;
}

// Display the fetched note1 event in the paragraph section
function displayNote1Event(eventData, note1String) {
    const paragraph = document.querySelector('#customParagraph');
    const pContent = paragraph.innerHTML;

    // CHANGED: Ensure replacement happens only if placeholder exists
    const [beforeNote, afterNote] = pContent.includes('[Event catching...]')
        ? pContent.split('[Event catching...]')
        : pContent.split(note1String);

    const noteBox = `
        <div class="note-box">
            <strong>Fetched Note1:</strong> ${eventData.content}
            <div class="note-details" id="note-details-${eventData.id}">
                <strong>Event JSON:</strong>
                <pre>${JSON.stringify(eventData, null, 2)}</pre>
            </div>

            <div class="note-header">
                <img src="img/othrIcon/like_0.png" id="like-icon-${eventData.id}" 
                     class="icon like-icon" alt="Like" title="Like Event" 
                     onclick="toggleLike('${eventData.id}', '${eventData.pubkey}')"
                     data-liked="false">
                <img src="img/othrIcon/details.png" class="icon details-icon" 
                     alt="Details" title="View Details" 
                     onclick="toggleDetails('${eventData.id}')">
            </div>
        </div>
    `;
    

    // Update paragraph with fetched event
    paragraph.innerHTML = pContent.replace('[Event catching...]', noteBox);

    // Ensure likes are applied after event is displayed
    markLikedEvents();

    }

    // Apply liked events to icons after display
    function markLikedEvents() {
        const publicKey = localStorage.getItem("nostr_pub");
        const fileName = `HEX${publicKey}.json`;
        const storedData = localStorage.getItem(fileName);
    
        if (storedData) {
            const data = JSON.parse(storedData);
            if (data.likedEvents) {
                data.likedEvents.forEach(eventId => {
                    const likeIcon = document.getElementById(`like-icon-${eventId}`);
                    if (likeIcon) {
                        likeIcon.src = "img/othrIcon/like_1.png";
                        likeIcon.dataset.liked = "true";
                        likeIcon.style.pointerEvents = "none";  // Disable clicks
                        likeIcon.title = "Already Liked";
                    }
                });
            }
        }
    }

// Toggle function for showing/hiding JSON details
function toggleDetails(eventId) {
    const details = document.getElementById(`note-details-${eventId}`);
    details.classList.toggle('visible');
}

// Close note details when clicking outside
document.addEventListener('click', (event) => {
    const noteBoxes = document.querySelectorAll('.note-box');

    noteBoxes.forEach(box => {
        const details = box.querySelector('.note-details');
        const toggleLink = box.querySelector('a');

        // Close if the click is outside the note-box or "Note Details" link
        if (details.classList.contains('visible') &&
            !box.contains(event.target) && 
            event.target !== toggleLink) {
            details.classList.remove('visible');
        }
    });
});

// On page load, extract and handle note1 from the p= attribute and if there's no note1 string display p= as is
window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    const pValue = params.get('p') || '';
    const relayParam = params.getAll('r');
    
    const customParagraph = document.getElementById('customParagraph');

    if (!pValue.includes('note1')) {
        // No note1 string, simply display the paragraph as normal
        customParagraph.textContent = pValue || "Welcome to NostrPostr!";
    } else {
        const note1Matches = pValue.match(/note1\w+/g) || [];
        if (note1Matches.length > 0) {
            note1Matches.forEach(note1String => {
                const { eventId } = decodeNote1(note1String) || {};
                if (eventId) {
                    fetchNote1Event(eventId, relayParam, note1String);
                }
            });
        } else {
            customParagraph.textContent = "No valid note1 found in URL.";
        }
    }
};

// On page load, mark liked events
document.addEventListener("DOMContentLoaded", () => {
    const publicKey = localStorage.getItem("nostr_pub");
    const fileName = `HEX${publicKey}.json`;
    const storedData = localStorage.getItem(fileName);

    if (storedData) {
        const data = JSON.parse(storedData);
        if (data.likedEvents) {
            setTimeout(() => {
                data.likedEvents.forEach(eventId => {
                    const likeIcon = document.getElementById(`like-icon-${eventId}`);
                    if (likeIcon) {
                        likeIcon.src = "img/othrIcon/like_1.png";
                        likeIcon.dataset.liked = "true";
                    }
                });
            }, 500);  // 500ms delay);
        }
    }
});