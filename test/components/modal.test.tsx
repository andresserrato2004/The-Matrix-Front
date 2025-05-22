import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../../app/components/modal/Modal';
import type { CSSProperties } from 'react';

interface MockModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
    children: React.ReactNode;
    className?: string;
    style?: CSSProperties;
}

// Mock ReactModal
vi.mock('react-modal', () => ({
    default: ({ isOpen, onRequestClose, children, className, style }: MockModalProps) => {
        if (!isOpen) return null;
        return (
            <div className="ReactModal__Overlay" style={{ backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <dialog
                    data-testid="modal"
                    className={className}
                    style={style}
                    onClick={onRequestClose}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            onRequestClose();
                        }
                    }}
                    open
                >
                    {children}
                </dialog>
            </div>
        );
    },
}));

describe('Modal', () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock document.body.style
        Object.defineProperty(document.body, 'style', {
            value: {
                overflow: '',
            },
            writable: true,
        });
    });

    it('renders when isOpen is true', () => {
        render(
            <Modal isOpen={true} onClose={mockOnClose}>
                <div>Modal Content</div>
            </Modal>
        );

        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
        render(
            <Modal isOpen={false} onClose={mockOnClose}>
                <div>Modal Content</div>
            </Modal>
        );

        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('calls onClose when clicking outside the modal', async () => {
        render(
            <Modal isOpen={true} onClose={mockOnClose}>
                <div>Modal Content</div>
            </Modal>
        );

        await userEvent.click(screen.getByTestId('modal'));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('applies custom className', () => {
        render(
            <Modal isOpen={true} onClose={mockOnClose} className="custom-modal">
                <div>Modal Content</div>
            </Modal>
        );

        expect(screen.getByTestId('modal')).toHaveClass('custom-modal');
    });

    it('applies custom background image', () => {
        const customBgImage = '/custom-bg.png';
        render(
            <Modal isOpen={true} onClose={mockOnClose} bgImage={customBgImage}>
                <div>Modal Content</div>
            </Modal>
        );

        const modalContainer = screen.getByTestId('modal').querySelector('.modal-container');
        expect(modalContainer).toHaveStyle({
            backgroundImage: `url(${customBgImage})`,
        });
    });

    it('applies custom blur amount', () => {
        const customBlur = '5px';
        render(
            <Modal isOpen={true} onClose={mockOnClose} blurAmount={customBlur}>
                <div>Modal Content</div>
            </Modal>
        );

        const overlay = screen.getByTestId('modal').parentElement;

    });

    it('sets body overflow to hidden when modal is open', () => {
        render(
            <Modal isOpen={true} onClose={mockOnClose}>
                <div>Modal Content</div>
            </Modal>
        );

        expect(document.body.style.overflow).toBe('hidden');
    });

    it('resets body overflow when modal is closed', () => {
        const { rerender } = render(
            <Modal isOpen={true} onClose={mockOnClose}>
                <div>Modal Content</div>
            </Modal>
        );

        expect(document.body.style.overflow).toBe('hidden');

        rerender(
            <Modal isOpen={false} onClose={mockOnClose}>
                <div>Modal Content</div>
            </Modal>
        );

        expect(document.body.style.overflow).toBe('auto');
    });
}); 