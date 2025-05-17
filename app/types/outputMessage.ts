export type MovementMessage = {
    type: 'movement';
    payload: 'up' | 'down' | 'left' | 'right';
};

export type ChangeDirectionMessage = {
    type: 'rotate';
    payload: 'up' | 'down' | 'left' | 'right';
};

export type SetColorMessage = {
    type: 'set-color';
    payload: string;
};

export type ExecPowerMessage = {
    type: 'exec-power';
    payload: string;
};

export type UpdateAll = {
    type: 'update-all',
    payload: string | null;
};

export type OutputMessage =
    | MovementMessage
    | ChangeDirectionMessage
    | SetColorMessage
    | ExecPowerMessage
    | UpdateAll;

