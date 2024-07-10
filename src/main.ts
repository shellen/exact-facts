import confetti from "canvas-confetti";

document.addEventListener("DOMContentLoaded", () => {
  const questionElement = document.getElementById("question") as HTMLDivElement;
  const nicknameInput = document.getElementById(
    "nickname-input"
  ) as HTMLInputElement;
  const guessInput = document.getElementById("guess-input") as HTMLInputElement;
  const guessButtons = document.getElementById(
    "guess-buttons"
  ) as HTMLDivElement;
  const submitGuessButton = document.getElementById(
    "submit-guess"
  ) as HTMLButtonElement;
  const guessesElement = document.getElementById("guesses") as HTMLDivElement;
  const revealAnswerButton = document.getElementById(
    "reveal-answer"
  ) as HTMLButtonElement;
  const newQuestionButton = document.getElementById(
    "new-question"
  ) as HTMLButtonElement;
  const correctAnswerElement = document.getElementById(
    "correct-answer"
  ) as HTMLDivElement;
  const overButton = document.getElementById(
    "over-button"
  ) as HTMLButtonElement;
  const underButton = document.getElementById(
    "under-button"
  ) as HTMLButtonElement;
  const exactButton = document.getElementById(
    "exact-button"
  ) as HTMLButtonElement;
  const playButton = document.getElementById(
    "play-button"
  ) as HTMLButtonElement;
  const aboutButton = document.getElementById(
    "about-button"
  ) as HTMLButtonElement;
  const playModal = document.getElementById("play-modal") as HTMLDivElement;
  const aboutModal = document.getElementById("about-modal") as HTMLDivElement;
  const closePlayButton = document.getElementById(
    "close-play"
  ) as HTMLButtonElement;
  const closeAboutButton = document.getElementById(
    "close-about"
  ) as HTMLButtonElement;

  interface Question {
    question: string;
    answer: number;
  }

  interface Guess {
    nickname: string;
    guess: string;
    result: string;
  }

  let questions: Question[] = [];
  let currentQuestion: Question | null = null;
  let guesses: Guess[] = [];
  let initialGuess: string | null = null;

  function fetchQuestions() {
    fetch("/questions.json")
      .then((response) => response.json())
      .then((data) => {
        questions = data;
        displayQuestion();
      })
      .catch((error) => console.error("Error fetching questions:", error));
  }

  function getRandomQuestion(): Question {
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
  }

  function displayQuestion() {
    currentQuestion = getRandomQuestion();
    if (!currentQuestion) {
      questionElement.textContent = "No questions available.";
      return;
    }
    questionElement.textContent = currentQuestion.question;
    nicknameInput.value = "";
    guessInput.value = "";
    guessesElement.innerHTML = "";
    correctAnswerElement.classList.add("hidden");
    guesses = [];
    revealAnswerButton.classList.add("hidden");
    guessInput.classList.remove("hidden");
    guessButtons.classList.add("hidden");
    submitGuessButton.classList.remove("hidden");
    initialGuess = null;
  }

  function displayGuesses() {
    guessesElement.innerHTML = "";
    guesses.forEach((guess) => {
      const guessElement = document.createElement("div");
      if (guess.result) {
        guessElement.textContent = `${guess.nickname} thinks it's ${guess.result}`;
      } else {
        guessElement.textContent = `${guess.nickname} guessed ${guess.guess}`;
      }
      guessesElement.appendChild(guessElement);
    });
  }

  function addGuess(result: string) {
    const nickname = nicknameInput.value || `User ${guesses.length + 1}`;
    guesses.push({ nickname, guess: initialGuess as string, result });
    nicknameInput.value = "";
    displayGuesses();
  }

  submitGuessButton.addEventListener("click", () => {
    initialGuess = guessInput.value;
    if (initialGuess === "") return;

    const nickname = nicknameInput.value || `User 1`;
    guesses.push({ nickname, guess: initialGuess, result: "" });

    displayGuesses();

    guessInput.classList.add("hidden");
    guessButtons.classList.remove("hidden");
    submitGuessButton.classList.add("hidden");
    revealAnswerButton.classList.remove("hidden");
    nicknameInput.value = ""; // Clear the name field
  });

  overButton.addEventListener("click", () => addGuess("OVER"));
  underButton.addEventListener("click", () => addGuess("UNDER"));
  exactButton.addEventListener("click", () => addGuess("EXACT"));

  revealAnswerButton.addEventListener("click", () => {
    if (!currentQuestion) return;

    correctAnswerElement.textContent = `The correct answer is: ${currentQuestion.answer}`;
    correctAnswerElement.classList.remove("hidden");

    let correctGuesses = false;
    guesses.forEach((guess, index) => {
      if (
        (guess.result === "EXACT" &&
          Number(guess.guess) === currentQuestion!.answer) ||
        (guess.result === "OVER" &&
          Number(guess.guess) > currentQuestion!.answer) ||
        (guess.result === "UNDER" &&
          Number(guess.guess) < currentQuestion!.answer)
      ) {
        const guessElement = document.createElement("div");
        guessElement.textContent = `${guess.nickname || "User"} was correct!`;
        guessElement.classList.add("text-green-500");
        guessesElement.appendChild(guessElement);
        correctGuesses = true;
      }
      // Check if the initial guess is correct
      if (index === 0 && Number(guess.guess) === currentQuestion!.answer) {
        const initialGuessElement = document.createElement("div");
        initialGuessElement.textContent = `${
          guess.nickname || "User"
        } was correct!`;
        initialGuessElement.classList.add("text-green-500");
        guessesElement.appendChild(initialGuessElement);
        correctGuesses = true;
      }
    });

    // Trigger fireworks if there are correct guesses
    if (correctGuesses) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    // Hide the Over, Under, and Exact buttons, and the name input field
    guessButtons.classList.add("hidden");
    nicknameInput.classList.add("hidden");
  });

  newQuestionButton.addEventListener("click", () => {
    displayQuestion();
  });

  // Display the first question immediately on page load
  fetchQuestions();

  // How to Play modal functionality
  playButton.addEventListener("click", () => {
    playModal.classList.remove("hidden");
  });

  closePlayButton.addEventListener("click", () => {
    playModal.classList.add("hidden");
  });

  // About modal functionality
  aboutButton.addEventListener("click", () => {
    aboutModal.classList.remove("hidden");
  });

  closeAboutButton.addEventListener("click", () => {
    aboutModal.classList.add("hidden");
  });
});
