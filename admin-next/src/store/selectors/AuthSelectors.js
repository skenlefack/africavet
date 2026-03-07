export const isAuthenticated = (state) => {
    // Check for token (our backend) or idToken (Firebase legacy)
    if (state.auth.auth.token || state.auth.auth.idToken) return true;
    return false;
};
