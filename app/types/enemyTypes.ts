export type EnemyRenderType = "gif" | "sprite";

export const enemyRenderMap: Record<string, EnemyRenderType> = {
  "troll": "gif",
  "cow": "gif",
  "log-man": "sprite",
  "squid-green": "sprite",
  "squid-blue": "sprite"
};

export const possibleEnemies = Object.keys(enemyRenderMap);
