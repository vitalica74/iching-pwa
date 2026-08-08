const encoder = new TextEncoder();
let interactionPool = [];

export function collectEntropy(event) {
  const point = event.touches?.[0] ?? event;
  interactionPool.push([
    performance.now(), Date.now(), point.clientX ?? 0, point.clientY ?? 0,
    point.pressure ?? 0, point.width ?? 0, point.height ?? 0,
    event.pointerId ?? 0, event.type
  ].join(':'));
  if (interactionPool.length > 64) interactionPool.shift();
}

async function mixedRandomWords() {
  // Один системний виклик одразу дає окреме 32-бітне число для кожної монети.
  const system = new Uint32Array(3);
  crypto.getRandomValues(system);

  // Дотик не замінює системну ентропію, а лише додатково змішується з нею.
  const input = `${system.join(',')}|${interactionPool.join('|')}|${performance.now()}|${Date.now()}`;
  interactionPool = [];
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(input)));

  return system.map((word, index) =>
    (word ^ (
      digest[index * 4] |
      (digest[index * 4 + 1] << 8) |
      (digest[index * 4 + 2] << 16) |
      (digest[index * 4 + 3] << 24)
    )) >>> 0
  );
}

export async function castThreeCoins() {
  const words = await mixedRandomWords();
  // Молодший біт кожного незалежного 32-бітного слова дає рівно 50/50 без modulo bias.
  const coins = Array.from(words, word => (word & 1) === 1 ? 3 : 2);
  const value = coins[0] + coins[1] + coins[2];

  return {
    coins,
    value,
    type: value % 2 === 0 ? 'yin' : 'yang',
    changing: value === 6 || value === 9
  };
}
