// Experimental path: structure selects an accent; it does not generate prose.
// The visible line text remains authored in changing-lines data.

const POSITION_ACCENTS = {
  1: ['start', 'boundary', 'foundation'],
  2: ['support', 'capacity', 'balance'],
  3: ['choice', 'transition', 'risk'],
  4: ['application', 'interaction', 'method'],
  5: ['responsibility', 'coordination', 'consequence'],
  6: ['limit', 'completion', 'release'],
};

const SIGNALS = {
  boundary: ['меж', 'рамк', 'стрим', 'обмеж'],
  foundation: ['основ', 'структур', 'опор', 'підгот'],
  support: ['підтрим', 'допом', 'довір', 'зв’яз', "зв'яз", 'разом'],
  capacity: ['ресурс', 'нести', 'витрим', 'містк', 'систем'],
  balance: ['мір', 'баланс', 'рівнов', 'середин', 'центр'],
  choice: ['вибір', 'обрати', 'напрям', 'рішенн', 'орієнтир'],
  risk: ['ризик', 'небезп', 'слабк', 'тріск', 'проблем', 'надмір'],
  application: ['дія', 'діяти', 'крок', 'вчин', 'реальн'],
  interaction: ['люд', 'взаємод', 'контакт', 'співпрац', 'груп'],
  method: ['спосіб', 'форма', 'засіб', 'процес'],
  responsibility: ['відповід', 'роль', 'вплив', 'авторитет'],
  coordination: ['узгод', 'координ', 'спільн', 'навколо'],
  consequence: ['наслід', 'результ', 'створено', 'середовищ'],
  limit: ['меж', 'надмір', 'занадто', 'виснаж', 'нескінчен'],
  completion: ['заверш', 'кінець', 'готов', 'закріп'],
  release: ['відпуст', 'звільн', 'залиш', 'не трим'],
};

function normalize(text) {
  return String(text || '').toLowerCase();
}

function score(text, accent) {
  const words = SIGNALS[accent] || [];
  return words.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0);
}

export function selectLineAccent(line) {
  const position = Number(line?.position);
  const candidates = POSITION_ACCENTS[position] || [];
  const text = normalize(`${line?.title || ''} ${line?.meaning || ''} ${line?.advice || ''}`);
  let best = candidates[0] || null;
  let bestScore = -1;
  for (const accent of candidates) {
    const s = score(text, accent);
    if (s > bestScore) {
      best = accent;
      bestScore = s;
    }
  }
  return {
    position,
    accent: best,
    matched: bestScore > 0,
    candidates,
  };
}

export function accentLabel(accent) {
  return ({
    start: 'початок', boundary: 'межа', foundation: 'основа',
    support: 'опора', capacity: 'місткість', balance: 'рівновага',
    choice: 'вибір', transition: 'перехід', risk: 'ризик',
    application: 'втілення', interaction: 'взаємодія', method: 'спосіб дії',
    responsibility: 'відповідальність', coordination: 'узгодження', consequence: 'наслідки',
    limit: 'межа процесу', completion: 'завершення', release: 'відпускання',
  })[accent] || accent || '';
}
