import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve,dirname } from 'node:path';
import { GLOBAL_FIELDS,searchGlobalAirports,airportRecord } from '../src/global-airports.mjs';
import {registerWorldwideAirport,getExplorerAirport,formatAirportClock} from '../src/explorer-data.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=(file)=>JSON.parse(readFileSync(resolve(root,file),'utf8'));
const meta=read('data/airports-global/meta.json');
const index=read('data/airports-global/index.json');
const clusters=read('data/airports-global/clusters.json');

test('complete airport import is consistent with metadata and schema',()=>{
 assert.deepEqual(index.fields,GLOBAL_FIELDS);
 assert.equal(index.rows.length,meta.geolocated_airports);
 assert.equal(index.rows.length+meta.invalid_coordinate_rows,meta.total_source_airports);
 assert.ok(index.rows.length>80000);
 assert.equal(new Set(index.rows.map(r=>r[0])).size,index.rows.length);
 assert.equal(index.rows.filter(r=>r[10]===1).length,meta.scheduled_service_rows);
});
test('globe clusters represent all imported records exactly once',()=>{
 const total=clusters.rows.reduce((n,row)=>n+row[2],0);
 const scheduled=clusters.rows.reduce((n,row)=>n+row[3],0);
 assert.equal(total,meta.geolocated_airports);
 assert.equal(scheduled,meta.scheduled_service_rows);
 assert.ok(clusters.rows.length>1000);
});
test('worldwide search can find scheduled, closed and non-IATA facilities',()=>{
 const iad=searchGlobalAirports(index.rows,{query:'IAD',kind:'all'}).records;
 assert.ok(iad.some(a=>a.iata==='IAD'));
 const closed=searchGlobalAirports(index.rows,{kind:'closed'});
 assert.ok(closed.count>10000);
 const scheduled=searchGlobalAirports(index.rows,{kind:'scheduled'});
 assert.equal(scheduled.count,meta.scheduled_service_rows);
 assert.ok(searchGlobalAirports(index.rows,{query:'this-does-not-exist-987'}).count===0);
});
test('imported airport can be registered for itinerary without fabricated timezone',()=>{
 const row=index.rows.find(r=>r[2]==='small_airport'&&!r[8]);
 const airport=airportRecord(row);
 registerWorldwideAirport(airport);
 assert.equal(getExplorerAirport(airport.code).id,airport.id);
 assert.match(formatAirportClock(airport.code),/unavailable/);
 assert.throws(()=>registerWorldwideAirport({...airport,code:'NOT-GLOBAL'}),TypeError);
});
test('world browser modules and controls parse and are wired',()=>{
 for(const f of ['src/global-airports.mjs','src/global-ui.mjs','src/orbital-ui.mjs','src/orbital-globe.mjs','app.js']){
  assert.doesNotThrow(()=>execFileSync(process.execPath,['--check',resolve(root,f)],{stdio:'pipe'}),f);
 }
 const html=readFileSync(resolve(root,'index.html'),'utf8');
 for(const id of ['world-load','world-status','world-total','world-search','world-kind','world-country','world-count','world-results','world-selected'])
  assert.ok(html.includes('id="'+id+'"'),id);
 const app=readFileSync(resolve(root,'app.js'),'utf8');
 assert.ok(app.includes('initWorldAirportSearch(orbitalController)'));
});
