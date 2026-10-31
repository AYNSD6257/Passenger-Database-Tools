import test from 'node:test';
import assert from 'node:assert/strict';
import { buildJourneyPlan, normalizeConnections, MAX_CONNECTIONS } from '../src/journey.mjs';
import { AIRPORTS, findAirports, getAirport } from '../src/airports.mjs';

test('up to five ordered transit countries produce independent checklist steps',()=>{
  const plan=buildJourneyPlan({
    origin:'US',destination:'IN',citizenship:'US',
    transits:[{country:'GB',airport:'LHR'},{country:'DE',airport:'FRA'},{country:'AE',airport:'DXB'}]
  });
  assert.equal(plan.kind,'international');
  assert.equal(plan.connections.length,3);
  assert.ok(plan.summary.indexOf('United Kingdom')<plan.summary.indexOf('Germany'));
  assert.ok(plan.summary.indexOf('Germany')<plan.summary.indexOf('United Arab Emirates'));
  assert.ok(plan.items.some(i=>i.id==='transit-context'));
  assert.ok(plan.items.some(i=>i.id==='transit-context-2'));
  assert.ok(plan.items.some(i=>i.id==='transit-context-3'));
  assert.ok(plan.items.some(i=>i.id==='airport-context-2'));
  assert.ok(plan.resources.some(r=>r.id==='airport-LHR'));
  assert.ok(plan.resources.some(r=>r.id==='airport-FRA'));
});
test('legacy single transit parameter is still supported',()=>{
  const plan=buildJourneyPlan({origin:'US',destination:'GB',transit:'DE'});
  assert.deepEqual(plan.connections,[{country:'DE',airport:''}]);
  assert.ok(plan.resources.some(r=>r.id==='transit-DE'));
});
test('repeating transit country keeps distinct review tasks but one government link',()=>{
  const plan=buildJourneyPlan({origin:'US',destination:'GB',transits:['DE','DE']});
  assert.equal(plan.items.filter(i=>i.id.startsWith('transit-context')).length,2);
  assert.equal(plan.resources.filter(r=>r.id==='transit-DE').length,1);
});
test('domestic trip via foreign country triggers international prompts',()=>{
  const plan=buildJourneyPlan({origin:'US',destination:'US',transits:[{country:'CA',airport:'YYZ'}]});
  assert.equal(plan.kind,'international');
  assert.ok(plan.items.some(i=>i.id==='visa'));
});
test('domestic trip via same country stays domestic',()=>{
  const plan=buildJourneyPlan({origin:'US',destination:'US',transits:['US']});
  assert.equal(plan.kind,'us-domestic');
  assert.ok(plan.items.some(i=>i.id==='id'));
});
test('invalid connection arrays and mismatched airports are rejected',()=>{
  assert.equal(MAX_CONNECTIONS,5);
  assert.throws(()=>normalizeConnections('GB'),TypeError);
  assert.throws(()=>normalizeConnections(Array(6).fill('GB')),RangeError);
  assert.throws(()=>normalizeConnections([{country:'GB',airport:'FRA'}]),RangeError);
  assert.throws(()=>normalizeConnections([{country:'XX'}]),RangeError);
  assert.throws(()=>normalizeConnections([{country:'GB',airport:'???'}]),RangeError);
});
test('airport directory filters IATA code, city and country',()=>{
  assert.ok(AIRPORTS.length>=10);
  assert.equal(findAirports('IAD')[0].country,'US');
  assert.equal(findAirports('Heathrow')[0].code,'LHR');
  assert.equal(findAirports('Toronto','CA')[0].code,'YYZ');
  assert.equal(findAirports('Heathrow','US').length,0);
  assert.throws(()=>findAirports('','XX'),RangeError);
  assert.equal(getAirport(''),null);
  assert.throws(()=>getAirport('ABC'),RangeError);
});
test('airport URL registry contains distinct official HTTPS entries',()=>{
  assert.equal(AIRPORTS.length,new Set(AIRPORTS.map(a=>a.code)).size);
  for(const a of AIRPORTS){
    assert.ok(a.url.startsWith('https://'));
    assert.equal(a.code.length,3);
    assert.ok(a.country&&a.city&&a.name);
  }
});
test('unknown airport selection is not silently assigned to a different country',()=>{
  assert.throws(()=>buildJourneyPlan({transits:[{country:'FR',airport:'IAD'}]}),RangeError);
});
