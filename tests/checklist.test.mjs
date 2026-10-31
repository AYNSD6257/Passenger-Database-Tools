import test from 'node:test';
import assert from 'node:assert/strict';
import { buildChecklist, SOURCES } from '../src/checklist.mjs';

test('international and domestic trips show different country-relevant prompts', () => {
  const international = buildChecklist('international');
  const domestic = buildChecklist('domestic');
  assert.ok(international.some((item) => item.id === 'visa'));
  assert.ok(!domestic.some((item) => item.id === 'visa'));
  assert.ok(domestic.some((item) => item.id === 'id'));
  assert.ok(!international.some((item) => item.id === 'id'));
});

test('selected special needs add tasks without duplicates', () => {
  const items = buildChecklist('international', ['minors', 'minors', 'pets', 'nonexistent']);
  const ids = items.map((item) => item.id);
  assert.ok(ids.includes('minor-docs'));
  assert.ok(ids.includes('animals'));
  assert.equal(ids.length, new Set(ids).size);
});

test('every external source is secure, and no task is marked travel-authorized', () => {
  const items = buildChecklist('international', ['minors', 'accessibility', 'pets', 'medication']);
  const all = [...items, ...buildChecklist('domestic')];
  for (const item of all) {
    assert.ok(item.id && item.group && item.title && item.detail && item.sourceLabel);
    if (item.source) assert.match(item.source, /^https:\/\//);
    assert.ok(!Object.hasOwn(item, 'eligible'));
    assert.ok(!Object.hasOwn(item, 'authorized'));
  }
  for (const url of Object.values(SOURCES)) assert.match(url, /^https:\/\//);
});

test('rejects unknown journey types', () => {
  assert.throws(() => buildChecklist('spaceflight'), RangeError);
});
