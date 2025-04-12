// App state
const appState = {
    wordCount: 10,
    currentLearningIndex: 0,
    currentMCIndex: 0,
    currentWritingIndex: 0,
    mcCorrect: 0,
    writingCorrect: 0,
    vocabulary: [], // Will be populated from backend
    mcExercises: [], // Will be populated from backend
    writingExercises: [], // Will be populated from backend
  };
  
  // DOM Elements
  const screens = {
    welcome: document.getElementById("welcome-screen"),
    learning: document.getElementById("learning-screen"),
    multipleChoice: document.getElementById("multiple-choice-screen"),
    writing: document.getElementById("writing-screen"),
    results: document.getElementById("results-screen"),
  };
  
  // Welcome Screen Elements
  const wordCountInput = document.getElementById("word-count");
  const startLearningBtn = document.getElementById("start-learning");
  
  // Learning Screen Elements
  const progressBar = document.getElementById("progress-bar");
  const currentWordEl = document.getElementById("current-word");
  const totalWordsEl = document.getElementById("total-words");
  const germanWordEl = document.getElementById("german-word");
  const playPronunciationBtn = document.getElementById("play-pronunciation");
  const translationEl = document.getElementById("translation");
  const examplesListEl = document.getElementById("examples-list");
  const nextWordBtn = document.getElementById("next-word");
  
  // Multiple Choice Screen Elements
  const mcProgressBar = document.getElementById("mc-progress-bar");
  const mcCurrentEl = document.getElementById("mc-current");
  const mcTotalEl = document.getElementById("mc-total");
  const sentenceWithBlankEl = document.getElementById("sentence-with-blank");
  const optionsContainerEl = document.getElementById("options-container");
  const mcFeedbackEl = document.getElementById("mc-feedback");
  const mcNextBtn = document.getElementById("mc-next");
  
  // Writing Screen Elements
  const writingProgressBar = document.getElementById("writing-progress-bar");
  const writingCurrentEl = document.getElementById("writing-current");
  const writingTotalEl = document.getElementById("writing-total");
  const englishToTranslateEl = document.getElementById("english-to-translate");
  const germanAnswerInput = document.getElementById("german-answer");
  const checkAnswerBtn = document.getElementById("check-answer");
  const writingFeedbackEl = document.getElementById("writing-feedback");
  const writingNextBtn = document.getElementById("writing-next");
  
  // Results Screen Elements
  const wordsLearnedEl = document.getElementById("words-learned");
  const mcScoreEl = document.getElementById("mc-score");
  const mcQuestionsEl = document.getElementById("mc-questions");
  const writingScoreEl = document.getElementById("writing-score");
  const writingQuestionsEl = document.getElementById("writing-questions");
  const restartBtn = document.getElementById("restart");
  
  // Mock data (will be replaced with data from your Java backend)
  function generateMockData() {
    // Sample vocabulary words
    const mockVocabulary = [
      {
        german: "das Haus",
        translation: "the house",
        pronunciation: "haus.mp3",
        examples: [
          "Das ist mein Haus. (This is my house.)",
          "Das Haus ist groß. (The house is big.)",
        ],
      },
      {
        german: "die Katze",
        translation: "the cat",
        pronunciation: "katze.mp3",
        examples: [
          "Die Katze schläft. (The cat is sleeping.)",
          "Ich habe eine Katze. (I have a cat.)",
        ],
      },
      {
        german: "der Hund",
        translation: "the dog",
        pronunciation: "hund.mp3",
        examples: [
          "Der Hund bellt. (The dog barks.)",
          "Ich gehe mit dem Hund spazieren. (I'm walking the dog.)",
        ],
      },
      {
        german: "das Buch",
        translation: "the book",
        pronunciation: "buch.mp3",
        examples: [
          "Ich lese ein Buch. (I'm reading a book.)",
          "Das Buch ist interessant. (The book is interesting.)",
        ],
      },
      {
        german: "der Tisch",
        translation: "the table",
        pronunciation: "tisch.mp3",
        examples: [
          "Der Tisch ist aus Holz. (The table is made of wood.)",
          "Das Buch liegt auf dem Tisch. (The book is on the table.)",
        ],
      },
      {
        german: "die Tür",
        translation: "the door",
        pronunciation: "tuer.mp3",
        examples: [
          "Die Tür ist offen. (The door is open.)",
          "Bitte schließ die Tür. (Please close the door.)",
        ],
      },
      {
        german: "das Fenster",
        translation: "the window",
        pronunciation: "fenster.mp3",
        examples: [
          "Das Fenster ist kaputt. (The window is broken.)",
          "Öffne bitte das Fenster. (Please open the window.)",
        ],
      },
      {
        german: "der Stuhl",
        translation: "the chair",
        pronunciation: "stuhl.mp3",
        examples: [
          "Der Stuhl ist bequem. (The chair is comfortable.)",
          "Setz dich auf den Stuhl. (Sit on the chair.)",
        ],
      },
      {
        german: "die Lampe",
        translation: "the lamp",
        pronunciation: "lampe.mp3",
        examples: [
          "Die Lampe ist hell. (The lamp is bright.)",
          "Schalte bitte die Lampe ein. (Please turn on the lamp.)",
        ],
      },
      {
        german: "das Bett",
        translation: "the bed",
        pronunciation: "bett.mp3",
        examples: [
          "Das Bett ist weich. (The bed is soft.)",
          "Ich schlafe in meinem Bett. (I sleep in my bed.)",
        ],
      },
    ];
  
    return {
      vocabulary: mockVocabulary.slice(0, appState.wordCount),
      mcExercises: generateMCExercises(mockVocabulary.slice(0, appState.wordCount)),
      writingExercises: generateWritingExercises(
        mockVocabulary.slice(0, appState.wordCount)
      ),
    };
  }
  
  // Generate multiple choice exercises from vocabulary
  function generateMCExercises(vocabulary) {
    return vocabulary.map((word) => {
      // Create a sentence with a blank where the word should be
      const sentence = word.examples[0].split("(")[0].trim();
      const blankSentence = sentence.replace(word.german, "______");
  
      // Create options (including the correct one and some distractors)
      const options = [word.german];
      
      // Add distractors from other words
      while (options.length < 4 && options.length < vocabulary.length) {
        const randomWord =
          vocabulary[Math.floor(Math.random() * vocabulary.length)].german;
        if (!options.includes(randomWord)) {
          options.push(randomWord);
        }
      }
  
      // Shuffle options
      const shuffledOptions = options.sort(() => Math.random() - 0.5);
  
      return {
        sentence: blankSentence,
        options: shuffledOptions,
        correctAnswer: word.german,
      };
    });
  }
  
  // Generate writing exercises from vocabulary
  function generateWritingExercises(vocabulary) {
    return vocabulary.map((word) => {
      return {
        english: word.translation,
        correctAnswer: word.german,
      };
    });
  }
  
  // Initialize the app
  function initApp() {
    // Set default word count
    wordCountInput.value = appState.wordCount;
  
    // Event listeners
    startLearningBtn.addEventListener("click", startLearning);
    nextWordBtn.addEventListener("click", showNextWord);
    playPronunciationBtn.addEventListener("click", playPronunciation);
    mcNextBtn.addEventListener("click", showNextMCQuestion);
    checkAnswerBtn.addEventListener("click", checkWritingAnswer);
    writingNextBtn.addEventListener("click", showNextWritingQuestion);
    restartBtn.addEventListener("click", restartApp);
  
    // Enter key for writing exercise
    germanAnswerInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        checkWritingAnswer();
      }
    });
  }
  
  // Switch between screens
  function showScreen(screenId) {
    Object.values(screens).forEach((screen) => {
      screen.classList.remove("active");
    });
    screens[screenId].classList.add("active");
  }
  
  // Start the learning process
  function startLearning() {
    appState.wordCount = parseInt(wordCountInput.value);
    
    // In a real app, you would fetch data from your Java backend here
    const mockData = generateMockData();
    appState.vocabulary = mockData.vocabulary;
    appState.mcExercises = mockData.mcExercises;
    appState.writingExercises = mockData.writingExercises;
    
    // Reset state
    appState.currentLearningIndex = 0;
    appState.currentMCIndex = 0;
    appState.currentWritingIndex = 0;
    appState.mcCorrect = 0;
    appState.writingCorrect = 0;
    
    // Update UI
    totalWordsEl.textContent = appState.wordCount;
    mcTotalEl.textContent = appState.wordCount;
    writingTotalEl.textContent = appState.wordCount;
    
    // Show first word
    showCurrentWord();
    
    // Switch to learning screen
    showScreen("learning");
  }
  
  // Display the current word in learning mode
  function showCurrentWord() {
    const currentWord = appState.vocabulary[appState.currentLearningIndex];
    
    // Update progress
    const progress = ((appState.currentLearningIndex + 1) / appState.wordCount) * 100;
    progressBar.style.width = `${progress}%`;
    currentWordEl.textContent = appState.currentLearningIndex + 1;
    
    // Update word content
    germanWordEl.textContent = currentWord.german;
    translationEl.textContent = currentWord.translation;
    
    // Update examples
    examplesListEl.innerHTML = "";
    currentWord.examples.forEach((example) => {
      const li = document.createElement("li");
      li.textContent = example;
      examplesListEl.appendChild(li);
    });
  }
  
  // Move to the next word in learning mode
  function showNextWord() {
    appState.currentLearningIndex++;
    
    if (appState.currentLearningIndex < appState.wordCount) {
      showCurrentWord();
    } else {
      // Start multiple choice exercises
      startMultipleChoiceExercises();
    }
  }
  
  // Play pronunciation audio
  function playPronunciation() {
    const currentWord = appState.vocabulary[appState.currentLearningIndex];
    
    // In a real app, you would play the audio file here
    console.log(`Playing pronunciation: ${currentWord.pronunciation}`);
    
    // Mock audio playback with an alert for this demo
    alert(`Playing pronunciation for: ${currentWord.german}`);
  }
  
  // Start multiple choice exercises
  function startMultipleChoiceExercises() {
    showScreen("multipleChoice");
    showCurrentMCQuestion();
  }
  
  // Display the current multiple choice question
  function showCurrentMCQuestion() {
    const currentQuestion = appState.mcExercises[appState.currentMCIndex];
    
    // Update progress
    const progress = ((appState.currentMCIndex + 1) / appState.wordCount) * 100;
    mcProgressBar.style.width = `${progress}%`;
    mcCurrentEl.textContent = appState.currentMCIndex + 1;
    
    // Update question content
    sentenceWithBlankEl.textContent = currentQuestion.sentence;
    
    // Create option buttons
    optionsContainerEl.innerHTML = "";
    currentQuestion.options.forEach((option) => {
      const button = document.createElement("button");
      button.textContent = option;
      button.classList.add("option-btn");
      button.addEventListener("click", () => selectMCOption(button, option));
      optionsContainerEl.appendChild(button);
    });
    
    // Reset UI state
    mcFeedbackEl.style.display = "none";
    mcFeedbackEl.className = "feedback";
    mcNextBtn.style.display = "none";
  }
  
  // Handle multiple choice option selection
  function selectMCOption(buttonElement, selectedOption) {
    const currentQuestion = appState.mcExercises[appState.currentMCIndex];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    
    // Disable all options
    const allOptions = optionsContainerEl.querySelectorAll(".option-btn");
    allOptions.forEach((btn) => {
      btn.disabled = true;
      
      // Mark correct and incorrect answers
      if (btn.textContent === currentQuestion.correctAnswer) {
        btn.classList.add("correct");
      } else if (btn === buttonElement && !isCorrect) {
        btn.classList.add("incorrect");
      }
    });
    
    // Show feedback
    mcFeedbackEl.textContent = isCorrect
      ? "Correct! Well done."
      : `Incorrect. The correct answer is: ${currentQuestion.correctAnswer}`;
    mcFeedbackEl.classList.add(isCorrect ? "correct" : "incorrect");
    mcFeedbackEl.style.display = "block";
    
    // Update score
    if (isCorrect) {
      appState.mcCorrect++;
    }
    
    // Show next button
    mcNextBtn.style.display = "block";
  }
  
  // Move to the next multiple choice question
  function showNextMCQuestion() {
    appState.currentMCIndex++;
    
    if (appState.currentMCIndex < appState.wordCount) {
      showCurrentMCQuestion();
    } else {
      // Start writing exercises
      startWritingExercises();
    }
  }
  
  // Start writing exercises
  function startWritingExercises() {
    showScreen("writing");
    showCurrentWritingQuestion();
  }
  
  // Display the current writing question
  function showCurrentWritingQuestion() {
    const currentQuestion = appState.writingExercises[appState.currentWritingIndex];
    
    // Update progress
    const progress =
      ((appState.currentWritingIndex + 1) / appState.wordCount) * 100;
    writingProgressBar.style.width = `${progress}%`;
    writingCurrentEl.textContent = appState.currentWritingIndex + 1;
    
    // Update question content
    englishToTranslateEl.textContent = currentQuestion.english;
    
    // Reset UI state
    germanAnswerInput.value = "";
    germanAnswerInput.disabled = false;
    checkAnswerBtn.disabled = false;
    writingFeedbackEl.style.display = "none";
    writingFeedbackEl.className = "feedback";
    writingNextBtn.style.display = "none";
    
    // Focus on input
    germanAnswerInput.focus();
  }
  
  // Check the user's answer in writing exercise
  function checkWritingAnswer() {
    const currentQuestion =
      appState.writingExercises[appState.currentWritingIndex];
    const userAnswer = germanAnswerInput.value.trim();
    
    // Simple exact match check (in a real app, you might want more sophisticated checking)
    const isCorrect = userAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    
    // Disable input
    germanAnswerInput.disabled = true;
    checkAnswerBtn.disabled = true;
    
    // Show feedback
    writingFeedbackEl.textContent = isCorrect
      ? "Correct! Well done."
      : `Incorrect. The correct answer is: ${currentQuestion.correctAnswer}`;
    writingFeedbackEl.classList.add(isCorrect ? "correct" : "incorrect");
    writingFeedbackEl.style.display = "block";
    
    // Update score
    if (isCorrect) {
      appState.writingCorrect++;
    }
    
    // Show next button
    writingNextBtn.style.display = "block";
  }
  
  // Move to the next writing question
  function showNextWritingQuestion() {
    appState.currentWritingIndex++;
    
    if (appState.currentWritingIndex < appState.wordCount) {
      showCurrentWritingQuestion();
    } else {
      // Show results
      showResults();
    }
  }
  
  // Show the results screen
  function showResults() {
    // Update results
    wordsLearnedEl.textContent = appState.wordCount;
    mcScoreEl.textContent = appState.mcCorrect;
    mcQuestionsEl.textContent = appState.wordCount;
    writingScoreEl.textContent = appState.writingCorrect;
    writingQuestionsEl.textContent = appState.wordCount;
    
    // Show results screen
    showScreen("results");
  }
  
  // Restart the app
  function restartApp() {
    showScreen("welcome");
  }
  
  // Initialize the app when the page loads
  document.addEventListener("DOMContentLoaded", initApp);
  