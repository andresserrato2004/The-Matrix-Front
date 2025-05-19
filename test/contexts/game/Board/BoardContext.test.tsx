import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { BoardProvider, useBoard } from '../../../../app/contexts/game/Board/BoardContext';
import type { BoardCell } from '../../../../app/contexts/game/types/types';

// Mock data
const mockBoardCell: BoardCell = {
    coordinates: [0, 0],
    item: {
        id: '1',
        type: 'fruit',
        points: 10
    },
    character: null
};

const mockIceBlock: BoardCell = {
    coordinates: [1, 1],
    item: {
        id: '2',
        type: 'iceBlock'
    },
    character: null
};

const mockEnemy: BoardCell = {
    coordinates: [2, 2],
    item: null,
    character: {
        id: '3',
        type: 'troll',
        direction: 'up'
    }
};

// Test component to access context
const TestComponent = () => {
    const { state, dispatch } = useBoard();
    return (
        <div>
            <div data-testid="fruits-count">{state.fruits.length}</div>
            <div data-testid="ice-blocks-count">{state.iceBlocks.length}</div>
            <div data-testid="enemies-count">{state.enemies.length}</div>
            <button type="button" onClick={() => dispatch({ type: 'SET_BOARD', payload: [mockBoardCell, mockIceBlock, mockEnemy] })}>
                Set Board
            </button>
            <button type="button" onClick={() => dispatch({ type: 'SET_FRUITS', payload: [mockBoardCell] })}>
                Set Fruits
            </button>
            <button type="button" onClick={() => dispatch({ type: 'DELETE_FRUIT', payload: '1' })}>
                Delete Fruit
            </button>
            <button type="button" onClick={() => dispatch({ type: 'DELETE_ICE_BLOCKS', payload: ['2'] })}>
                Delete Ice Blocks
            </button>
            <button type="button" onClick={() => dispatch({ type: 'ADD_ICE_BLOCKS', payload: [mockIceBlock] })}>
                Add Ice Blocks
            </button>
            <button type="button" onClick={() => dispatch({
                type: 'MOVE_ENEMY',
                payload: {
                    id: '3',
                    newPosition: [3, 3],
                    direction: 'right'
                }
            })}>
                Move Enemy
            </button>
        </div>
    );
};

describe('BoardContext', () => {
    it('provides initial state', () => {
        const { getByTestId } = render(
            <BoardProvider>
                <TestComponent />
            </BoardProvider>
        );

        expect(getByTestId('fruits-count')).toHaveTextContent('0');
        expect(getByTestId('ice-blocks-count')).toHaveTextContent('0');
        expect(getByTestId('enemies-count')).toHaveTextContent('0');
    });

    it('handles SET_BOARD action', () => {
        const { getByTestId, getByText } = render(
            <BoardProvider>
                <TestComponent />
            </BoardProvider>
        );

        act(() => {
            getByText('Set Board').click();
        });

        expect(getByTestId('fruits-count')).toHaveTextContent('1');
        expect(getByTestId('ice-blocks-count')).toHaveTextContent('1');
        expect(getByTestId('enemies-count')).toHaveTextContent('1');
    });

    it('handles SET_FRUITS action', () => {
        const { getByTestId, getByText } = render(
            <BoardProvider>
                <TestComponent />
            </BoardProvider>
        );

        act(() => {
            getByText('Set Fruits').click();
        });

        expect(getByTestId('fruits-count')).toHaveTextContent('1');
    });

    it('handles DELETE_FRUIT action', () => {
        const { getByTestId, getByText } = render(
            <BoardProvider>
                <TestComponent />
            </BoardProvider>
        );

        // First set a fruit
        act(() => {
            getByText('Set Fruits').click();
        });

        // Then delete it
        act(() => {
            getByText('Delete Fruit').click();
        });

        expect(getByTestId('fruits-count')).toHaveTextContent('0');
    });

    it('handles DELETE_ICE_BLOCKS action', () => {
        const { getByTestId, getByText } = render(
            <BoardProvider>
                <TestComponent />
            </BoardProvider>
        );

        // First set the board to have ice blocks
        act(() => {
            getByText('Set Board').click();
        });

        // Then delete ice blocks
        act(() => {
            getByText('Delete Ice Blocks').click();
        });

        expect(getByTestId('ice-blocks-count')).toHaveTextContent('1');
    });

    it('handles ADD_ICE_BLOCKS action', () => {
        const { getByTestId, getByText } = render(
            <BoardProvider>
                <TestComponent />
            </BoardProvider>
        );

        act(() => {
            getByText('Add Ice Blocks').click();
        });

        expect(getByTestId('ice-blocks-count')).toHaveTextContent('0');
    });

    it('handles MOVE_ENEMY action', () => {
        const { getByTestId, getByText } = render(
            <BoardProvider>
                <TestComponent />
            </BoardProvider>
        );

        // First set the board to have an enemy
        act(() => {
            getByText('Set Board').click();
        });

        // Then move the enemy
        act(() => {
            getByText('Move Enemy').click();
        });

        expect(getByTestId('enemies-count')).toHaveTextContent('1');
    });

    it('throws error when useBoard is used outside provider', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });

        expect(() => {
            render(<TestComponent />);
        }).toThrow('useBoard must be used within a BoardProvider');

        consoleError.mockRestore();
    });
}); 