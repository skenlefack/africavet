import axios from 'axios';
import Swal from "sweetalert2";
import {
    loginConfirmedAction,
    Logout,
} from '../store/actions/AuthActions';

const API_URL = process.env.REACT_APP_API_URL || '/api';

export function signUp(userData) {
    return axios.post(`${API_URL}/auth/register`, userData);
}

export function login(email, password) {
    return axios.post(`${API_URL}/auth/login`, { email, password });
}

export function formatError(errorResponse) {
    const message = errorResponse?.response?.data?.message || errorResponse?.message || 'Une erreur est survenue';

    Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: message,
    });

    return message;
}

export function saveTokenInLocalStorage(tokenDetails) {
    // Token expires in 24 hours by default
    const expiresIn = tokenDetails.expiresIn || 86400;
    tokenDetails.expireDate = new Date(new Date().getTime() + expiresIn * 1000);
    localStorage.setItem('userDetails', JSON.stringify(tokenDetails));
    localStorage.setItem('token', tokenDetails.token);
}

export function getToken() {
    return localStorage.getItem('token');
}

export function runLogoutTimer(dispatch, timer, navigate) {
    setTimeout(() => {
        dispatch(Logout(navigate));
    }, timer);
}

export function checkAutoLogin(dispatch, navigate) {
    const tokenDetailsString = localStorage.getItem('userDetails');

    if (!tokenDetailsString) {
        dispatch(Logout(navigate));
        return;
    }

    let tokenDetails;
    try {
        tokenDetails = JSON.parse(tokenDetailsString);
    } catch {
        dispatch(Logout(navigate));
        return;
    }

    const expireDate = new Date(tokenDetails.expireDate);
    const todaysDate = new Date();

    if (todaysDate > expireDate) {
        dispatch(Logout(navigate));
        return;
    }

    dispatch(loginConfirmedAction(tokenDetails));

    const timer = expireDate.getTime() - todaysDate.getTime();
    runLogoutTimer(dispatch, timer, navigate);
}

export function isLogin() {
    const tokenDetailsString = localStorage.getItem('userDetails');
    return !!tokenDetailsString;
}

// Axios instance with token
export const axiosInstance = axios.create({
    baseURL: API_URL,
});

axiosInstance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('userDetails');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
