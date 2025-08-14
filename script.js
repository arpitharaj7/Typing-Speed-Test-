const quoteDisplayElement = document.getElementById("quote-display");
const quoteInputElement = document.getElementById("quote-input");
const timerElement = document.getElementById("timer");
const wpmElement = document.getElementById("wpm");
const accuracyElement = document.getElementById("accuracy");
const restartButton = document.getElementById("restart-btn");
const startOverlay = document.getElementById("start-overlay");
const resultsModal = document.getElementById("results-modal");
const modalContent = document.getElementById("modal-content");
const modalWpm = document.getElementById("modal-wpm");
const modalAccuracy = document.getElementById("modal-accuracy");
const modalTryAgain = document.getElementById("modal-try-again");
const modalClose = document.getElementById("modal-close");

const QUOTE_API_URL = "https://dummyjson.com/quotes/random";

//Transition for "How fast can you type? -> Show me what you got"
const subtitle = document.getElementById("subtitle");
function changeSubtitle(newText) {
  gsap.to(subtitle, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      subtitle.textContent = newText;
      gsap.to(subtitle, { opacity: 1, duration: 0.5 });
    }
  });
}
setTimeout(() => {
  changeSubtitle("Show me what you got");
}, 3000);


let timer;
let startTime;
let errors = 0;
let totalTyped = 0;

async function getRandomQuote() {
  try {
    const response = await fetch(QUOTE_API_URL);
    const data = await response.json();
    return data.quote;
  } catch (error) {
    console.error("Error fetching quote:", error);
    return "Mr. and Mrs. Dursley, of number four, Privet Drive, were proud to say that they were perfectly normal, thank you very much. They were the last people you'd expect to be involved in anything strange or mysterious, because they just didn't hold with such nonsense.";
  }
}

async function renderNewQuote() {
  const quote = await getRandomQuote();
  quoteDisplayElement.innerHTML = "";

  // Animate fade-in for new quote
  quoteDisplayElement.style.opacity = 0;

  quote.split("").forEach((character) => {
    const characterSpan = document.createElement("span");
    characterSpan.innerText = character;
    quoteDisplayElement.appendChild(characterSpan);
  });

  quoteDisplayElement.style.transition = "opacity 0.4s ease";
  requestAnimationFrame(() => {
    quoteDisplayElement.style.opacity = 1;
  });

  quoteInputElement.value = null;
  resetGame();
}

quoteInputElement.addEventListener("input", () => {
  const arrayQuote = quoteDisplayElement.querySelectorAll("span");
  let arrayValue = quoteInputElement.value.split("");

  // Prevent input overflow and preserve cursor position
  if (arrayValue.length > arrayQuote.length) {
    const cursorPos = quoteInputElement.selectionStart - (arrayValue.length - arrayQuote.length);
    arrayValue = arrayValue.slice(0, arrayQuote.length);
    quoteInputElement.value = arrayValue.join("");
    quoteInputElement.setSelectionRange(cursorPos, cursorPos);
  }

  totalTyped = arrayValue.length;

  if (totalTyped === 1 && !startTime) {
    startTimer();
  }

  errors = 0;

  arrayQuote.forEach((characterSpan, index) => {
    const character = arrayValue[index];
    characterSpan.classList.remove("bg-blue-500/30"); // remove old cursor highlight

    if (character == null) {
      characterSpan.classList.remove("text-white", "text-red-400");
    } else if (character === characterSpan.innerText) {
      characterSpan.classList.add("text-white");
      characterSpan.classList.remove("text-red-400");
    } else {
      characterSpan.classList.remove("text-white");
      characterSpan.classList.add("text-red-400");
      errors++;
    }

    // Highlight current cursor position
    if (index === arrayValue.length) {
      characterSpan.classList.add("bg-blue-500/30");
    }
  });

  if (arrayValue.length === arrayQuote.length) {
    endGame();
  }
});

// Allow overlay to hide when clicking
startOverlay.addEventListener("click", () => {
  startOverlay.style.display = "none";
  quoteDisplayElement.classList.remove("invisible");
  quoteInputElement.focus();
});

// Allow overlay to hide when pressing any key
document.addEventListener("keydown", () => {
  if (startOverlay.style.display !== "none") {
    startOverlay.style.display = "none";
    quoteDisplayElement.classList.remove("invisible");
    quoteInputElement.focus();
  }
});

function startTimer() {
  timerElement.innerText = 0;
  startTime = new Date();

  timer = setInterval(() => {
    timerElement.innerText = getTimerTime();
  }, 1000);
}

function getTimerTime() {
  return Math.floor((new Date() - startTime) / 1000);
}

function showModal(wpm, accuracy) {
  modalWpm.innerText = wpm;
  modalAccuracy.innerText = accuracy + "%";

  resultsModal.classList.remove("opacity-0", "pointer-events-none");
  resultsModal.classList.add("opacity-100");
  modalContent.classList.remove("scale-75");
  modalContent.classList.add("scale-100");
}

function hideModal() {
  resultsModal.classList.add("opacity-0", "pointer-events-none");
  resultsModal.classList.remove("opacity-100");
  modalContent.classList.add("scale-75");
  modalContent.classList.remove("scale-100");
}

function endGame() {
  clearInterval(timer);
  const elapsedTime = getTimerTime();

  const wpm = Math.round(totalTyped / 5 / (elapsedTime / 60));
  const accuracy = Math.round(((totalTyped - errors) / totalTyped) * 100);

  quoteInputElement.disabled = true;

  wpmElement.innerText = "0";
  accuracyElement.innerText = "0";

  const stats = { w: 0, a: 0 };
  if (typeof gsap !== "undefined") {
    gsap.to(stats, {
      w: wpm,
      a: accuracy,
      duration: 0.8,
      ease: "power2.out",
      onUpdate() {
        wpmElement.innerText = Math.round(stats.w);
        accuracyElement.innerText = Math.round(stats.a);
      },
      onComplete() {
        wpmElement.innerText = wpm;
        accuracyElement.innerText = accuracy;
      }
    });
  } else {
    wpmElement.innerText = wpm;
    accuracyElement.innerText = accuracy;
  }

  setTimeout(() => {
    showModal(wpm, accuracy);
  }, 1000);
}

function resetGame() {
  clearInterval(timer);
  startTime = null;
  timerElement.innerText = 0;
  wpmElement.innerText = 0;
  accuracyElement.innerText = 0;
  quoteInputElement.disabled = false;
  quoteInputElement.value = "";
  startOverlay.style.display = "flex";
  quoteDisplayElement.classList.add("invisible");
  hideModal();
  if (typeof gsap !== "undefined") {
    gsap.set([wpmElement, accuracyElement], { clearProps: "all" });
  }

  // Autofocus input
  quoteInputElement.setAttribute("inputmode", "text");
  quoteInputElement.setAttribute("autocorrect", "off");
  quoteInputElement.focus();
}

// Event listeners for modal
modalClose.addEventListener("click", hideModal);
modalTryAgain.addEventListener("click", () => {
  hideModal();
  renderNewQuote();
});

// Close modal when clicking outside
resultsModal.addEventListener("click", (e) => {
  if (e.target === resultsModal) {
    hideModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !resultsModal.classList.contains("opacity-0")) {
    hideModal();
  }
});

restartButton.addEventListener("click", renderNewQuote);

renderNewQuote();
