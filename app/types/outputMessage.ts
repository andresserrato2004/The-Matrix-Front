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

export type UpdateAllMessage = {
    type: 'update-all',
    payload: string;
};

export type PauseResumeMessage = {
    type: "pause" | "resume";
    payload: string;
};

export type OutputMessage =
    | MovementMessage
    | ChangeDirectionMessage
    | SetColorMessage
    | ExecPowerMessage
    | UpdateAllMessage
    | PauseResumeMessage;

