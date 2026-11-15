// Regression: the HTTP hosting preview must support first load and new tasks.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {webcrypto} = require('node:crypto');
const window = {crypto: {getRandomValues: bytes => webcrypto.getRandomValues(bytes)}};
vm.runInNewContext(fs.readFileSync('docs/plano/storage.js', 'utf8'), {window, Uint8Array});
const store = window.PlanoStorage;
const ids = Array.from({length: 1000}, () => store.newId());
assert.equal(new Set(ids).size, ids.length);
const rows = ids.slice(0, 3).map(id => ({id, text: 'Проверка', done: false, focus: false}));
assert.equal(store.parse(JSON.stringify(rows)).length, 3);
window.crypto.randomUUID = () => 'native-uuid';
assert.equal(store.newId(), 'native-uuid');
console.log('PLANO: HTTP fallback, unique identifiers, saved data and native UUID passed.');
