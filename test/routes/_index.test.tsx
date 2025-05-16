import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Index from '../../app/routes/_index';

// Mock del componente StartScreen
vi.mock('../../app/routes/startscreen', () => ({
    default: () => <div data-testid="start-screen">Start Screen Component</div>
}));

describe('Index Route', () => {
    it('renders StartScreen component', () => {
        render(<Index />);
        expect(screen.getByTestId('start-screen')).toBeInTheDocument();
    });
}); 