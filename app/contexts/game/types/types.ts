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
    x: number; // Coordenada X de la celda
    y: number; // Coordenada Y de la celda
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

export type PlayerMove = {
    playerId: string; // ID del jugador que se mueve
    coordinates: Coordinates; // Nuevas coordenadas del jugador
    direction: "up" | "down" | "left" | "right"; // Dirección en la que se mueve el jugador (por ejemplo: "up", "down", "left", "right")
    state: "alive" | "dead"; // Estado del jugador (por ejemplo: "alive" o "dead")
};