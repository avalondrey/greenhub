// =============================================
// SlotManager — Garden plan slots UI
// =============================================

import { useState } from 'react';

const SLOT_SELECT_STYLE = {
  flex: 1,
  padding: '7px 10px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.05)',
  color: '#fff',
  fontSize: 12,
  fontFamily: "'DM Sans',sans-serif",
  cursor: 'pointer',
  minWidth: 0,
};

const BTN_STYLE = (variant = 'default') => {
  const base = {
    padding: '7px 12px',
    borderRadius: 8,
    fontSize: 11,
    cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.7)',
    fontFamily: "'DM Sans',sans-serif",
    fontWeight: 400,
    whiteSpace: 'nowrap',
  };
  if (variant === 'primary') {
    return {
      ...base,
      background: 'rgba(46,204,113,0.2)',
      border: '1px solid rgba(46,204,113,0.4)',
      color: '#2ecc71',
      fontWeight: 600,
    };
  }
  if (variant === 'danger') {
    return {
      ...base,
      background: 'rgba(231,76,60,0.15)',
      border: '1px solid rgba(231,76,60,0.3)',
      color: '#e74c3c',
    };
  }
  if (variant === 'ghost') {
    return {
      ...base,
      background: 'transparent',
      border: '1px solid rgba(255,255,255,0.1)',
      color: 'rgba(255,255,255,0.5)',
    };
  }
  return base;
};

export default function SlotManager({
  slots,
  currentSlot,
  onLoad,
  onSave,
  onDelete,
  onRename,
  onExport,
  onImport,
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [saveName, setSaveName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = () => {
    if (!saveName.trim()) return;
    onSave(saveName.trim());
    setSaveName('');
    setShowSave(false);
  };

  const handleRename = () => {
    if (!editName.trim() || !currentSlot) return;
    onRename(editName.trim());
    setEditing(false);
    setEditName('');
  };

  const handleDelete = () => {
    onDelete();
    setConfirmDelete(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* ── Slot row ── */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {/* Slot selector */}
        <select
          value={currentSlot?.id || ''}
          onChange={(e) => {
            const id = e.target.value;
            if (id === '__new__') {
              setShowSave(true);
            } else if (id) {
              onLoad(id);
            }
          }}
          style={SLOT_SELECT_STYLE}
        >
          <option value="">— Aucun slot —</option>
          {slots.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
          <option value="__new__">+ Nouveau slot...</option>
        </select>

        {/* Rename (if slot selected) */}
        {currentSlot && !editing && (
          <button
            style={BTN_STYLE('ghost')}
            onClick={() => { setEditing(true); setEditName(currentSlot.name); }}
            title="Renommer ce slot"
          >
            ✏️
          </button>
        )}

        {/* Export */}
        <button
          style={BTN_STYLE('ghost')}
          onClick={onExport}
          title="Exporter en JSON"
        >
          📤 JSON
        </button>

        {/* Import */}
        <label style={{ ...BTN_STYLE('ghost'), cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          📥 JSON
          <input
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) onImport(file);
              e.target.value = '';
            }}
          />
        </label>
      </div>

      {/* ── Inline rename ── */}
      {editing && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid rgba(46,204,113,0.4)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontSize: 12,
              fontFamily: "'DM Sans',sans-serif",
            }}
            placeholder="Nom du slot..."
            autoFocus
          />
          <button style={BTN_STYLE('primary')} onClick={handleRename}>✓</button>
          <button style={BTN_STYLE()} onClick={() => setEditing(false)}>✕</button>
        </div>
      )}

      {/* ── Save dialog ── */}
      {showSave && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid rgba(46,204,113,0.4)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontSize: 12,
              fontFamily: "'DM Sans',sans-serif",
            }}
            placeholder="Nom du nouveau slot..."
            autoFocus
          />
          <button style={BTN_STYLE('primary')} onClick={handleSave}>Sauvegarder</button>
          <button style={BTN_STYLE()} onClick={() => setShowSave(false)}>✕</button>
        </div>
      )}

      {/* ── Quick save button ── */}
      {!showSave && (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            style={BTN_STYLE('primary')}
            onClick={() => {
              if (currentSlot?.name) {
                onSave(currentSlot.name);
              } else {
                setShowSave(true);
              }
            }}
          >
            💾 Sauvegarder
          </button>

          {currentSlot && !confirmDelete && (
            <button
              style={BTN_STYLE('danger')}
              onClick={() => setConfirmDelete(true)}
            >
              🗑️ Supprimer
            </button>
          )}
        </div>
      )}

      {/* ── Delete confirm ── */}
      {confirmDelete && (
        <div style={{
          padding: '8px 10px',
          background: 'rgba(231,76,60,0.1)',
          border: '1px solid rgba(231,76,60,0.3)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}>
          <span style={{ fontSize: 11, color: '#e74c3c' }}>
            Supprimer "{currentSlot?.name}" ? Cette action est irréversible.
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ ...BTN_STYLE('danger'), padding: '5px 10px' }} onClick={handleDelete}>
              Oui, supprimer
            </button>
            <button style={{ ...BTN_STYLE(), padding: '5px 10px' }} onClick={() => setConfirmDelete(false)}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
