// Un frame individual en el atlas:
export interface Frame {
  x: number;       // px desde la izquierda del atlas
  y: number;       // px desde la parte superior
  w: number;       // ancho del frame
  h: number;       // alto del frame
}

// Una animación completa:
export interface Animation {
  frames: Frame[];  // secuencia de rectángulos
  fps: number;      // velocidad de animación
}

// El atlas completo con todas las animaciones:
export interface SpriteSheetInfo {
  imageUrl: string;
  animations: Record<string, Animation>;
}
