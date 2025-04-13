// state.js
export const appState = {
    wordCount: 10,
    currentLearningIndex: 0,
    currentMCIndex: 0,
    currentWritingIndex: 0,
    mcCorrect: 0,
    writingCorrect: 0,
    vocabulary: [],
    mcExercises: [],
    writingExercises: [],
    isLoading: false,
    authToken: null, // Will hold the JWT token
  };
  
  export function resetAppState() {
    appState.currentLearningIndex = 0;
    appState.currentMCIndex = 0;
    appState.currentWritingIndex = 0;
    appState.mcCorrect = 0;
    appState.writingCorrect = 0;
    appState.vocabulary = [];
    appState.mcExercises = [];
    appState.writingExercises = [];
    appState.isLoading = false;
    // Keep wordCount and authToken
  }
  
  export function setAuthToken(token) {
      appState.authToken = token;
      if (token) {
          localStorage.setItem('jwtToken', token); // Persist token
      } else {
          localStorage.removeItem('jwtToken');
      }
  }
  
  export function loadTokenFromStorage() {
      const token = localStorage.getItem('jwtToken');
      if (token) {
          appState.authToken = token;
      }
      return token;
  }
  