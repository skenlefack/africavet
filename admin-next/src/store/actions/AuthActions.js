import {
    formatError,
    login,
    runLogoutTimer,
    saveTokenInLocalStorage,
    signUp,
} from '../../services/AuthService';

export const SIGNUP_CONFIRMED_ACTION = '[signup action] confirmed signup';
export const SIGNUP_FAILED_ACTION = '[signup action] failed signup';
export const LOGIN_CONFIRMED_ACTION = '[login action] confirmed login';
export const LOGIN_FAILED_ACTION = '[login action] failed login';
export const LOADING_TOGGLE_ACTION = '[Loading action] toggle loading';
export const LOGOUT_ACTION = '[Logout action] logout action';

export function signupAction(userData, navigate) {
    return (dispatch) => {
        signUp(userData)
            .then((response) => {
                const data = response.data;
                if (data.success) {
                    saveTokenInLocalStorage(data);
                    runLogoutTimer(dispatch, 86400 * 1000, navigate);
                    dispatch(confirmedSignupAction(data));
                    navigate('/dashboard');
                } else {
                    dispatch(signupFailedAction(data.message));
                }
            })
            .catch((error) => {
                const errorMessage = formatError(error);
                dispatch(signupFailedAction(errorMessage));
            });
    };
}

export function Logout(navigate) {
    localStorage.removeItem('userDetails');
    localStorage.removeItem('token');
    if (navigate) {
        navigate('/login');
    }
    return {
        type: LOGOUT_ACTION,
    };
}

export function loginAction(email, password, navigate) {
    return (dispatch) => {
        login(email, password)
            .then((response) => {
                const res = response.data;
                // API returns: { success: true, data: { token, user } }
                const tokenData = res.data || res;

                if (res.success && tokenData.token) {
                    // Structure the token details
                    const tokenDetails = {
                        token: tokenData.token,
                        user: tokenData.user,
                        permissions: tokenData.permissions || [],
                        expiresIn: 86400, // 24 hours
                    };
                    saveTokenInLocalStorage(tokenDetails);
                    runLogoutTimer(dispatch, 86400 * 1000, navigate);
                    dispatch(loginConfirmedAction(tokenDetails));
                    navigate('/dashboard');
                } else {
                    dispatch(loginFailedAction(res.message || 'Échec de la connexion'));
                }
            })
            .catch((error) => {
                const errorMessage = formatError(error);
                dispatch(loginFailedAction(errorMessage));
            });
    };
}

export function loginFailedAction(data) {
    return {
        type: LOGIN_FAILED_ACTION,
        payload: data,
    };
}

export function loginConfirmedAction(data) {
    return {
        type: LOGIN_CONFIRMED_ACTION,
        payload: data,
    };
}

export function confirmedSignupAction(payload) {
    return {
        type: SIGNUP_CONFIRMED_ACTION,
        payload,
    };
}

export function signupFailedAction(message) {
    return {
        type: SIGNUP_FAILED_ACTION,
        payload: message,
    };
}

export function loadingToggleAction(status) {
    return {
        type: LOADING_TOGGLE_ACTION,
        payload: status,
    };
}
