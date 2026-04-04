// ─── SHARED STYLES ─────────────────────────────────────────────────────────────────

export const S = {
  root: {
    minHeight: '100vh',
    background: '#0d1117',
    fontFamily: "'DM Sans',sans-serif",
    backgroundImage: 'radial-gradient(ellipse at 15% 15%,#0d1f0d 0%,transparent 55%),radial-gradient(ellipse at 85% 85%,#0d0d1f 0%,transparent 55%)',
    paddingBottom: 60,
    color: '#fff',
  },
  label: { fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 },
  back: { fontSize: 12, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', marginBottom: 16, display: 'inline-block' },
  qBtn: {
    width: 38, height: 38, borderRadius: 8,
    background: 'rgba(255,255,255,0.07)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: 20, color: '#fff', userSelect: 'none',
  },
  primaryBtn: {
    display: 'block', width: '100%', textAlign: 'center',
    padding: '12px 0', borderRadius: 12, cursor: 'pointer',
    fontSize: 14, fontWeight: 700, border: 'none', boxSizing: 'border-box',
    transition: 'opacity 0.2s',
  },
};
