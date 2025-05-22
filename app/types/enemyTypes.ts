export type EnemyRenderType = "gif" | "sprite";

export const enemyRenderMap: Record<string, EnemyRenderType> = {
  "troll": "gif",
  "cow": "sprite",
  "log-man": "sprite",
  "squid-green": "sprite",
  "squid-blue": "sprite"
};

export const possibleEnemies = Object.keys(enemyRenderMap);
