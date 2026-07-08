const STOPWORDS = new Set(['IDDP', 'de', 'del', 'la', 'las', 'el', 'los', 'y']);

const GRADIENTS = [
  'linear-gradient(135deg, #0F6B5C, #17493f)',
  'linear-gradient(135deg, #C08A28, #93691d)',
  'linear-gradient(135deg, #0F6B5C, #C08A28)',
  'linear-gradient(135deg, #1C2321, #0F6B5C)',
];

/** Up to 2 initials from the most meaningful words in a name (skips articles/prepositions and the "IDDP" prefix). */
export function getInitials(text: string): string {
  const words = text.replace(/["""]/g, '').trim().split(/\s+/).filter(Boolean);
  const meaningful = words.filter((w) => !STOPWORDS.has(w));
  const source = meaningful.length > 0 ? meaningful : words;
  const initials = source
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return initials || '?';
}

/** Deterministic gradient from the system palette, picked by hashing the text so the same entity always gets the same color. */
export function getAvatarGradient(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}
