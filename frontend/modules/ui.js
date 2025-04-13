// ui.js

// Keep references to all screen elements
export const screens = {
    login: document.getElementById("login-screen"),
    welcome: document.getElementById("welcome-screen"),
    learning: document.getElementById("learning-screen"),
    multipleChoice: document.getElementById("multiple-choice-screen"),
    writing: document.getElementById("writing-screen"),
    results: document.getElementById("results-screen"),
    logoutBtn: document.getElementById("logout-btn"),
};

// Keep references to frequently updated elements (or get them dynamically)
export const elements = {

};

export function initUI() {
    console.log("DEBUG: Initializing UI elements...");
    // Login
    elements.loginBtn = document.getElementById("login-btn");
    elements.usernameInput = document.getElementById("username");
    elements.passwordInput = document.getElementById("password");
    elements.loginError = document.getElementById("login-error");
    // Welcome
    elements.wordCountInput = document.getElementById("word-count");
    elements.startLearningBtn = document.getElementById("start-learning");
    elements.loadingIndicator = document.getElementById("loading-indicator");
    elements.errorMessage = document.getElementById("error-message");
    elements.logoutBtn = document.getElementById("logout-btn"); // Get it here
    // Learning
    elements.progressBar = document.getElementById("progress-bar");
    elements.currentWordEl = document.getElementById("current-word");
    elements.totalWordsEl = document.getElementById("total-words");
    elements.germanWordEl = document.getElementById("german-word");
    elements.playPronunciationBtn = document.getElementById("play-pronunciation");
    elements.translationEl = document.getElementById("translation");
    elements.examplesListEl = document.getElementById("examples-list");
    elements.nextWordBtn = document.getElementById("next-word");
    // MC
    elements.mcProgressBar = document.getElementById("mc-progress-bar");
    elements.mcCurrentEl = document.getElementById("mc-current");
    elements.mcTotalEl = document.getElementById("mc-total");
    elements.sentenceWithBlankEl = document.getElementById("sentence-with-blank");
    elements.optionsContainerEl = document.getElementById("options-container");
    elements.mcFeedbackEl = document.getElementById("mc-feedback");
    elements.mcNextBtn = document.getElementById("mc-next");
    // Writing
    elements.writingProgressBar = document.getElementById("writing-progress-bar");
    elements.writingCurrentEl = document.getElementById("writing-current");
    elements.writingTotalEl = document.getElementById("writing-total");
    elements.englishToTranslateEl = document.getElementById("english-to-translate");
    elements.germanAnswerInput = document.getElementById("german-answer");
    elements.checkAnswerBtn = document.getElementById("check-answer");
    elements.writingFeedbackEl = document.getElementById("writing-feedback");
    elements.writingNextBtn = document.getElementById("writing-next");
    // Results
    elements.wordsLearnedEl = document.getElementById("words-learned");
    elements.mcScoreEl = document.getElementById("mc-score");
    elements.mcQuestionsEl = document.getElementById("mc-questions");
    elements.writingScoreEl = document.getElementById("writing-score");
    elements.writingQuestionsEl = document.getElementById("writing-questions");
    elements.restartBtn = document.getElementById("restart");
    // Audio
    elements.audioPlayer = document.getElementById("audio-player");

    // **Crucial Check:** Log if any essential elements are still null
    for (const key in elements) {
        if (elements[key] === null) {
            console.error(`UI element "${key}" not found during initUI! Check HTML ID.`);
        }
    }
     console.log("DEBUG: UI elements initialized:", elements);
}


export function playAudio(audioData) {
    if (!elements.audioPlayer) {
        console.warn("Audio player element not found.");
        alert("Audio player not setup in HTML."); // User feedback
        return;
    }

    console.log("Attempting to play audio with data:", audioData);

    // Check if audioData looks like a valid URL (simple check)
    // Forvo URLs typically start with http:// or https://
    if (audioData && (audioData.startsWith('http://') || audioData.startsWith('https://'))) {
       console.log(`Audio source set to: ${audioData}`);
       elements.audioPlayer.src = audioData; // Set the URL directly
       elements.audioPlayer.play().catch(e => {
           console.error("Audio playback failed:", e);
           alert("Could not play audio. Check console for errors."); // User feedback
       });
    } else if (audioData && audioData.startsWith('[sound:') && audioData.endsWith(']')) {
        // Fallback for old Anki format if Forvo failed
        const filename = audioData.substring(7, audioData.length - 1);
        console.warn(`Forvo URL not found, falling back to Anki placeholder: ${filename}. Playback not implemented for this.`);
        alert(`Pronunciation file: ${filename} (Direct playback not available)`);
    }
     else {
        console.log("No valid audio URL or data provided.");
        alert("No pronunciation available for this word."); // User feedback
        // Optionally disable the play button here if needed
        // elements.playPronunciationBtn.disabled = true;
    }
}

export function showScreen(screenId) {
    Object.values(screens).forEach((screen) => {
        screen.classList.remove("active");
    });
    if (screens[screenId]) {
        screens[screenId].classList.add("active");
    } else {
        console.error(`Screen with id "${screenId}" not found.`);
    }
}

export function displayLoginError(message) {
    elements.loginError.textContent = message;
    elements.loginError.style.display = message ? "block" : "none";
}

 export function displayWelcomeError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.style.display = message ? "block" : "none";
}

export function showLoading(isLoading) {
    elements.loadingIndicator.style.display = isLoading ? "block" : "none";
    // Optionally disable buttons while loading
    elements.startLearningBtn.disabled = isLoading;
    elements.loginBtn.disabled = isLoading;
}

export function updateLearningScreen(wordData, currentIndex, totalCount) {
    if (!wordData) return;
    const progress = ((currentIndex + 1) / totalCount) * 100;
    elements.progressBar.style.width = `${progress}%`;
    elements.currentWordEl.textContent = currentIndex + 1;
    elements.totalWordsEl.textContent = totalCount;

    elements.germanWordEl.textContent = wordData.german || "[No German Word]";
    elements.translationEl.textContent = wordData.english || "[No Translation]";

    elements.examplesListEl.innerHTML = "";
    if (wordData.sampleSentence) {
        const sentences = wordData.sampleSentence.split(/\.\s+|\?\s+|!\s+/);
        sentences.forEach((sentence) => {
            if (sentence.trim()) {
                const li = document.createElement("li");
                li.textContent = sentence.trim() + ".";
                elements.examplesListEl.appendChild(li);
            }
        });
    } else {
        const li = document.createElement("li");
        li.textContent = "[No Sample Sentence]";
        elements.examplesListEl.appendChild(li);
    }
}

export function updateMCQScreen(mcqData, currentIndex, totalCount, handleOptionClick) {
     if (!mcqData) return;
    const progress = ((currentIndex + 1) / totalCount) * 100;
    elements.mcProgressBar.style.width = `${progress}%`;
    elements.mcCurrentEl.textContent = currentIndex + 1;
    elements.mcTotalEl.textContent = totalCount;

    elements.sentenceWithBlankEl.textContent = mcqData.sentence;

    elements.optionsContainerEl.innerHTML = "";
    mcqData.options.forEach((option) => {
        const button = document.createElement("button");
        button.textContent = option;
        button.classList.add("option-btn");
        // Attach the handler passed from app.js
        button.addEventListener("click", () => handleOptionClick(button, option));
        elements.optionsContainerEl.appendChild(button);
    });

    elements.mcFeedbackEl.style.display = "none";
    elements.mcFeedbackEl.className = "feedback";
    elements.mcNextBtn.style.display = "none";
}

 export function showMCQFeedback(isCorrect, correctAnswer, selectedButton) {
    const allOptions = elements.optionsContainerEl.querySelectorAll(".option-btn");
    allOptions.forEach((btn) => {
        btn.disabled = true;
        if (btn.textContent === correctAnswer) {
            btn.classList.add("correct");
        } else if (btn === selectedButton && !isCorrect) {
            btn.classList.add("incorrect");
        }
    });

    elements.mcFeedbackEl.textContent = isCorrect
        ? "Correct! Well done."
        : `Incorrect. The correct answer is: ${correctAnswer}`;
    elements.mcFeedbackEl.classList.add(isCorrect ? "correct" : "incorrect");
    elements.mcFeedbackEl.style.display = "block";
    elements.mcNextBtn.style.display = "block";
}


export function updateWritingScreen(writingData, currentIndex, totalCount) {
    if (!writingData) return;
    const progress = ((currentIndex + 1) / totalCount) * 100;
    elements.writingProgressBar.style.width = `${progress}%`;
    elements.writingCurrentEl.textContent = currentIndex + 1;
    elements.writingTotalEl.textContent = totalCount;

    elements.englishToTranslateEl.textContent = writingData.english;

    elements.germanAnswerInput.value = "";
    elements.germanAnswerInput.disabled = false;
    elements.checkAnswerBtn.disabled = false;
    elements.writingFeedbackEl.style.display = "none";
    elements.writingFeedbackEl.className = "feedback";
    elements.writingNextBtn.style.display = "none";
    elements.germanAnswerInput.focus();
}

export function showWritingFeedback(isCorrect, correctAnswer) {
    elements.germanAnswerInput.disabled = true;
    elements.checkAnswerBtn.disabled = true;

    elements.writingFeedbackEl.textContent = isCorrect
        ? "Correct! Well done."
        : `Incorrect. The correct answer is: ${correctAnswer}`;
    elements.writingFeedbackEl.classList.add(isCorrect ? "correct" : "incorrect");
    elements.writingFeedbackEl.style.display = "block";
    elements.writingNextBtn.style.display = "block";
}

export function updateResultsScreen(results) {
    elements.wordsLearnedEl.textContent = results.wordCount;
    elements.mcScoreEl.textContent = results.mcCorrect;
    elements.mcQuestionsEl.textContent = results.mcTotal;
    elements.writingScoreEl.textContent = results.writingCorrect;
    elements.writingQuestionsEl.textContent = results.writingTotal;
}

