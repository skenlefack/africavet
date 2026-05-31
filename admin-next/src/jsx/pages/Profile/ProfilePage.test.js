import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfilePage from './ProfilePage';

// Mock the api module
jest.mock('../../../services/api', () => ({
    api: {
        get: jest.fn().mockResolvedValue({
            success: true,
            data: {
                first_name: 'Jean',
                last_name: 'Dupont',
                email: 'jean@test.com',
                phone: '+237600000000',
                bio: 'Vétérinaire',
                avatar: '',
                country: 'Cameroun',
                city: 'Douala',
                preferred_language: 'fr',
                profession: 'Vétérinaire',
                specialization: 'Bovins',
                skills: '["Chirurgie","Vaccination"]',
                years_experience: 10,
                education_level: 'doctorate',
                cv_filename: null
            }
        }),
        put: jest.fn().mockResolvedValue({ success: true }),
        delete: jest.fn().mockResolvedValue({ success: true }),
        upload: jest.fn().mockResolvedValue({ success: true }),
    },
    getToken: jest.fn().mockReturnValue('mock-token'),
    API_BASE_URL: '/api',
}));

describe('ProfilePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Re-setup the mock for each test
        const { api } = require('../../../services/api');
        api.get.mockResolvedValue({
            success: true,
            data: {
                first_name: 'Jean', last_name: 'Dupont',
                email: 'jean@test.com', phone: '+237600000000',
                bio: 'Vétérinaire', avatar: '',
                country: 'Cameroun', city: 'Douala',
                preferred_language: 'fr', profession: 'Vétérinaire',
                specialization: 'Bovins', skills: '["Chirurgie","Vaccination"]',
                years_experience: 10, education_level: 'doctorate',
                cv_filename: null
            }
        });
    });

    test('renders loading state initially', () => {
        render(<ProfilePage />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('renders profile after loading', async () => {
        render(<ProfilePage />);
        await waitFor(() => {
            expect(screen.getByText('Mon Profil')).toBeInTheDocument();
        });
    });

    test('renders all 4 tabs', async () => {
        render(<ProfilePage />);
        await waitFor(() => {
            expect(screen.getByText('Informations')).toBeInTheDocument();
        });
        expect(screen.getByText('Professionnel')).toBeInTheDocument();
        expect(screen.getByText('Notifications')).toBeInTheDocument();
        expect(screen.getByText('Mot de passe')).toBeInTheDocument();
    });

    test('switches to password tab on click', async () => {
        render(<ProfilePage />);
        await waitFor(() => {
            expect(screen.getByText('Informations')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByText('Mot de passe'));
        expect(screen.getByText('Modifier le mot de passe')).toBeInTheDocument();
    });

    test('switches to professional tab on click', async () => {
        render(<ProfilePage />);
        await waitFor(() => {
            expect(screen.getByText('Informations')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByText('Professionnel'));
        expect(screen.getByText('Informations professionnelles')).toBeInTheDocument();
    });
});
