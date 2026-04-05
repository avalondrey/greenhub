// =============================================
// GardenPlannerToolbar — Category tabs + tool modes + fence controls
// =============================================

import { TOOL_MODES } from './useGardenPlannerState.js';

const TOOL_BUTTON_STYLE = {
  padding: '6px 12px',
  borderRadius: 8,
  fontSize: 11,
  cursor: 'pointer',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.04)',
  color: 'rgba(255,255,255,0.7)',
  fontFamily: "'DM Sans',sans-serif",
  fontWeight: 400,
};

const TOOL_BUTTON_ACTIVE_STYLE = {
  ...TOOL_BUTTON_STYLE,
  background: 'rgba(46,204,113,0.2)',
  border: '1px solid rgba(46,204,113,0.5)',
  color: '#2ecc71',
  fontWeight: 600,
};

const CAT_TAB_STYLE = (active) => ({
  padding: '5px 10px',
  borderRadius: 6,
  fontSize: 11,
  cursor: 'pointer',
  border: `1px solid ${active ? 'rgba(46,204,113,0.5)' : 'rgba(255,255,255,0.08)'}`,
  background: active ? 'rgba(46,204,113,0.15)' : 'rgba(255,255,255,0.03)',
  color: active ? '#2ecc71' : 'rgba(255,255,255,0.5)',
  fontFamily: "'DM Sans',sans-serif",
  fontWeight: active ? 600 : 400,
  whiteSpace: 'nowrap',
});

const ITEM_BUTTON_STYLE = (color) => ({
  padding: '5px 8px',
  borderRadius: 6,
  fontSize: 11,
  cursor: 'pointer',
  border: `1.5px solid ${color || '#4CAF50'}50`,
  background: `${color || '#4CAF50'}18`,
  color: '#fff',
  fontFamily: "'DM Sans',sans-serif",
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  transition: 'all 0.15s',
});

const ITEM_BUTTON_ACTIVE_STYLE = {
  border: '1.5px solid #2ecc71',
  background: 'rgba(46,204,113,0.2)',
};

const TOOL_MODES_LIST = [
  { id: TOOL_MODES.SINGLE,  label: 'Clic',      emoji: '🖱️', title: 'Clic simple — placer un seul objet' },
  { id: TOOL_MODES.RECT,    label: 'Rectangle', emoji: '📐', title: 'Cliquer-glisser pour remplir une zone' },
  { id: TOOL_MODES.LINE,    label: 'Ligne',     emoji: '➖', title: 'Tracer une ligne avec espacement' },
  { id: TOOL_MODES.ERASER,  label: 'Effacer',  emoji: '🗑️', title: 'Clic sur un objet pour le supprimer' },
  { id: TOOL_MODES.PATH,    label: 'Allée',    emoji: '🪨', title: 'Tracer une allée (polyligne)' },
];

const FENCE_TYPES = [
  { id: 'grillage',      name: 'Grillage',  emoji: '🔗', height: 1.5 },
  { id: 'bordure_bois', name: 'Bordure bois', emoji: '🪵', height: 0.8 },
  { id: 'haie',         name: 'Haie',     emoji: '🌲', height: 1.2 },
  { id: 'muret',        name: 'Muret',     emoji: '🧱', height: 0.6 },
];

export { FENCE_TYPES };

export default function GardenPlannerToolbar({
  selectedCategory, onSelectCategory,
  selectedItem, onSelectItem,
  selectedTool, onSelectTool,
  perimeterFence, onPerimeterFence,
  showPerimeter, onToggleShowPerimeter,
  categories,
}) {
  const currentCategory = categories.find(c => c.id === selectedCategory) || categories[0];
  const items = currentCategory?.items || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* ── Tool modes ── */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {TOOL_MODES_LIST.map(t => (
          <button
            key={t.id}
            title={t.title}
            onClick={() => onSelectTool(t.id)}
            style={selectedTool === t.id ? TOOL_BUTTON_ACTIVE_STYLE : TOOL_BUTTON_STYLE}
          >
            <span style={{ fontSize: 13 }}>{t.emoji}</span>{' '}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── Category tabs ── */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            style={CAT_TAB_STYLE(selectedCategory === cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Item palette ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onSelectItem(item)}
            title={`${item.name} — ${item.description || ''}`}
            style={{
              ...ITEM_BUTTON_STYLE(item.color),
              ...(selectedItem?.id === item.id ? ITEM_BUTTON_ACTIVE_STYLE : {}),
            }}
          >
            <span style={{ fontSize: 15 }}>{item.emoji}</span>
            <span style={{ fontSize: 10 }}>{item.name}</span>
          </button>
        ))}
      </div>

      {/* ── Fence controls (shown when clotures category active) ── */}
      {selectedCategory === 'clotures' && (
        <div style={{
          marginTop: 4,
          padding: '8px 10px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            🔗 Clôture Périmétrique
          </div>

          {/* Fence type selection */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {FENCE_TYPES.map(f => (
              <button
                key={f.id}
                onClick={() => onPerimeterFence(f.id, f.height)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  cursor: 'pointer',
                  border: `1.5px solid ${perimeterFence?.type === f.id ? '#2ecc71' : 'rgba(255,255,255,0.15)'}`,
                  background: perimeterFence?.type === f.id ? 'rgba(46,204,113,0.2)' : 'rgba(255,255,255,0.05)',
                  color: perimeterFence?.type === f.id ? '#2ecc71' : 'rgba(255,255,255,0.7)',
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                {f.emoji} {f.name}
              </button>
            ))}
          </div>

          {/* Height input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Hauteur (m)</label>
            <input
              type="number"
              min="0.3"
              max="3"
              step="0.1"
              value={perimeterFence?.height ?? 1.5}
              onChange={(e) => onPerimeterFence(perimeterFence?.type || 'grillage', parseFloat(e.target.value) || 1.5)}
              style={{
                width: 60,
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: '#2ecc71',
                fontSize: 12,
                fontFamily: "'DM Sans',sans-serif",
                textAlign: 'center',
              }}
            />
          </div>

          {/* Auto-perimeter toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showPerimeter}
              onChange={(e) => onToggleShowPerimeter(e.target.checked)}
            />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
              Afficher le périmètre ({perimeterFence?.height ?? 1.5}m)
            </span>
          </label>
        </div>
      )}

      {/* ── Allees / Paths (shown when allees category active) ── */}
      {selectedCategory === 'allees' && (
        <div style={{
          marginTop: 4,
          padding: '8px 10px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          fontSize: 11,
          color: 'rgba(255,255,255,0.5)',
        }}>
          🪨 Outil Allée : cliquez pour commencer le tracé, puis ajoutez des points. Double-clic pour terminer.
        </div>
      )}
    </div>
  );
}
