import test from 'node:test';
import assert from 'node:assert/strict';
import {EXPLORER_AIRPORTS,getExplorerAirport,searchExplorerAirports,formatAirportClock,getCountryTravelResource} from '../src/explorer-data.mjs';
import {MAX_FLIGHT_LEGS,normalizeFlightLegs,buildFlightSummary,flightCountryPath} from '../src/itinerary.mjs';
test('airport registry contains distinct valid coordinates and IANA time zones',()=>{
 assert.ok(EXPLORER_AIRPORTS.length>=45);
 assert.equal(new Set(EXPLORER_AIRPORTS.map(a=>a.code)).size,EXPLORER_AIRPORTS.length);
 for(const a of EXPLORER_AIRPORTS){
   assert.ok(a.lat>=-90&&a.lat<=90&&a.lon>=-180&&a.lon<=180);
   assert.doesNotThrow(()=>new Intl.DateTimeFormat('en-US',{timeZone:a.timezone}).format(new Date()));
 }
 assert.equal(getExplorerAirport('IAD').timezone,'America/New_York');
 assert.ok(searchExplorerAirports('london').some(a=>a.code==='LHR'));
 assert.match(formatAirportClock('LHR',new Date('2026-10-30T12:00:00Z')),/Fri/);
});
test('itinerary supports airline-specific segments and traveler-entered local times',()=>{
 const trip=buildFlightSummary({departureDate:'2026-12-01',returnDate:'2026-12-20',legs:[
  {from:'IAD',to:'LHR',airline:'VS',flightNumber:'VS22',departureLocal:'2026-12-01T18:00',arrivalLocal:'2026-12-02T06:00'},
  {from:'LHR',to:'FRA',airline:'LH',flightNumber:'LH123',departureLocal:'2026-12-02T09:00',arrivalLocal:'2026-12-02T11:20'}]});
 assert.equal(trip.legs.length,2);assert.equal(trip.airports.length,3);
 assert.deepEqual(flightCountryPath(trip),['US','GB','DE']);
 assert.ok(getCountryTravelResource('GB'));assert.equal(getCountryTravelResource('ZZ'),null);
});
test('invalid itinerary inputs are rejected',()=>{
 assert.equal(MAX_FLIGHT_LEGS,6);
 assert.throws(()=>normalizeFlightLegs(Array(7).fill({from:'IAD',to:'LHR'})),RangeError);
 assert.throws(()=>normalizeFlightLegs([{from:'ZZZ',to:'LHR'}]),RangeError);
 assert.throws(()=>normalizeFlightLegs([{from:'IAD',to:'IAD'}]),RangeError);
 assert.throws(()=>normalizeFlightLegs([{from:'IAD',to:'LHR',airline:'BAD'}]),RangeError);
 assert.throws(()=>normalizeFlightLegs([{from:'IAD',to:'LHR',departureLocal:'tomorrow'}]),RangeError);
 assert.throws(()=>buildFlightSummary({departureDate:'2026-12-20',returnDate:'2026-12-01'}),RangeError);
});
test('unconnected legs show warnings and no flight schedule assertions',()=>{
 const trip=buildFlightSummary({legs:[{from:'IAD',to:'LHR'},{from:'FRA',to:'DXB'}]});
 assert.ok(trip.warnings.some(w=>w.includes('do not connect')));
 assert.ok(trip.warnings.some(w=>w.includes('traveler-supplied')));
});
