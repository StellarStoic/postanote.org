// textObfuscator.js
(function() {
    // Central mapping for obfuscation methods with explanations and conversion functions.
    const obfuscationMethods = {
      none: {
        title: "No Obfuscation",
        explanation: "No obfuscation will be applied.",
        mNumber: 0,
        reverseMethod: "none",
        notCompatible: [],
        color: "#eae7e6",
        func: function(text) { return text; }
      },
      fullFlip: {
        title: "Full Flip",
        explanation: "Flips the entire text so it reads completely backwards. From the last character to the first. "
        + "The entire message becomes a mirror of itself, making it readable only in reverse order. <hr> "
        + "setarcoS - .gnihton wonk uoy gniwonk ni si modsiw eurt ylno ehT",
        mNumber: 1,
        reverseMethod: "fullFlip",
        color: "#a9e726",
        notCompatible: ["base64Decoder", "binaryDecoder", "base32Decoder", "base58Decoder"],
        func: protectHiddenData(function(text) {
          return text.split("").reverse().join("");
        })
      },
      wordFlip: {
        title: "Flip Words",
        explanation: "Reverses each individual word in the sentence, but keeps the original word order. "
        + "The words appear flipped, but the sentence structure stays the same. "
        + "<hr> elihW ew tiaw rof ,efil efil sessap - aceneS",
        mNumber: 2,
        reverseMethod: "wordFlip",
        color: "#26e7e7",
        notCompatible: ["base64Decoder", "binaryDecoder", "base32Decoder", "base58Decoder"],
        func: protectHiddenData(function(text) {
          return text.split(" ").map(function(word) {
            return word.split("").reverse().join("");
          }).join(" ");
        })
      },
      readableReverser: {
        title: "Readable Reversal",
        explanation: "Reverses the order of words in the entire text, while keeping the letters "
        + "inside each word untouched. It's like flipping the sentence: the last word becomes "
        + "the first, the first becomes the last — but every word remains readable. <hr>"
        + "Epictetus you. ~ around on going is what matter no aspirations true your to Hold do. "
        + "or think people other what of regardless superior, spiritually is what to yourself Attach ",
        mNumber: 3,
        reverseMethod: "readableReverser",
        color: "#e72c96",
        notCompatible: ["base64Decoder", "binaryDecoder", "base32Decoder", "base58Decoder"],
        func: protectHiddenData(function(text) {
          return text.split(" ").reverse().join(" ");
        })
      },
      sentenceInverter: {
        title: "Sentence Inverter",
        explanation: "Reverses the word order inside each sentence (ending with ., ?, or !), while "
        + "preserving punctuation and spacing. Each sentence stays intact, just flipped word by word. "
        + "Works sentence by sentence, so each one is reversed independently."
        + "<br><br> Any fool can know. The point is to understand. - "
        + "Albert Einstein <hr> know can fool Any. understand to is point The. Einstein Albert -",
        mNumber: 4,
        reverseMethod: "sentenceInverter",
        color: "#c71cee",
        notCompatible: ["base64Decoder", "binaryDecoder", "base32Decoder", "base58Decoder"],
        func: protectHiddenData(function(text) {
          const sentenceRegex = /[^.?!]+[.?!]*[\s]*/g;
          const sentences = text.match(sentenceRegex);
          if (!sentences) return text;
      
          return sentences.map(sentence => {
            // Extract trailing punctuation and space
            const match = sentence.match(/([.?!]+)?(\s*)$/);
            const punctuation = match ? (match[1] || "") : "";
            const space = match ? (match[2] || "") : "";
      
            // Extract sentence body without trailing punctuation
            const body = sentence.slice(0, sentence.length - punctuation.length - space.length).trim();
      
            // Reverse the word order, preserving special characters inside words
            const reversed = body.split(/\s+/).reverse().join(" ");
      
            return reversed + punctuation + space;
          }).join("");
        })
      },
      binaryEncoder: {
        title: "Binary Encoder",
        explanation: "Converts your text into binary code — the raw 1s and 0s that computers use "
        + "to represent information. Each character becomes an 8-bit binary block."
        + "<hr> 01110101 01101110 01100011 01101111 01101110 01100100 01101001 01110100 01101001 01101111 01101110 01100001 01101100 01111001",
        mNumber: 5,
        reverseMethod: "binaryDecoder",
        color: "#b4e2cc",
        notCompatible: ["base64Decoder", "base32Decoder", "base58Decoder"],
        func: protectHiddenData(function(text) {
           return text.split("")
                      .map(c => c.charCodeAt(0).toString(2).padStart(8, '0'))
                      .join(" ");
        })
      },
    binaryDecoder: {
        title: "Binary Decoder",
        explanation: "01101100 01101111 01110110 01100101 <hr> Converts binary code back into normal, readable text. "
        + "Each group of 8 bits (a byte) is translated into the character it represents.",
        mNumber: 6,
        reverseMethod: "binaryEncoder",
        color: "#eeaa33",
        notCompatible: ["base64Encoder", "base32Encoder", "base58Encoder"],
        func: protectHiddenData(function(text) {

          // function looksLikeBinary(text) {
          //   // Remove extra spaces, split by spaces
          //   const bits = text.trim().split(/\s+/);
        
          //   // Check if all are exactly 8 bits
          //   return bits.every(b => /^[01]{8}$/.test(b));
          // }

          // if (!looksLikeBinary(text)) {
          //   showToast("This doesn't look like valid binary input.");
          //   return null;
          // }

        return text.split(" ")
                    .map(bin => String.fromCharCode(parseInt(bin, 2)))
                    .join("");
        })
    },
    base32Encoder: {
        title: "Base32 Encoder",
        explanation:
          "Encodes your hidden message using Base32 - a text-friendly encoding that uses only uppercase letters and numbers (A-Z, 2-7). Useful for file-safe or URL-safe encoding. <hr>"
          + "hello → NBSWY3DP",
        mNumber: 7,
        reverseMethod: "base32Decoder",
        color: "#1e8a33",
        notCompatible: ["base58Decoder", "base64Decoder", "binaryDecoder"],
        func: protectHiddenData(function (text) {
          const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
          const binary = text
            .split("")
            .map(char => char.charCodeAt(0).toString(2).padStart(8, "0"))
            .join("");
      
          let base32 = "";
          for (let i = 0; i < binary.length; i += 5) {
            const chunk = binary.substring(i, i + 5);
            const index = parseInt(chunk.padEnd(5, "0"), 2);
            base32 += alphabet[index];
          }
      
          return base32;
        })
      },
      base32Decoder: {
        title: "Base32 Decoder",
        explanation:
          "Decodes a Base32-encoded string back into its original readable form. Works only with uppercase Base32 characters (A-Z, 2-7) and ignores padding. <hr>"
          + "NBSWY3DP → hello",
        mNumber: 8,
        reverseMethod: "base32Encoder",
        color: "#3b77aa",
        notCompatible: ["base64Encoder", "base58Encoder", "binaryEncoder"],
        func: protectHiddenData(function (text) {

          // function looksLikeBase32(text) {
          //   return /^[A-Z2-7=]+$/i.test(text.replace(/\s/g, ""));
          // }

          // if (!looksLikeBase32(text)) {
          //   showToast("This doesn't look like valid Base32.");
          //   return null;
          // }

          const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
          let binary = "";
      
          for (let char of text.replace(/=+$/, "").toUpperCase()) {
            const index = alphabet.indexOf(char);
            if (index === -1) continue; // skip unknown characters
            binary += index.toString(2).padStart(5, "0");
          }
      
          let output = "";
          for (let i = 0; i < binary.length; i += 8) {
            const byte = binary.substring(i, i + 8);
            if (byte.length === 8) {
              output += String.fromCharCode(parseInt(byte, 2));
            }
          }
      
          return output;
        })
      },      
      base58Encoder: {
        title: "Base58 Encoder",
        explanation:
          "Encodes your hidden message using Base58 — a human-friendly format that avoids confusing "
          + "characters like 0, O, I, and l. Commonly used in Bitcoin and crypto tools. <hr>"
          + "hello → StV1DL6CwTryKyV",
        mNumber: 9,
        reverseMethod: "base58Decoder",
        color: "#aef633",
        notCompatible: ["base64Decoder", "base32Decoder", "binaryDecoder"],
        func: protectHiddenData(function (text) {
          const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
          const encoder = new TextEncoder();
          const bytes = encoder.encode(text);
          
          let num = BigInt("0x" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join(""));
          let base58 = "";
      
          while (num > 0) {
            const remainder = num % 58n;
            base58 = alphabet[Number(remainder)] + base58;
            num = num / 58n;
          }
      
          // Handle leading zero bytes
          for (let byte of bytes) {
            if (byte === 0) base58 = "1" + base58;
            else break;
          }
      
          return base58;
        })
      },
      base58Decoder: {
        title: "Base58 Decoder",
        explanation:
          "Decodes a Base58-encoded string back into its original text. Ignores ambiguous "
          + "characters and supports crypto-safe strings. <hr>"
          + "StV1DL6CwTryKyV → hello",
        mNumber: 10,
        reverseMethod: "base58Encoder",
        color: "#298891",
        notCompatible: ["base64Encoder", "base32Encoder", "binaryEncoder"],
        func: protectHiddenData(function (text) {

          // function looksLikeBase58(text) {
          //   return /^[1-9A-HJ-NP-Za-km-z]+$/.test(text.replace(/\s/g, ""));
          // }

          // if (!looksLikeBase58(text)) {
          //   showToast("This doesn't look like valid Base58.");
          //   return null;
          // }

          const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
          let num = BigInt(0);
      
          for (let char of text) {
            const index = alphabet.indexOf(char);
            if (index === -1) continue; // skip invalid chars
            num = num * 58n + BigInt(index);
          }
      
          let hex = num.toString(16);
          if (hex.length % 2) hex = "0" + hex;
      
          const bytes = [];
          for (let i = 0; i < hex.length; i += 2) {
            bytes.push(parseInt(hex.slice(i, i + 2), 16));
          }
      
          // Handle leading "1"s as zero bytes
          for (let char of text) {
            if (char === "1") bytes.unshift(0);
            else break;
          }
      
          const decoder = new TextDecoder();
          return decoder.decode(new Uint8Array(bytes));
        })
      },
      base64Encoder: {
        title: "Base64 Encoder",
        explanation: "Encodes your hidden message using Base64 — a text-based format that converts "
        + "binary data into readable characters. This makes your message look scrambled to humans but reversible with decoding."
        + "<hr> V2h5IGRpZCBCYXNlNjQgYnJlYWsgdXAgd2l0aCBCYXNlMzI/CkJlY2F1c2UgaXQgY291bGRuJ3QgaGFuZGxlIHRoZSBleHRyYSBiaXRzIG9mIGNvbW1pdG1lbnQhIPCfmIM=",
        mNumber: 11,
        reverseMethod: "base64Decoder",
        color: "#5811f6",
        notCompatible: ["base58Decoder", "base32Decoder", "binaryDecoder"],
        func: protectHiddenData(function(text) {
          try {
            // Convert Unicode to a Latin1-compatible string before encoding.
            return btoa(unescape(encodeURIComponent(text)));
          } catch (err) {
            showToast("Base64 Encoding Error: " + err.message);
            return text; // Fallback to original text if encoding fails.
          }
        })
      },
      base64Decoder: {
        title: "Base64 Decoder",
        explanation: "4oCcWWVzdGVyZGF5IEkgd2FzIGNsZXZlciwgc28gSSB3YW50ZWQgdG8gY2hhbmdlIHRoZSB3b3JsZC4gVG9kYXkgSSBhbSB3aXNlLCBzbyBJIGFtIGNoYW5naW5nIG15c2VsZi7igJ0K4oCVIFJ1bWk= "
        + "<hr> Decodes a Base64 string back into its original, readable message. Useful for reversing  base64 encoded messages that look scrambled or unreadable. ",
        mNumber: 12,
        reverseMethod: "base64Encoder",
        color: "#1ae19a",
        notCompatible: ["base58Encoder", "base32Encoder", "binaryEncoder"],
        func: protectHiddenData(function(text) {

            // function looksLikeBase64(text) {
            //   return /^[A-Za-z0-9+/=]+$/.test(text.replace(/\s/g, "")) && text.length % 4 === 0;
            // }

            // if (!looksLikeBase64(text)) {
            //   showToast("This doesn't look like valid Base64.");
            //   return null;
            // }

            try {
              // 🔍 Step 1: Remove all invisible zero-width characters
              const cleaned = text.replace(/[\u200B\u200C\u200D]/g, '');
          
              // 🔍 Step 2: Strip normal whitespace just in case
              const sanitized = cleaned.replace(/\s/g, '');
          
              // 🔄 Decode from Base64
              return decodeURIComponent(
                atob(sanitized)
                  .split('')
                  .map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                  })
                  .join('')
              );
            } catch (err) {
              showToast("Base64 Decoding Error: " + err.message);
              return text; // fallback
            }
          })
      },
      scrambler: {
        title: "Scrambler",
        explanation: "Scrambles the middle letters of each word while keeping the first and last letter untouched. Use it again to reverse (descramble) the sentence back to its original form. Words with 3 or fewer letters are left unchanged."
        + "<hr> it deson't mttear in waht oderr the ltteres in a wrod are, the olny iportanmt tinhg is taht the frsit and lsat ltteer be at the rghit pacle.",
        mNumber: 13,
        reverseMethod: "scrambler",
        color: "#2be19a",
        notCompatible: ["base58Decoder", "base32Decoder", "base64Decoder", "binaryDecoder"],
        func: protectHiddenData(function(text) {

          return text.split(/\b/).map(word => {
              const match = word.match(/^([\p{L}]{2,})([\p{P}]*)$/u);
              if (!match) return word;
  
              const wordPart = match[1];
              const punctuation = match[2];
  
              if (wordPart.length <= 3) return word;
  
              const first = wordPart[0];
              const last = wordPart[wordPart.length - 1];
              let middle = wordPart.slice(1, -1).split('');
  
              // Swap pairs (involution)
              for (let i = 0; i < middle.length - 1; i += 2) {
                  [middle[i], middle[i + 1]] = [middle[i + 1], middle[i]];
              }
  
              return first + middle.join('') + last + punctuation;
  
          }).join("");
  
      })
  },
    morseCode: {
      title: "Morse Code",
      explanation: "Encodes and decodes Morse Code automatically. Supports most common EU letters by mapping them to their nearest International Morse equivalent.<hr>"
        + "Example: Ça va bien? → -.-. .- / ...- .- / -... .. . -. ..--..",
      mNumber: 14,
      reverseMethod: "morseCode",
      color: "#cc9e11",
      notCompatible: ["sentenceInverter","base64Decoder", "base58Decoder", "base32Decoder", "binaryDecoder"],
      func: protectHiddenData(function (text) {
  
          // ⬇️ Place it right here:
          const normalizeEU = (char) => {
              return char
                  .replace(/[àáâãäåæ]/gi, 'A')
                  .replace(/[çčć]/gi, 'C')
                  .replace(/[ðđ]/gi, 'D')
                  .replace(/[èéêëě]/gi, 'E')
                  .replace(/[íîï]/gi, 'I')
                  .replace(/[ñ]/gi, 'N')
                  .replace(/[òóôõöø]/gi, 'O')
                  .replace(/[š]/gi, 'S')
                  .replace(/[ùúûüů]/gi, 'U')
                  .replace(/[ý]/gi, 'Y')
                  .replace(/[ž]/gi, 'Z');
          };
  
          const morseTable = {
              "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".", "F": "..-.",
              "G": "--.", "H": "....", "I": "..", "J": ".---", "K": "-.-", "L": ".-..",
              "M": "--", "N": "-.", "O": "---", "P": ".--.", "Q": "--.-", "R": ".-.",
              "S": "...", "T": "-", "U": "..-", "V": "...-", "W": ".--", "X": "-..-",
              "Y": "-.--", "Z": "--..",
              "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
              "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
              ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
              "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
              ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-",
              "\"": ".-..-.", "$": "...-..-", "@": ".--.-.", " ": "/"
          };
  
          const inverseMorse = Object.fromEntries(
              Object.entries(morseTable).map(([k, v]) => [v, k])
          );
  
          const isMorse = /^[\s.\-/]+$/.test(text);
  
          if (isMorse) {
            // Morse → Text
            if (!isMorse) {
              showToast("This doesn't look like Morse code.");
              return null;
            }
              return text.trim().split(" ").map(code => inverseMorse[code] || "").join("");
          } else {
              // Text → Morse
              return text.toUpperCase().split("").map(ch => {
                  const normalized = normalizeEU(ch);
                  return morseTable[normalized] || "";
              }).join(" ");
          }
      })
  },
  leetSpeak: {
    title: "Leet Speak",
    explanation: "Leetspeak, also known as 1337 5P34K, replaces letters with numbers or symbols that resemble them visually.<hr>"
    + "Examples:<br>hello → h3ll0<br>leet → l33t<br>elite → 3l1t3<hr>"
    + "Originally used by hackers and gamers to evade text filters or show off skills, leetspeak became a cultural phenomenon in early internet communities.",
    mNumber: 15,
    reverseMethod: "leetSpeak",
    color: "#00cc00",
    notCompatible: ["base64Decoder", "base58Decoder", "base32Decoder", "binaryDecoder"],
    func: protectHiddenData(function (text) {
        // Simple reversible leetspeak map
        const leetMap = {
          'A': '4', 'B': '8', 'C': '<', 'D': '|)', 'E': '3',
          'F': 'ph', 'G': '6', 'H': '#', 'I': '1', 'J': '_|',
          'K': '|<', 'L': '1', 'M': '/\\/\\', 'N': '|\\|', 'O': '0',
          'P': '|2', 'Q': '0_', 'R': '|2', 'S': '5', 'T': '7',
          'U': '|_|', 'V': '\\/', 'W': '\\/\\/', 'X': '><',
          'Y': '`/', 'Z': '2'
      };

      const reverseLeetMap = Object.entries(leetMap)
          .sort((a, b) => b[1].length - a[1].length) // sort by longest first!
          .map(([letter, leet]) => [leet, letter]);

      const isLeet = /[0-9|\/\\()_<>#]/.test(text); // lightweight check if it contains leet symbols

      if (isLeet) {
          // Decode
          let decoded = text;
          for (let [leet, char] of reverseLeetMap) {
              const regex = new RegExp(leet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
              decoded = decoded.replace(regex, char);
          }
          return decoded;
      } else {
          // Encode
          return text.toUpperCase().split("").map(ch => leetMap[ch] || ch).join("");
      }
  })
},
            // Future options can be added here.
    };

    /**
     * Swaps the text content between the visible and hidden message fields.
     */
    function switchText() {
      const visibleTextArea = document.getElementById('visibleMessage');
      const hiddenTextArea  = document.getElementById('cipherHiddenMessage');
    
      if (visibleTextArea && hiddenTextArea) {
        const temp = visibleTextArea.value;
        visibleTextArea.value = hiddenTextArea.value;
        hiddenTextArea.value  = temp;
      }
    }
  
 /**
   * Opens the modal and updates the title and explanation text.
   * @param {string} title - The title of the obfuscation method.
   * @param {string} explanation - The explanation text to display.
   */
 function openObfuscationModal(title, explanation) {
    const modal = document.getElementById("obfuscationModal");
    const modalTitle = document.getElementById("modalMethodTitle");
    const modalDesc = document.getElementById("modalDescription");
    modalTitle.innerHTML = title;
    modalDesc.innerHTML = explanation;
    modal.style.display = "block";
  }

  // Every time method bubble is removed the dropdown will be refreshed with relevant restrictions
  function refreshDropdownRestrictions() {
    const dropdown = document.getElementById("textTransformationMethod");

    // Clear all restrictions first
    Array.from(dropdown.options).forEach(option => {
        option.disabled = false;
        option.textContent = option.textContent.replace(" ❌", "");
    });

    // Find the last method used (if any)
    const lastMethod = window.textObfuscator.methodHistory.slice(-1)[0];

    if (!lastMethod) return; // nothing to restrict if no method left

    if (lastMethod.notCompatible) {
        lastMethod.notCompatible.forEach(incompatibleKey => {
            const incompatibleOption = dropdown.querySelector(`option[value="${incompatibleKey}"]`);
            if (incompatibleOption) {
                incompatibleOption.disabled = true;
                if (!incompatibleOption.textContent.includes("❌")) {
                    incompatibleOption.textContent += " ❌";
                }
            }
        });
    }
}


  /**
   * Tiny modal when clicking on method bubble
   */
  function showMethodBubbleModal(method, index, bubbleElement) {
    const modal = document.getElementById("methodInfoModal");
    const title = document.getElementById("methodBubbleTitle");
    const removeBtn = document.getElementById("removeLastMethodBtn");
    const removeAllBtn = document.getElementById("removeAllMethodsBtn"); // ✅ new button

    title.textContent = method.title;

    const isLast = Array.isArray(window.textObfuscator.methodHistory) && index === window.textObfuscator.methodHistory.length - 1;

    // Handle single remove button
    if (isLast) {
        removeBtn.style.display = "block";
        removeAllBtn.style.display = "block"; // ✅ show removeAll button

        removeBtn.onclick = () => {
            // Reverse the method effect on hidden text
            const lastMethod = window.textObfuscator.methodHistory.pop();
            const reverseKey = lastMethod.reverseMethod;
            const reverseMethod = window.textObfuscator.obfuscationMethods[reverseKey];
            if (reverseMethod && typeof reverseMethod.func === "function") {
                const hiddenTextArea = document.getElementById("cipherHiddenMessage");
                hiddenTextArea.value = reverseMethod.func(hiddenTextArea.value);
            }

            bubbleElement.remove();
            refreshDropdownRestrictions();
            modal.style.display = "none";

            // Update the last bubble
            const bubbles = document.querySelectorAll(".method-bubble");
            if (bubbles.length > 0) {
                const lastBubble = bubbles[bubbles.length - 1];
                const newIndex = bubbles.length - 1;
                const lastMethod = window.textObfuscator.methodHistory[newIndex];
                showMethodBubbleModal(lastMethod, newIndex, lastBubble);
            } else {
                document.getElementById("methodControlButtons").style.display = "none";
            }
        };

        // ✅ Remove ALL methods button
        removeAllBtn.onclick = () => {
            // Reverse all methods in reverse order
            const hiddenTextArea = document.getElementById("cipherHiddenMessage");
            
            for (let i = window.textObfuscator.methodHistory.length - 1; i >= 0; i--) {
                const reverseKey = window.textObfuscator.methodHistory[i].reverseMethod;
                const reverseMethod = window.textObfuscator.obfuscationMethods[reverseKey];
                if (reverseMethod && typeof reverseMethod.func === "function") {
                    hiddenTextArea.value = reverseMethod.func(hiddenTextArea.value);
                }
            }

            // ✅ Clear cipherHiddenMessage content too!
            hiddenTextArea.value = "";

            // Clear method history and bubbles
            window.textObfuscator.methodHistory = [];
            document.getElementById("methodSequence").innerHTML = "";
            document.getElementById("methodControlButtons").style.display = "none";
            refreshDropdownRestrictions();
            modal.style.display = "none";
            showToast("All methods and text have been cleared.");
        };

    } else {
        removeBtn.style.display = "none";
        removeAllBtn.style.display = "none"; // ✅ hide removeAll button when not on last bubble
    }

    const rect = bubbleElement.getBoundingClientRect();
    modal.style.top = `${rect.bottom + 10}px`;
    modal.style.left = `${rect.left}px`;
    modal.style.display = "block";

    setTimeout(() => {
        modal.style.display = "none";
    }, 5000);
}


  /**
   * Click handler to close modal when clicked outside
   */
  document.addEventListener("click", function (event) {
    const modal = document.getElementById("methodInfoModal");
    if (modal.style.display === "block" && !modal.contains(event.target) && !event.target.classList.contains("method-bubble")) {
      modal.style.display = "none";
    }
  });

  function addMethodBubble(method) {
    const bubble = document.createElement("span");
    bubble.className = "method-bubble";
    bubble.style.backgroundColor = method.color;
    bubble.textContent = method.mNumber;

    bubble.addEventListener("click", function () {
      const index = Array.from(document.querySelectorAll(".method-bubble")).indexOf(bubble);
      showMethodBubbleModal(method, index, bubble);
    });

    document.getElementById("methodSequence").appendChild(bubble);
    // Show control buttons if at least one method used
    document.getElementById("methodControlButtons").style.display = "flex";
  }

    document.getElementById("copyMethodSequence").addEventListener("click", function () {
        const sequence = window.textObfuscator.methodHistory.map(m => m.mNumber).join(",");
        // const key = document.getElementById("encryptionKey")?.value?.trim(); // or whatever your encryption field ID is
        let exportString = "mSeq=" + sequence;
        navigator.clipboard.writeText(exportString).then(() => showToast("Copied!"));
    });


  
  
  /**
   * Handles changes to the obfuscation dropdown menu.
   * If the user selects an obfuscation method other than "none",
   * it stores the current hidden text as original (if not already stored)
   * and opens the modal with the corresponding explanation.
   * If "none" is selected, it reverts the hidden text to the original.
     * @param {Event} event 
     */
  function handleObfuscationMethodChange(event) {
    const selectedOption = event.target.value;
    const method = obfuscationMethods[selectedOption];
    const dropdown = document.getElementById("textTransformationMethod");

    dropdown.addEventListener("click", () => {
        dropdown.classList.add("clicked");
        setTimeout(() => dropdown.classList.remove("clicked"), 500);
      });

    const inputValue = document.getElementById("cipherHiddenMessage").value.trim();
    if (!inputValue) {
        showToast("Please enter a text first before selecting a transformation method.");
        dropdown.value = "none";  // reset dropdown
        return;
    }

    // ✅ Validator for methods
    const validators = {
      binaryDecoder: (text) => {
          const bits = text.trim().split(/\s+/);
          return bits.every(b => /^[01]{8}$/.test(b));
      },
      base32Decoder: (text) => {
          return /^[A-Z2-7=]+$/i.test(text.replace(/\s/g, ""));
      },
      base58Decoder: (text) => {
          return /^[1-9A-HJ-NP-Za-km-z]+$/.test(text.replace(/\s/g, ""));
      },
      base64Decoder: (text) => {
          return /^[A-Za-z0-9+/=]+$/.test(text.replace(/\s/g, "")) && text.length % 4 === 0;
      }
  };

      // ✅ Check if selected decoder needs validation
    if (validators[selectedOption]) {
        if (!validators[selectedOption](inputValue)) {
            showToast(`This doesn't look like valid ${selectedOption.replace('Decoder', '')} input.`);
            dropdown.value = "none";  // reset
            return;
        }
    }

  
  // ✅ Clear previous state
  Array.from(dropdown.options).forEach(option => {
    option.disabled = false;
    option.textContent = option.textContent.replace(" ❌", "");
  });
  
    if (selectedOption === "none") {
      window.textObfuscator.selectedMethod = null;
      window.textObfuscator.toggleState = false;
      return;
    }

    if (method) {
        openObfuscationModal(method.title, method.explanation);
        window.textObfuscator.selectedMethod = method;
        window.textObfuscator.toggleState = false;
  
    // Disable incompatible options for the last method used
    if (method.notCompatible) {
        method.notCompatible.forEach(incompatibleKey => {
          const incompatibleOption = dropdown.querySelector(`option[value="${incompatibleKey}"]`);
          if (incompatibleOption) {
            incompatibleOption.disabled = true;
            incompatibleOption.textContent += " ❌";
          }
        });
      }
    }
  }

      /**
     * Closes the obfuscation modal.
     */
      function closeObfuscationModal() {
        const modal = document.getElementById("obfuscationModal");
        modal.style.display = "none";
      }

        function protectHiddenData(methodFunc) {
            return function(text) {
              const markerIndex = text.indexOf(MARKER);
              if (markerIndex !== -1) {
                const visiblePart = text.substring(0, markerIndex);
                const hiddenPart = text.substring(markerIndex);
                return methodFunc(visiblePart) + hiddenPart;
              }
              return methodFunc(text);
            };
          }
  
    // Attach event listeners once the DOM is fully loaded.
    document.addEventListener("DOMContentLoaded", function() {
      // Switch text button
      const switchButton = document.getElementById("switchTextButton");
      if (switchButton) {
        switchButton.addEventListener("click", switchText);
      }
  
      // Obfuscation dropdown
      const obfuscationSelect = document.getElementById("textTransformationMethod");
      if (obfuscationSelect) {
        // Initialize lastSelectedOption.
        window.textObfuscator.lastSelectedOption = obfuscationSelect.value;
      
        // On change, update the last selected option and handle new selections.
        obfuscationSelect.addEventListener("change", function(event) {
          const selectedOption = event.target.value;
          window.textObfuscator.lastSelectedOption = selectedOption;
          handleObfuscationMethodChange(event);
        });
      }  

      // Modal buttons and close functionality
      const useButton = document.getElementById("useObfuscation");
    //   const declineButton = document.getElementById("declineObfuscation");
      const closeButton = document.getElementById("closeObfuscationModal");
      const modal = document.getElementById("obfuscationModal");
  
      if (closeButton) {
        closeButton.addEventListener("click", closeObfuscationModal);
      }

      if (useButton) {
        useButton.addEventListener("click", function () {
          const hiddenTextArea = document.getElementById("cipherHiddenMessage");
          const obfuscationSelect = document.getElementById("textTransformationMethod");
          


          if (
            window.textObfuscator.selectedMethod &&
            typeof window.textObfuscator.selectedMethod.func === "function"
          ) {



            // const result = window.textObfuscator.selectedMethod.func(hiddenTextArea.value);

            // // ❌ BLOCK IT HERE
            // if (result === null) {
            //   window.textObfuscator.selectedMethod = null;
            //   obfuscationSelect.value = "none";
            //   closeObfuscationModal();
            //   return;
            // }
            // if (!window.textObfuscator.toggleState) {
            //     if (hiddenTextArea.value.includes(MARKER)) {
            //         showToast("⚠️ You're about to transform a message that contains hidden data. It will try to preserved it, but in most cases manipulating the carrier text usually corrupts the hidden part");
            //     }

            //   // Apply the selected obfuscation
            //   hiddenTextArea.value = window.textObfuscator.selectedMethod.func(hiddenTextArea.value);

            if (!window.textObfuscator.toggleState) {
              if (hiddenTextArea.value.includes(MARKER)) {
                  showToast("⚠️ You're about to transform a message that contains hidden data. It will try to preserve it, but manipulating the carrier text usually corrupts the hidden part.");
              }

              // ✅ Apply once, accept if it returns null or new value
              const result = window.textObfuscator.selectedMethod.func(hiddenTextArea.value);

              // ✅ Block if result is null (indicates validation failure)
              if (result === null) {
                  window.textObfuscator.selectedMethod = null;
                  obfuscationSelect.value = "none";
                  closeObfuscationModal();
                  return;
              }

              hiddenTextArea.value = result;

              window.textObfuscator.toggleState = true;
              window.textObfuscator.methodHistory.push(window.textObfuscator.selectedMethod);
              addMethodBubble(window.textObfuscator.selectedMethod);
            } else {
                // Just toggle state flag (optional)
                window.textObfuscator.toggleState = false;
            }
          }
      
          // Reset dropdown to "none" so the same method can be re-selected next time
          if (obfuscationSelect) {
            obfuscationSelect.value = "none";
          }
      
          // Clear stored method and close modal
          window.textObfuscator.selectedMethod = null;
          closeObfuscationModal();
        });
      }

    if (closeButton) {
        closeButton.addEventListener("click", function() {
          const obfuscationSelect = document.getElementById("textTransformationMethod");
          if (obfuscationSelect) {
            obfuscationSelect.value = "none";
          }
          window.textObfuscator.selectedMethod = null;
          closeObfuscationModal();
        });
      }

    // Close modal when clicking outside its content.
    window.addEventListener("click", function(event) {
        if (event.target === modal) {
          const obfuscationSelect = document.getElementById("textTransformationMethod");
          if (obfuscationSelect) {
            obfuscationSelect.value = "none";
          }
          window.textObfuscator.selectedMethod = null;
          closeObfuscationModal();
        }
      });
    });
    
      
  
    // Export our functions for future expansion.
    window.textObfuscator = {
      switchText: switchText,
      openObfuscationModal: openObfuscationModal,
      closeObfuscationModal: closeObfuscationModal,
      obfuscationMethods: obfuscationMethods,
      selectedMethod: null, // to store the current method, if needed.
      originalHiddenText: undefined,
      methodHistory: [],
      methodSequence: []
    };
  })();
  