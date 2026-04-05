// =============================================
// Garden Planner Storage — localStorage slot management
// =============================================

const SLOTS_INDEX_KEY = 'GardenPlannerSlots_index';
const SLOT_PREFIX    = 'GardenPlannerSlot_';
const MAX_SLOTS      = 20;
const SCHEMA_VERSION = 1;

// ── Slot index ──────────────────────────────────────────────────────────────

export function getSlotIndex() {
  try {
    const raw = localStorage.getItem(SLOTS_INDEX_KEY);
    if (!raw) return { slots: [] };
    const data = JSON.parse(raw);
    return data;
  } catch {
    return { slots: [] };
  }
}

function _saveSlotIndex(index) {
  localStorage.setItem(SLOTS_INDEX_KEY, JSON.stringify(index));
}

// ── Individual slot CRUD ────────────────────────────────────────────────────

export function getSlot(id) {
  try {
    const raw = localStorage.getItem(SLOT_PREFIX + id);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSlot(id, name, planData) {
  const index = getSlotIndex();
  const now = new Date().toISOString();

  const existing = index.slots.find(s => s.id === id);
  if (existing) {
    existing.name = name;
    existing.updatedAt = now;
  } else {
    if (index.slots.length >= MAX_SLOTS) {
      throw new Error(`Limite de ${MAX_SLOTS} slots atteinte. Supprimez un slot existant.`);
    }
    index.slots.push({ id, name, createdAt: now, updatedAt: now });
  }
  _saveSlotIndex(index);

  const slot = {
    version: SCHEMA_VERSION,
    exportedAt: now,
    gardenDimensions: {
      width: 24,
      depth: 50,
      cellSize: 0.1,
      cols: 240,
      rows: 500,
    },
    fenceHeight: planData.fenceHeight ?? 1.5,
    perimeterFence: planData.perimeterFence ?? null,
    objects: planData.objects ?? [],
    paths: planData.paths ?? [],
  };
  localStorage.setItem(SLOT_PREFIX + id, JSON.stringify(slot));
  return slot;
}

export function deleteSlot(id) {
  const index = getSlotIndex();
  index.slots = index.slots.filter(s => s.id !== id);
  _saveSlotIndex(index);
  localStorage.removeItem(SLOT_PREFIX + id);
}

export function renameSlot(id, newName) {
  const index = getSlotIndex();
  const slot = index.slots.find(s => s.id === id);
  if (slot) {
    slot.name = newName;
    slot.updatedAt = new Date().toISOString();
    _saveSlotIndex(index);
  }
  const data = getSlot(id);
  if (data) {
    data.exportedAt = new Date().toISOString();
    localStorage.setItem(SLOT_PREFIX + id, JSON.stringify(data));
  }
}

// ── JSON export / import ────────────────────────────────────────────────────

export function exportSlotToJSON(slotData) {
  const json = JSON.stringify(slotData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `greenhub-jardin-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importSlotFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.objects) throw new Error('Format de fichier invalide');
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function importSlotData(data, slotName) {
  const index = getSlotIndex();
  const now = new Date().toISOString();
  const id = `imported_${Date.now()}`;

  if (index.slots.length >= MAX_SLOTS) {
    throw new Error(`Limite de ${MAX_SLOTS} slots atteinte. Supprimez un slot existant.`);
  }
  index.slots.push({ id, name: slotName || 'Plan importé', createdAt: now, updatedAt: now });
  _saveSlotIndex(index);

  const slot = {
    version: SCHEMA_VERSION,
    exportedAt: now,
    gardenDimensions: data.gardenDimensions || { width: 24, depth: 50, cellSize: 0.1, cols: 240, rows: 500 },
    fenceHeight: data.fenceHeight ?? 1.5,
    perimeterFence: data.perimeterFence ?? null,
    objects: data.objects || [],
    paths: data.paths || [],
  };
  localStorage.setItem(SLOT_PREFIX + id, JSON.stringify(slot));
  return { id, name: slotName || 'Plan importé' };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

export function createEmptySlot(name = 'Nouveau plan') {
  return {
    version: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    gardenDimensions: { width: 24, depth: 50, cellSize: 0.1, cols: 240, rows: 500 },
    fenceHeight: 1.5,
    perimeterFence: null,
    objects: [],
    paths: [],
    name,
  };
}
