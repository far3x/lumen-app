const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
    if (response.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(new Error('Unauthorized'));
    }
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Server error: ${response.status}`);
    }
    return response.json();
};

export const api = {
    signup: (username, password, confirm_password) => 
        fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, confirm_password })
        }).then(handleResponse),

    login: (formData) => 
        fetch('/api/token', {
            method: 'POST',
            body: formData
        }).then(handleResponse),

    getSerialPorts: () => 
        fetch('/api/ports', { headers: getAuthHeaders() }).then(handleResponse),
    
    // Clears the LOCAL database
    clearReadings: () =>
        fetch('/api/readings/clear', {
            method: 'POST',
            headers: getAuthHeaders()
        }).then(handleResponse),
    
    // --- NEW: Function to clear the PUBLIC sound table ---
    clearPublicSoundReadings: () =>
        fetch('/api/public-sound/clear', {
            method: 'POST',
            headers: getAuthHeaders()
        }).then(handleResponse),

    getAnalytics: () => {
        const controller = new AbortController();
        // Set a 10-second timeout for the request
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        return fetch('/api/analytics/sensors', {
            headers: getAuthHeaders(),
            signal: controller.signal // Pass the AbortSignal to fetch
        })
        .then(handleResponse) // Process the response normally if it succeeds
        .catch(error => {
            // If the error is an AbortError, it means our timeout was triggered
            if (error.name === 'AbortError') {
                throw new Error('Le service de données publiques est indisponible ou met trop de temps à répondre. Veuillez réessayer plus tard.');
            }
            // Re-throw any other errors (e.g., from handleResponse)
            throw error;
        })
        .finally(() => {
            // Always clear the timeout, whether the request succeeded, failed, or was aborted
            clearTimeout(timeoutId);
        });
    }
};