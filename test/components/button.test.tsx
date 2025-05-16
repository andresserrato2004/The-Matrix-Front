import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../../app/components/shared/Button';

describe('Button', () => {
    it('renders with default props', () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });

        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('global-button', 'primary', 'medium');
    });

    it('renders with different variants', () => {
        const { rerender } = render(<Button variant="primary">Primary</Button>);
        expect(screen.getByRole('button')).toHaveClass('primary');

        rerender(<Button variant="secondary">Secondary</Button>);
        expect(screen.getByRole('button')).toHaveClass('secondary');

        rerender(<Button variant="danger">Danger</Button>);
        expect(screen.getByRole('button')).toHaveClass('danger');
    });

    it('renders with different sizes', () => {
        const { rerender } = render(<Button size="small">Small</Button>);
        expect(screen.getByRole('button')).toHaveClass('small');

        rerender(<Button size="medium">Medium</Button>);
        expect(screen.getByRole('button')).toHaveClass('medium');

        rerender(<Button size="large">Large</Button>);
        expect(screen.getByRole('button')).toHaveClass('large');
    });

    it('renders with full width when specified', () => {
        render(<Button fullWidth>Full Width</Button>);
        expect(screen.getByRole('button')).toHaveClass('full-width');
    });

    it('applies custom className', () => {
        render(<Button className="custom-class">Custom Class</Button>);
        expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('handles click events', async () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);

        await userEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('forwards additional props to button element', () => {
        render(
            <Button
                data-testid="test-button"
                aria-label="Test Button"
                type="submit"
            >
                Test Props
            </Button>
        );

        const button = screen.getByTestId('test-button');
        expect(button).toHaveAttribute('aria-label', 'Test Button');
        expect(button).toHaveAttribute('type', 'submit');
    });
}); 