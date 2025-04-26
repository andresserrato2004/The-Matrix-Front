export type MovementMessage = {
    type: 'movement';
    payload: 'up' | 'down' | 'left' | 'right';
};

export type ChangeDirectionMessage = {
    type: 'rotate';
    payload: 'up' | 'down' | 'left' | 'right';
};

export type SetColorMessage = {
    type: 'setColor';
    payload: string;
};

export type ExecPowerMessage = {
    type: 'exec-power';
};

