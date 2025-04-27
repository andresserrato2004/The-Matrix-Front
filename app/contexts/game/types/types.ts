export type Character = {
    type: string; // Tipo del personaje (por ejemplo: "troll")
    orientation: string; // Orientación del personaje (por ejemplo: "down")
    id: string; // Identificador único del personaje
};
  
export type Item = {
    type: string; // Tipo del ítem (por ejemplo: "fruit")
    id: string; // Identificador único del ítem
};
  
export type BoardCell = {
    coordinates: Coordinates; // Coordenadas de la celda
    item: Item | null; // El ítem en la celda, puede ser null si no hay ítem
    character: Character | null; // El personaje en la celda, puede ser null si no hay personaje
};

export type Coordinates = {
    x: number; // Coordenada X
    y: number; // Coordenada Y
};

export type EnemyMove = {
    enemyId: string; // ID del enemigo que se mueve
    coordinates: Coordinates; // Nuevas coordenadas del enemigo
    direction: "up" | "down" | "left" | "right"; // Dirección en la que se mueve el enemigo (por ejemplo: "up", "down", "left", "right")
};

export type GameState = "playing" | "paused" | "won" | "lost"; // Estado del juego

export type PlayerMove = {
    playerId: string; // ID del jugador que se mueve
    coordinates: Coordinates; // Nuevas coordenadas del jugador
    direction: "up" | "down" | "left" | "right"; // Dirección en la que se mueve el jugador (por ejemplo: "up", "down", "left", "right")
    state: "alive" | "dead"; // Estado del jugador (por ejemplo: "alive" o "dead")
};

export type UserInformation = {
    id: string; // ID del usuario
    matchId: string; // ID de la partida
    name: string; // Nombre de usuario
    flavour: string; // flavour del usuario
    position: Coordinates; // Posición del usuario en el tablero (opcional)
    direction: "up" | "down" | "left" | "right"; // Dirección del usuario (opcional)
    state: "alive" | "dead"; // Estado del usuario (opcional)
};

export type UsersBoardInformation = {
    id: string;
    position: Coordinates;
    direction: "up" | "down" | "left" | "right";
};