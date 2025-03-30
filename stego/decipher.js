document.getElementById("decipherButton").addEventListener("click", async function () {
    const inputText = document.getElementById("decipheredInput").value.trim();
    const key = document.getElementById("methodSequenceInput").value.trim();
    const outputEl = document.getElementById("decipheredOutput");

    if (!inputText || !key.trim()) {
      showToast("Please enter both text and a method sequence to decipher.");
      return;
    }

    const rawSeq = key.replace(/mSeq=/i, ''); // optional removal of mSeq=
    const methodSequence = rawSeq
        .split(/[^0-9]+/) // split by any non-digit character (space, dot, dash, comma, etc.)
        .map(s => parseInt(s.trim(), 10)) // convert to numbers
        .filter(n => !isNaN(n)) // remove garbage
        .reverse(); // keep your logic if you want reversed order
    
    if (methodSequence.length === 0) {
      showToast("Invalid or empty method sequence.");
        return;
    }

    if (!window.textObfuscator?.obfuscationMethods) return;

    let decodedText = inputText;
    outputEl.dataset.fullText = inputText;

    // ✅ Immediately show the original encoded message first
    outputEl.textContent = `🔒 Original Cipher:\n${decodedText}`;

    console.log("🔁 Starting reverse method sequence:", methodSequence);
    console.log("📥 Initial obfuscated input:", decodedText);

    // Small pause before starting the steps
    await new Promise(resolve => setTimeout(resolve, 3000));

    for (let num of methodSequence) {
      const method = Object.values(window.textObfuscator.obfuscationMethods).find(m => m.mNumber === num);
      if (!method) {
        console.warn(`❌ No method found for mNumber=${num}`);
        continue;
      }
      const reverse = window.textObfuscator.obfuscationMethods[method.reverseMethod];
      if (!reverse || typeof reverse.func !== "function") {
        console.warn(`❌ No valid reverseMethod for #${num}`);
        continue;
      }
      console.log(`🔄 Applying reverse method [${method.reverseMethod}] for #${num}`);
      decodedText = reverse.func(decodedText);

    // ✔ Check for graceful abort
    if (decodedText === null || decodedText === "") {
      showToast(`Decoding stopped! Method "${method.title}" (#${num}) reported invalid input.\nCheck if your method sequence is correct.`);
      outputEl.textContent += `\n\n🚫 Decoding stopped at: ${method.title}`;
      break; // ⛔ Stop immediately
    }

      console.log("✅ Result after method:", decodedText);
      outputEl.textContent = decodedText;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    displayTruncatedText(outputEl, decodedText, 300);

    document.getElementById("copyDecipheredOutput").style.display = "inline-block";

    if (typeof checkForConfettiTrigger === "function" && checkForConfettiTrigger(decodedText)) {
      // Confetti triggered
    } else if (typeof triggerSparkleEffect === "function") {
      triggerSparkleEffect();
    }
  });