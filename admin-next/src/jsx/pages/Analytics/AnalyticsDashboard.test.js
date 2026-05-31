import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock chart.js and react-chartjs-2
jest.mock('chart.js', () => ({
    Chart: { register: jest.fn() },
    CategoryScale: jest.fn(),
    LinearScale: jest.fn(),
    PointElement: jest.fn(),
    LineElement: jest.fn(),
    BarElement: jest.fn(),
    ArcElement: jest.fn(),
    Title: jest.fn(),
    Tooltip: jest.fn(),
    Legend: jest.fn(),
    Filler: jest.fn(),
}));

jest.mock('react-chartjs-2', () => ({
    Line: () => <div data-testid="mock-line-chart">Line Chart</div>,
    Bar: () => <div data-testid="mock-bar-chart">Bar Chart</div>,
    Doughnut: () => <div data-testid="mock-doughnut-chart">Doughnut Chart</div>,
}));

jest.mock('react-svg-worldmap', () => {
    return function MockWorldMap() {
        return <div data-testid="mock-world-map">World Map</div>;
    };
});

// Mock the api module
jest.mock('../../../services/api', () => ({
    api: {
        get: jest.fn().mockResolvedValue({ success: false }),
    },
    getToken: jest.fn().mockReturnValue('mock-token'),
}));

import AnalyticsDashboard from './AnalyticsDashboard';

describe('AnalyticsDashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        const { api } = require('../../../services/api');
        api.get.mockResolvedValue({ success: false });
    });

    test('renders loading state initially', () => {
        render(<AnalyticsDashboard />);
        expect(screen.getByText('Chargement des statistiques...')).toBeInTheDocument();
    });

    test('renders spinner during loading', () => {
        render(<AnalyticsDashboard />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });
});
