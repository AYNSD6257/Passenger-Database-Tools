import test from 'node:test';
import assert from 'node:assert/strict';
import { COUNTRIES, buildJourneyPlan } from '../src/journey.mjs';
import { AIRLINES, POLICY_TOPICS, CATALOG_REVIEW_DATE, COUNTRY_SOURCE_COUNT, OFFICIAL_PORTALS, findAirlines, findCountrySources, getAirline } from '../src/catalog.mjs';

test('directory distinguishes national and regional government guidance', () => {
  assert.equal(OFFICIAL_PORTALS.IN.coverage, 'national');
  assert.equal(OFFICIAL_PORTALS.FR.coverage, 'regional');
  assert.equal(COUNTRY_SOURCE_COUNT, Object.keys(OFFICIAL_PORTALS).length);
  const regional = buildJourneyPlan({ origin: 'US', destination: 'FR', transit: 'DE' });
  assert.ok(regional.notices.some(n => n.includes('REGIONAL overview')));
  assert.ok(regional.notices.some(n => n.includes('regional overview only')));
  assert.ok(regional.resources.some(r=>r.id==='destination-FR'));
  const national = buildJourneyPlan({ origin: 'US', destination: 'SG', transit: 'JP' });
  assert.ok(national.resources.some(r=>r.id==='destination-SG'));
  assert.ok(national.resources.some(r=>r.id==='transit-JP'));
});
test('source searching filters name and source coverage', () => {
  const france = findCountrySources(COUNTRIES,'france','regional');
  assert.equal(france.length, 1);
  assert.equal(france[0].code,'FR');
  assert.equal(findCountrySources(COUNTRIES,'france','national').length,0);
  assert.equal(findCountrySources(COUNTRIES,'Singapore','national')[0].code,'SG');
  assert.throws(()=>findCountrySources(COUNTRIES,'','unknown'),RangeError);
});
test('airline search only returns carrier-authored policy link for requested topic', () => {
  assert.ok(findAirlines('DELTA').some(a=>a.code==='DL'));
  assert.equal(findAirlines('BA','pets').length,0);
  assert.ok(findAirlines('American','service').some(a=>a.code==='AA'));
  assert.equal(getAirline('VS').name,'Virgin Atlantic');
  assert.equal(getAirline(''),null);
  assert.throws(()=>getAirline('XX'),RangeError);
  assert.throws(()=>findAirlines('','not-a-policy'),RangeError);
});
test('selected operating carrier appears in journey reminders and baggage source', () => {
  const plan = buildJourneyPlan({origin:'US',destination:'GB',airline:'VS'});
  assert.match(plan.summary,/Virgin Atlantic/);
  assert.equal(plan.items.find(i=>i.id==='baggage').source,getAirline('VS').links.baggage);
  assert.ok(plan.resources.some(r=>r.id==='airline-VS'));
  assert.ok(plan.notices.some(n=>n.includes('different carrier')));
});
test('no hard-coded prices or eligibility decisions in directories', () => {
  assert.match(CATALOG_REVIEW_DATE,/^\d{4}-\d{2}-\d{2}$/);
  assert.equal(new Set(AIRLINES.map(a=>a.code)).size,AIRLINES.length);
  assert.equal(new Set(POLICY_TOPICS.map(p=>p.code)).size,POLICY_TOPICS.length);
  for(const carrier of AIRLINES) for(const url of Object.values(carrier.links)) assert.match(url,/^https:\/\//);
  for(const source of Object.values(OFFICIAL_PORTALS)) {
    assert.match(source.url,/^https:\/\//);
    assert.ok(['national','regional'].includes(source.coverage));
    assert.ok(!Object.hasOwn(source,'eligible'));
  }
});
