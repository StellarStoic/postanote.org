// foundSecrets.js – Trigger sparkle effect when a secret is found
function triggerSparkleEffect() {
    // Avoid running if confetti already triggered (e.g., skip if special triggers present)
    // (If integrating with emojiConfetti, ensure this isn't called when confetti runs)
    
    const duration = 4000; // 4 seconds
    const numSparkles = 111; // number of sparkles to create (adjust as desired)
    
    // Create sparkles
    for (let i = 0; i < numSparkles; i++) {
      const sparkle = document.createElement('div');
      sparkle.classList.add('sparkle');
      // Random position across the viewport
      sparkle.style.top = Math.random() * window.innerHeight + 'px';
      sparkle.style.left = Math.random() * window.innerWidth + 'px';
      document.body.appendChild(sparkle);
    }
    
    // Remove sparkles after animation duration
    setTimeout(() => {
      document.querySelectorAll('.sparkle').forEach(elem => elem.remove());
    }, duration);
  }
  