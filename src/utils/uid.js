/**
 * Génère un ID aléatoire de 7 caractères.
 * @returns {string}
 */
export function uid() {
  return Math.random().toString(36).slice(2, 9);
}
