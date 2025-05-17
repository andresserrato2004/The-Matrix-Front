import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { UserProviders } from '../../../app/contexts/user/UserProviders';
import { useUser } from '../../../app/contexts/user/userContext';

// Test component to verify context is provided
const TestComponent = () => {
    const { userData, secondaryUserData, isLoggedIn } = useUser();
    return (
        <div>
            <div data-testid="user-data">{JSON.stringify(userData)}</div>
            <div data-testid="secondary-user-data">{JSON.stringify(secondaryUserData)}</div>
            <div data-testid="is-logged-in">{isLoggedIn.toString()}</div>
        </div>
    );
};

describe('UserProviders', () => {
    it('renders children without crashing', () => {
        const { getByText } = render(
            <UserProviders>
                <div>Test Child</div>
            </UserProviders>
        );

        expect(getByText('Test Child')).toBeInTheDocument();
    });

    it('provides user context to children', () => {
        const { getByTestId } = render(
            <UserProviders>
                <TestComponent />
            </UserProviders>
        );

        expect(getByTestId('user-data')).toHaveTextContent('null');
        expect(getByTestId('secondary-user-data')).toHaveTextContent('null');
        expect(getByTestId('is-logged-in')).toHaveTextContent('false');
    });

    it('renders multiple children correctly', () => {
        const { getByText } = render(
            <UserProviders>
                <div>First Child</div>
                <div>Second Child</div>
                <div>Third Child</div>
            </UserProviders>
        );

        expect(getByText('First Child')).toBeInTheDocument();
        expect(getByText('Second Child')).toBeInTheDocument();
        expect(getByText('Third Child')).toBeInTheDocument();
    });

    it('maintains context state between renders', () => {
        const { getByTestId, rerender } = render(
            <UserProviders>
                <TestComponent />
            </UserProviders>
        );

        // Initial render
        expect(getByTestId('user-data')).toHaveTextContent('null');

        // Re-render
        rerender(
            <UserProviders>
                <TestComponent />
            </UserProviders>
        );

        // State should be maintained
        expect(getByTestId('user-data')).toHaveTextContent('null');
    });

    it('handles nested components correctly', () => {
        const NestedComponent = () => (
            <div>
                <div>Nested Level 1</div>
                <div>
                    <div>Nested Level 2</div>
                    <TestComponent />
                </div>
            </div>
        );

        const { getByText, getByTestId } = render(
            <UserProviders>
                <NestedComponent />
            </UserProviders>
        );

        expect(getByText('Nested Level 1')).toBeInTheDocument();
        expect(getByText('Nested Level 2')).toBeInTheDocument();
        expect(getByTestId('user-data')).toHaveTextContent('null');
    });

    it('provides consistent context across component tree', () => {
        const ChildComponent1 = () => {
            const { userData } = useUser();
            return <div data-testid="child1">{JSON.stringify(userData)}</div>;
        };

        const ChildComponent2 = () => {
            const { userData } = useUser();
            return <div data-testid="child2">{JSON.stringify(userData)}</div>;
        };

        const { getByTestId } = render(
            <UserProviders>
                <div>
                    <ChildComponent1 />
                    <ChildComponent2 />
                </div>
            </UserProviders>
        );

        expect(getByTestId('child1')).toHaveTextContent('null');
        expect(getByTestId('child2')).toHaveTextContent('null');
    });
}); 