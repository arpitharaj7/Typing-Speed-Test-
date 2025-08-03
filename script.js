const quoteDisplayElement = document.getElementById("quote-display");
const quoteInputElement = document.getElementById("quote-input");
const timerElement = document.getElementById("timer");
const wpmElement = document.getElementById("wpm");
const accuracyElement = document.getElementById("accuracy");
const restartButton = document.getElementById("restart-btn");
const startOverlay = document.getElementById("start-overlay");

const QUOTE_API_URL = "https://dummyjson.com/quotes/random";

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
  quote.split("").forEach((character) => {
    const characterSpan = document.createElement("span");
    characterSpan.innerText = character;
    quoteDisplayElement.appendChild(characterSpan);
  });
  quoteInputElement.value = null;
  resetGame();
}

quoteInputElement.addEventListener("input", () => {
  const arrayQuote = quoteDisplayElement.querySelectorAll("span");
  const arrayValue = quoteInputElement.value.split("");
  totalTyped = arrayValue.length;

  if (totalTyped === 1 && !startTime) {
    startTimer();
  }

  let correct = true;
  errors = 0;

  arrayQuote.forEach((characterSpan, index) => {
    const character = arrayValue[index];
    if (character == null) {
      characterSpan.classList.remove(
        "text-emerald-600",
        "text-red-500",
        "bg-emerald-100",
        "bg-red-100"
      );
      correct = false;
    } else if (character === characterSpan.innerText) {
      characterSpan.classList.add("text-emerald-600", "bg-emerald-100");
      characterSpan.classList.remove("text-red-500", "bg-red-100");
    } else {
      characterSpan.classList.remove("text-emerald-600", "bg-emerald-100");
      characterSpan.classList.add("text-red-500", "bg-red-100");
      correct = false;
      errors++;
    }
  });

  if (arrayValue.length === arrayQuote.length) {
    endGame();
  }
});

startOverlay.addEventListener("click", () => {
  startOverlay.style.display = "none";
  quoteDisplayElement.classList.remove("invisible");
  quoteInputElement.focus();
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

function endGame() {
  clearInterval(timer);
  const elapsedTime = getTimerTime();

  const wpm = Math.round(totalTyped / 5 / (elapsedTime / 60));
  wpmElement.innerText = wpm;

  const accuracy = Math.round(((totalTyped - errors) / totalTyped) * 100);
  accuracyElement.innerText = accuracy;

  quoteInputElement.disabled = true;

  setTimeout(() => {
    alert(`Great job! You typed at ${wpm} WPM with ${accuracy}% accuracy!`);
  }, 500);
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
}

restartButton.addEventListener("click", renderNewQuote);

renderNewQuote();
