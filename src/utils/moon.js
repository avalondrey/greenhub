/**
 * Calcule la phase lunaire actuelle (8 phases).
 * @param {Date} [date]
 * @returns {{ name: string, icon: string, sow: string|false }}
 */
export function getMoonPhase(date = new Date()) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  const day = date.getDate();

  let c, e, jd, b;
  if (month < 3) {
    year--;
    month += 12;
  }
  c = 365.25 * year;
  e = 30.6 * month;
  jd = c + e + day - 694039.09;
  jd /= 29.5305882;
  b = Math.floor(jd);
  jd -= b;
  b = Math.round(jd * 8);

  const phases = [
    { name: 'Nouvelle lune',        icon: '🌑', sow: 'racines' },
    { name: 'Premier croissant',    icon: '🌒', sow: 'feuilles' },
    { name: 'Premier quartier',     icon: '🌓', sow: 'feuilles' },
    { name: 'Lune gibbeuse',        icon: '🌔', sow: 'fruits' },
    { name: 'Pleine lune',          icon: '🌕', sow: 'graines' },
    { name: 'Gibbeuse décroissante',icon: '🌖', sow: false },
    { name: 'Dernier quartier',    icon: '🌗', sow: false },
    { name: 'Dernier croissant',   icon: '🌘', sow: 'racines' },
  ];

  return phases[b] || phases[0];
}
