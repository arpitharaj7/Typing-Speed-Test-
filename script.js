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
                "text-white",
                "text-red-400"
              );
            } else if (character === characterSpan.innerText) {
              characterSpan.classList.add("text-white");
              characterSpan.classList.remove("text-red-400");
            } else {
              characterSpan.classList.remove("text-white");
              characterSpan.classList.add("text-red-400");
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