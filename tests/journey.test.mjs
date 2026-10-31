import test from 'node:test';
import assert from 'node:assert/strict';
import { buildJourneyPlan, COUNTRIES, PURPOSE_OPTIONS, OFFICIAL_PORTALS } from '../src/journey.mjs';
const has = (plan, id) => plan.items.some((item) => item.id === id);

test('international journey uses route, citizenship, purpose, and transit context', () => {
  const plan = buildJourneyPlan({ origin: 'US', destination: 'GB', citizenship: 'IN', transit: 'DE', purpose: 'study', extras: ['medication'] });
  assert.equal(plan.kind, 'international');
  assert.match(plan.summary, /United States → United Kingdom.*Germany.*Study.*India/);
  assert.ok(has(plan, 'visa'));
  assert.ok(has(plan, 'transit-context'));
  assert.ok(has(plan, 'medicine'));
  assert.ok(plan.items.find((item) => item.id === 'purpose-context').detail.includes('study-specific'));
  assert.ok(plan.resources.some((resource) => resource.id === 'destination-GB'));
});
test('U.S. domestic trip shows TSA tasks without international visa tasks', () => {
  const plan = buildJourneyPlan({ origin: 'US', destination: 'US' });
  assert.equal(plan.kind, 'us-domestic');
  assert.ok(has(plan, 'id'));
  assert.ok(!has(plan, 'visa'));
  assert.ok(!has(plan, 'transit-context'));
});
test('non-U.S. domestic trip does not display U.S. screening requirements', () => {
  const plan = buildJourneyPlan({ origin: 'IN', destination: 'IN', citizenship: 'IN' });
  assert.equal(plan.kind, 'other-domestic');
  assert.ok(has(plan, 'local-id'));
  assert.ok(!has(plan, 'id'));
  assert.ok(!has(plan, 'visa'));
  assert.ok(!plan.resources.some((resource) => resource.id === 'tsa'));
});
test('same-country journey with a foreign transit is international', () => {
  const plan = buildJourneyPlan({ origin: 'US', destination: 'US', transit: 'CA' });
  assert.equal(plan.kind, 'international');
  assert.ok(has(plan, 'transit-context'));
  assert.ok(has(plan, 'visa'));
});
test('unlisted countries show coverage gaps rather than made-up government links', () => {
  const plan = buildJourneyPlan({ origin: 'US', destination: 'ZZ', citizenship: 'ZZ' });
  assert.equal(plan.kind, 'unspecified');
  assert.ok(plan.notices.some((note) => note.includes('not yet have a reviewed')));
  assert.ok(plan.notices.some((note) => note.includes('not in the starter list')));
  assert.ok(!plan.resources.some((resource) => resource.id === 'destination-ZZ'));
});
test('unknown input is rejected and country options are distinct', () => {
  assert.throws(() => buildJourneyPlan({ destination: 'XX' }), RangeError);
  assert.throws(() => buildJourneyPlan({ purpose: 'immigration_approved' }), RangeError);
  assert.throws(() => buildJourneyPlan({ extras: 'pets' }), TypeError);
  assert.equal(new Set(COUNTRIES.map((entry) => entry.code)).size, COUNTRIES.length);
  assert.equal(new Set(PURPOSE_OPTIONS.map((entry) => entry.value)).size, PURPOSE_OPTIONS.length);
});
test('all itinerary links are official HTTPS starting points and no eligibility claim is returned', () => {
  for (const source of Object.values(OFFICIAL_PORTALS)) assert.match(source.url, /^https:\/\//);
  const plan = buildJourneyPlan({ origin: 'CA', destination: 'AU', citizenship: 'PK', transit: 'GB', extras: ['pets', 'minors'] });
  for (const resource of plan.resources) assert.match(resource.url, /^https:\/\//);
  for (const item of plan.items) {
    if (item.source) assert.match(item.source, /^https:\/\//);
    assert.ok(!Object.hasOwn(item, 'eligible'));
    assert.ok(!Object.hasOwn(item, 'authorized'));
  }
  assert.equal(new Set(plan.items.map((item) => item.id)).size, plan.items.length);
});
test('non-US route never points packing and customs guidance to TSA or CBP', () => {
  const plan = buildJourneyPlan({ origin: 'GB', destination: 'CA', citizenship: 'GB' });
  assert.equal(plan.items.find((item) => item.id === 'baggage').source, null);
  assert.equal(plan.items.find((item) => item.id === 'customs').source, null);
  assert.equal(plan.items.find((item) => item.id === 'entry').source, OFFICIAL_PORTALS.CA.url);
});
