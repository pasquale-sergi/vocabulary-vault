// app.js
import { appState, resetAppState, setAuthToken, loadTokenFromStorage } from './modules/state.js';
import * as api from './modules/api.js';
import * as ui from './modules/ui.js';
import { generateMCExercisesFromBackend, generateWritingExercisesFromBackend } from './modules/exerciseUtils.js';

// --- Authentication Logic ---
async function handleLogin() {
    // ... (keep existing handleLogin function)
     ui.displayLoginError(""); // Clear previous errors
    const username = ui.elements.usernameInput.value.trim();
    const password = ui.elements.passwordInput.value.trim();

    if (!username || !password) {
        ui.displayLoginError("Please enter both username and password.");
        return;
    }

    ui.showLoading(true);
    try {
        const loginResponse = await api.loginUser(username, password);
        if (loginResponse && loginResponse.token) {
            setAuthToken(loginResponse.token);
            console.log("Login successful", loginResponse);
            initializeAppUI(); // Proceed to the main app UI
            // **Optional: Fetch initial data immediately after login if needed**
            // verifyTokenAndFetchInitialData(); // Or just let user click start
        } else {
            throw new Error("Login failed: No token received.");
        }
    } catch (error) {
        console.error("Login failed:", error);
        if (error.status === 401) {
             ui.displayLoginError("Invalid username or password.");
        } else {
             ui.displayLoginError(error.message || "Login failed. Please try again.");
        }
    } finally {
        ui.showLoading(false);
    }
}


function handleLogout() {
    console.log("Logging out...");
    setAuthToken(null); // Clear token from state and localStorage
    resetAppState();    // Clear vocabulary, scores etc.
    // No need to remove listeners explicitly here if showLoginScreen re-adds only login ones
    showLoginScreen();  // Show login screen and setup its listeners
}


// --- NEW: Function to verify token (can be called on load) ---
async function verifyTokenAndFetchInitialData() {
    console.log("Verifying token...");
    // Make a lightweight API call that requires authentication
    // Using fetchVocabulary with count=0 or 1 is one way,
    // ideally you'd have a dedicated '/api/users/me' or '/api/auth/verify' endpoint
    try {
        // Example: Fetch just 1 word to verify auth
        await api.fetchVocabulary(1);
        console.log("Token appears valid.");
        // Token is valid, user is already on the welcome screen.
        // You could potentially pre-fetch more data here if desired.
        return true;
    } catch (error) {
        if (error.status === 401) {
            console.log("Token verification failed (401). Redirecting to login.");
            setAuthToken(null); // Clear invalid token from state and storage
            showLoginScreen(); // Show login and setup listeners
            return false;
        } else {
            // Handle other errors (e.g., network error) - show message on welcome screen
            console.error("Error during token verification:", error);
            ui.displayWelcomeError(`Session check failed: ${error.message}. Please try logging in again.`);
            // Keep user on welcome screen but show error
            return false; // Indicate verification failed
        }
    }
}


// --- Core Application Logic ---
async function startLearningSession() {
    // ... (keep existing startLearningSession function)
    if (appState.isLoading) return;

    resetAppState();
    appState.isLoading = true;
    ui.showLoading(true);
    ui.displayWelcomeError("");

    try {
        appState.wordCount = parseInt(ui.elements.wordCountInput.value) || 10;
        const fetchedVocabulary = await api.fetchVocabulary(appState.wordCount);

        if (!fetchedVocabulary || fetchedVocabulary.length === 0) {
            throw new Error("No vocabulary words were received. Try again later.");
        }
        // ... rest of the function
         appState.vocabulary = fetchedVocabulary;
        appState.wordCount = appState.vocabulary.length;
        appState.mcExercises = generateMCExercisesFromBackend(appState.vocabulary);
        appState.writingExercises = generateWritingExercisesFromBackend(appState.vocabulary);

        console.log("Starting session with:", appState);

        ui.updateLearningScreen(appState.vocabulary[0], 0, appState.wordCount);
        ui.showScreen("learning");

    } catch (error) {
        console.error("Failed to start learning session:", error);
        if (error.status === 401) {
             ui.displayWelcomeError("Your session may have expired. Please log in again.");
             setAuthToken(null);
             setTimeout(showLoginScreen, 2000); // Redirect after delay
        } else {
             ui.displayWelcomeError(`Error: ${error.message}`);
        }
        // Don't switch screen back here, error is shown on welcome
    } finally {
        appState.isLoading = false;
        ui.showLoading(false);
    }
}

// ... (keep other functions: showNextWord, playPronunciation, etc.)
function showNextWord() {
    appState.currentLearningIndex++;
    if (appState.currentLearningIndex < appState.wordCount) {
        const wordData = appState.vocabulary[appState.currentLearningIndex];
        ui.updateLearningScreen(wordData, appState.currentLearningIndex, appState.wordCount);
    } else {
        startMultipleChoiceExercises();
    }
}

function playPronunciation() {
    if (appState.currentLearningIndex < appState.vocabulary.length) {
        const currentWord = appState.vocabulary[appState.currentLearningIndex];
        ui.playAudio(currentWord.audio);
    }
}

function startMultipleChoiceExercises() {
    if (!appState.mcExercises || appState.mcExercises.length === 0) {
        console.log("No MC exercises, skipping to writing.");
        startWritingExercises();
        return;
    }
    appState.currentMCIndex = 0;
    ui.updateMCQScreen(
        appState.mcExercises[0],
        0,
        appState.mcExercises.length,
        handleMCOptionClick
    );
    ui.showScreen("multipleChoice");
}

function handleMCOptionClick(buttonElement, selectedOption) {
    const currentQuestion = appState.mcExercises[appState.currentMCIndex];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    if (isCorrect) {
        appState.mcCorrect++;
    }
    ui.showMCQFeedback(isCorrect, currentQuestion.correctAnswer, buttonElement);
}


function showNextMCQuestion() {
    appState.currentMCIndex++;
    if (appState.currentMCIndex < appState.mcExercises.length) {
        ui.updateMCQScreen(
            appState.mcExercises[appState.currentMCIndex],
            appState.currentMCIndex,
            appState.mcExercises.length,
            handleMCOptionClick
        );
    } else {
        startWritingExercises();
    }
}

function startWritingExercises() {
    if (!appState.writingExercises || appState.writingExercises.length === 0) {
        console.log("No Writing exercises, skipping to results.");
        showResults();
        return;
    }
    appState.currentWritingIndex = 0;
    ui.updateWritingScreen(
        appState.writingExercises[0],
        0,
        appState.writingExercises.length
    );
    ui.showScreen("writing");
}

function checkWritingAnswer() {
    const currentQuestion = appState.writingExercises[appState.currentWritingIndex];
    const userAnswer = ui.elements.germanAnswerInput.value.trim();
    const isCorrect = userAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();

    if (isCorrect) {
        appState.writingCorrect++;
    }
    ui.showWritingFeedback(isCorrect, currentQuestion.correctAnswer);
}

function showNextWritingQuestion() {
    appState.currentWritingIndex++;
    if (appState.currentWritingIndex < appState.writingExercises.length) {
        ui.updateWritingScreen(
            appState.writingExercises[appState.currentWritingIndex],
            appState.currentWritingIndex,
            appState.writingExercises.length
        );
    } else {
        showResults();
    }
}

function showResults() {
    const resultsData = {
        wordCount: appState.wordCount,
        mcCorrect: appState.mcCorrect,
        mcTotal: appState.mcExercises.length,
        writingCorrect: appState.writingCorrect,
        writingTotal: appState.writingExercises.length,
    };
    ui.updateResultsScreen(resultsData);
    ui.showScreen("results");
}

function restartApp() {
    resetAppState();
    ui.showScreen("welcome");
}


// --- Initialization ---
function initializeAppUI() {
    // Now this function assumes ui.elements is already populated
    console.log("Initializing main app UI.");
    // Check if elements are ready before proceeding
    if (!ui.elements.wordCountInput || !ui.elements.startLearningBtn || !ui.elements.logoutBtn) {
        console.error("Cannot initializeAppUI - essential UI elements not found. Was ui.initUI() called?");
        return;
    }

    ui.elements.wordCountInput.value = appState.wordCount;
    ui.showScreen("welcome");

    const welcomeScreen = ui.screens.welcome;
    if (!welcomeScreen.dataset.listenersAttached) {
        console.log("Attaching main app listeners.");
        ui.elements.startLearningBtn.addEventListener("click", startLearningSession);
        ui.elements.nextWordBtn.addEventListener("click", showNextWord);
        ui.elements.playPronunciationBtn.addEventListener("click", playPronunciation);
        ui.elements.mcNextBtn.addEventListener("click", showNextMCQuestion);
        ui.elements.checkAnswerBtn.addEventListener("click", checkWritingAnswer);
        ui.elements.writingNextBtn.addEventListener("click", showNextWritingQuestion);
        ui.elements.restartBtn.addEventListener("click", restartApp);
        ui.elements.germanAnswerInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !ui.elements.germanAnswerInput.disabled) {
                checkWritingAnswer();
            }
        });
        // Listener for logout button
        ui.elements.logoutBtn.addEventListener("click", handleLogout);

        welcomeScreen.dataset.listenersAttached = 'true';
    }
}

function showLoginScreen() {
    // Assumes ui.elements is populated
    if (!ui.elements.loginBtn || !ui.elements.passwordInput) {
        console.error("Cannot showLoginScreen - essential UI elements not found. Was ui.initUI() called?");
        return;
   }
   ui.showScreen("login");
   const loginScreen = ui.screens.login;
   if (!loginScreen.dataset.listenersAttached) {
       console.log("Attaching login listeners.");
       ui.elements.loginBtn.addEventListener("click", handleLogin);
       ui.elements.passwordInput.addEventListener("keypress", (e) => {
           if (e.key === "Enter") {
               handleLogin();
           }
       });
       loginScreen.dataset.listenersAttached = 'true';
   }
    ui.displayWelcomeError("");
}

function initAuthCheck() {
    // Assumes ui.elements is populated
    if (loadTokenFromStorage()) {
        console.log("Token found in storage. Initializing UI and verifying token...");
        initializeAppUI();
        verifyTokenAndFetchInitialData();
    } else {
        console.log("No token found, showing login screen.");
        showLoginScreen();
    }
}

// Start the authentication check when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed.");
    // *** CALL initUI() FIRST ***
    ui.initUI();
    // **************************

    // Now that elements are initialized, proceed with auth check
    initAuthCheck();
});