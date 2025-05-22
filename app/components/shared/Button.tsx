import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
}

export default function Button({
    children,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    className = '',
    ...props
}: ButtonProps) {
    return (
        <button
            className={`global-button ${variant} ${size} ${fullWidth ? 'full-width' : ''} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
} 