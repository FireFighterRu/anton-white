/* Storage is independent of the interface so damaged data can be tested safely. */
(function (root) {
  const KEY = 'anton-white-plano-v1';
  const BACKUP = KEY + '-recovery';
  function parse(raw) {
    const rows = JSON.parse(raw);
    if (!Array.isArray(rows) || rows.length > 100) throw new Error('invalid list');
    const ids = new Set();
    for (const row of rows) {
      if (!row || typeof row.id !== 'string' || !row.id || ids.has(row.id) ||
          typeof row.text !== 'string' || !row.text.trim() || row.text.length > 140 ||
          typeof row.done !== 'boolean' || typeof row.focus !== 'boolean') throw new Error('invalid task');
      ids.add(row.id);
    }
    return rows;
  }
  function read(storage) {
    try {
      const raw = storage.getItem(KEY);
      if (raw === null) return { kind: 'missing', tasks: [] };
      try { return { kind: 'ok', tasks: parse(raw) }; }
      catch { return { kind: 'damaged', tasks: [], raw }; }
    } catch { return { kind: 'unavailable', tasks: [] }; }
  }
  function recover(storage) {
    const state = read(storage);
    if (state.kind !== 'damaged') return false;
    // Do not touch the original if the backup cannot be written.
    storage.setItem(BACKUP, state.raw);
    storage.setItem(KEY, '[]');
    return true;
  }
  const api = { KEY, BACKUP, parse, read, recover };
  if (typeof module !== 'undefined') module.exports = api;
  else root.PlanoStorage = api;
})(typeof window !== 'undefined' ? window : globalThis);
