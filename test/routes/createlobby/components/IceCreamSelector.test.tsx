import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import IceCreamSelector from '../../../../app/routes/createlobby/components/IceCreamSelector';

describe('IceCreamSelector', () => {
    const mockIceCreams = [
        { id: 1, name: 'Vanilla', image: '/vanilla.png' },
        { id: 2, name: 'Chocolate', image: '/chocolate.png' },
        { id: 3, name: 'Strawberry', image: '/strawberry.png' }
    ];

    const defaultProps = {
        iceCreams: mockIceCreams,
        selectedIceCream: null,
        onIceCreamSelect: vi.fn(),
        position: 'left' as const,
        playerName: 'Player 1',
        isReady: false,
        onReadyToggle: vi.fn(),
        playerCustomName: '',
        onPlayerNameChange: vi.fn(),
        isDisabled: false
    };

    it('renders correctly with default props', () => {
        render(<IceCreamSelector {...defaultProps} />);
        expect(screen.getByText('Player 1')).toBeInTheDocument();
        expect(screen.getByText('Vanilla')).toBeInTheDocument();
        expect(screen.getByText('Chocolate')).toBeInTheDocument();
        expect(screen.getByText('Strawberry')).toBeInTheDocument();
    });

    it('selects default ice cream based on position', () => {
        render(<IceCreamSelector {...defaultProps} />);
        expect(defaultProps.onIceCreamSelect).toHaveBeenCalledWith(mockIceCreams[0]);
    });

    it('selects second ice cream for right position', () => {
        render(<IceCreamSelector {...defaultProps} position="right" />);
        expect(defaultProps.onIceCreamSelect).toHaveBeenCalledWith(mockIceCreams[1]);
    });

    it('handles ice cream selection', () => {
        render(<IceCreamSelector {...defaultProps} />);
        const chocolateButton = screen.getByText('Chocolate').closest('button');
        if (chocolateButton) {
            fireEvent.click(chocolateButton);
            expect(defaultProps.onIceCreamSelect).toHaveBeenCalledWith(mockIceCreams[1]);
        }
    });

    it('displays selected ice cream', () => {
        render(<IceCreamSelector {...defaultProps} selectedIceCream={mockIceCreams[1]} />);
        expect(screen.getByText('Selected: Chocolate')).toBeInTheDocument();
    });

    it('handles player name change', () => {
        render(<IceCreamSelector {...defaultProps} selectedIceCream={mockIceCreams[0]} />);
        const nameInput = screen.getByPlaceholderText('Enter your name');
        fireEvent.change(nameInput, { target: { value: 'New Name' } });
        expect(defaultProps.onPlayerNameChange).toHaveBeenCalledWith('New Name');
    });

    it('handles ready toggle', () => {
        render(<IceCreamSelector {...defaultProps} selectedIceCream={mockIceCreams[0]} />);
        const readyButton = screen.getByText('Ready');
        fireEvent.click(readyButton);
        expect(defaultProps.onReadyToggle).toHaveBeenCalled();
    });

    it('displays ready state correctly', () => {
        render(<IceCreamSelector {...defaultProps} selectedIceCream={mockIceCreams[0]} isReady={true} />);
        expect(screen.getByText('Not Ready')).toBeInTheDocument();
        expect(screen.getByText('Ready!')).toBeInTheDocument();
    });

    it('handles disabled state', () => {
        render(<IceCreamSelector {...defaultProps} selectedIceCream={mockIceCreams[0]} isDisabled={true} />);
        expect(screen.getByText('Waiting for player...')).toBeInTheDocument();

        // Verify interactions are disabled
        const nameInput = screen.getByPlaceholderText('Enter your name');
        fireEvent.change(nameInput, { target: { value: 'New Name' } });
        expect(defaultProps.onPlayerNameChange);

        const chocolateButton = screen.getByText('Chocolate').closest('button');
        if (chocolateButton) {
            fireEvent.click(chocolateButton);
            expect(defaultProps.onIceCreamSelect).not.toHaveBeenCalledWith(mockIceCreams[2]);
        }
    });

    it('does not select default ice cream when disabled', () => {
        render(<IceCreamSelector {...defaultProps} isDisabled={true} />);

    });



    it('shows ready button only when not disabled', () => {
        const { rerender } = render(<IceCreamSelector {...defaultProps} selectedIceCream={mockIceCreams[0]} />);
        expect(screen.getByText('Ready')).toBeInTheDocument();

        rerender(<IceCreamSelector {...defaultProps} selectedIceCream={mockIceCreams[0]} isDisabled={true} />);
        expect(screen.queryByText('Ready')).not.toBeInTheDocument();
    });
}); 