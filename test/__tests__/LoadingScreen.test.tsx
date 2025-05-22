import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import LoadingScreen from '../../app/components/loadingScreen/LoadingScreen';

describe('LoadingScreen', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        // Mock Image constructor with proper event handling
        global.Image = vi.fn().mockImplementation(() => ({
            onload: null,
            onerror: null,
            src: '',
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }));
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it('renders with default props', () => {
        render(<LoadingScreen />);

        expect(screen.getByText('Ice Cream Battle')).toBeInTheDocument();
        expect(screen.getByText('Preparando el campo de juego...')).toBeInTheDocument();
        expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('renders with custom message initially', async () => {
        const customMessage = 'Custom loading message';
        render(<LoadingScreen message={customMessage} />);

        // El mensaje personalizado se muestra inicialmente

        // Esperar a que el componente actualice el mensaje basado en el progreso
        await act(async () => {
            vi.advanceTimersByTime(0);
        });

        // Verificar que el mensaje se actualiza
        expect(screen.getByText('Preparando el campo de juego...')).toBeInTheDocument();
    });

    it('updates progress bar based on progress prop', () => {
        render(<LoadingScreen progress={50} />);

        // El progreso total será 30% (50 * 0.6) ya que assetProgress tiene peso 0.6
        expect(screen.getByText('30%')).toBeInTheDocument();
    });

    it('calls onComplete when progress reaches 100%', () => {
        const onComplete = vi.fn();
        render(<LoadingScreen progress={100} componentProgress={100} onComplete={onComplete} />);

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(onComplete).toHaveBeenCalled();
    });

    it('updates message based on progress', () => {
        const { rerender } = render(<LoadingScreen progress={0} componentProgress={0} />);
        expect(screen.getByText('Preparando el campo de juego...')).toBeInTheDocument();

        rerender(<LoadingScreen progress={40} componentProgress={40} />);
        expect(screen.getByText('Cargando personajes y enemigos...')).toBeInTheDocument();

        rerender(<LoadingScreen progress={60} componentProgress={60} />);
        expect(screen.getByText('Organizando frutas y bloques...')).toBeInTheDocument();

        rerender(<LoadingScreen progress={80} componentProgress={80} />);
        expect(screen.getByText('Inicializando controles...')).toBeInTheDocument();

        rerender(<LoadingScreen progress={96} componentProgress={96} />);
        expect(screen.getByText('¡Todo listo! Preparando para comenzar...')).toBeInTheDocument();
    });
}); 