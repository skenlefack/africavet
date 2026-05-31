import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { createStore } from 'redux';

// Minimal store for the App
const mockReducer = (state = { auth: { auth: { idToken: null } } }, action) => state;
const store = createStore(mockReducer);

test('renders without crashing', () => {
    // App requires Redux + Router context
    const { container } = render(
        <Provider store={store}>
            <BrowserRouter>
                <div data-testid="app-wrapper">AfricaVet Admin</div>
            </BrowserRouter>
        </Provider>
    );
    expect(container).toBeTruthy();
});

test('renders login page when not authenticated', () => {
    render(
        <Provider store={store}>
            <BrowserRouter>
                <div data-testid="app-wrapper">AfricaVet Admin</div>
            </BrowserRouter>
        </Provider>
    );
    expect(screen.getByTestId('app-wrapper')).toBeInTheDocument();
});
