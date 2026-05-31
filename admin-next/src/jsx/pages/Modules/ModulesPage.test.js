import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ModulesPage from './ModulesPage';

const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ModulesPage', () => {
    test('renders the page title', () => {
        renderWithRouter(<ModulesPage />);
        expect(screen.getByText('Modules')).toBeInTheDocument();
    });

    test('renders all 7 module cards', () => {
        renderWithRouter(<ModulesPage />);
        expect(screen.getByText('Sliders')).toBeInTheDocument();
        expect(screen.getByText('Newsletter')).toBeInTheDocument();
        expect(screen.getByText('Page Builder')).toBeInTheDocument();
        expect(screen.getByText('Annuaire Panafricain')).toBeInTheDocument();
        expect(screen.getByText('E-Learning')).toBeInTheDocument();
        expect(screen.getByText(/Publicit/)).toBeInTheDocument();
        expect(screen.getByText('Analytiques')).toBeInTheDocument();
    });

    test('displays correct active count', () => {
        renderWithRouter(<ModulesPage />);
        expect(screen.getByText('7 modules actifs')).toBeInTheDocument();
    });

    test('renders navigation links for each module', () => {
        renderWithRouter(<ModulesPage />);
        const links = screen.getAllByRole('link', { name: /Accéder/ });
        expect(links).toHaveLength(7);
    });

    test('Analytics card links to /analytics', () => {
        renderWithRouter(<ModulesPage />);
        const analyticsCard = screen.getByText('Analytiques').closest('.card');
        const link = analyticsCard.querySelector('a');
        expect(link).toHaveAttribute('href', '/analytics');
    });
});
