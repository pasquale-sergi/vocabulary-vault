// api.js
import { API_BASE_URL } from './config.js';
import { appState } from './state.js'; // To get the token

async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers, // Allow overriding headers
    };

    // Add Authorization header if token exists
    if (appState.authToken) {
        headers['Authorization'] = `Bearer ${appState.authToken}`;
    }

    const config = {
        ...options,
        headers: headers,
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            let errorMsg = `API Error: ${response.status} ${response.statusText}`;
            let errorData = null;
            try {
                // Try to parse error response from backend
                errorData = await response.json();
                errorMsg = errorData.message || errorData.error || errorMsg;
            } catch (e) {
                // Ignore if response body isn't JSON or parsing fails
            }
            console.error("API Error Response:", response, errorData);
            // Throw an error object that includes status and potential backend message
            const error = new Error(errorMsg);
            error.status = response.status;
            error.data = errorData;
            throw error;
        }

        // Handle cases with no content (e.g., 204 No Content)
        if (response.status === 204) {
            return null;
        }

        // Assume JSON response for other successful requests
        return await response.json();

    } catch (error) {
        console.error(`Fetch failed for ${url}:`, error);
        // Re-throw the error so the calling function can handle it
        // Include status if available from our custom error
        throw error;
    }
}

// Specific API functions
export async function loginUser(username, password) {
    return request('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
    // Expected response: { token: "...", id: ..., username: ..., email: ... }
}

export async function fetchVocabulary(count) {
    return request(`/api/vocabulary/new-words?count=${count}`, {
        method: 'GET',
    });
    // Expected response: Array of VocabularyItem objects
}

// Add other API functions here (e.g., signup) if needed
