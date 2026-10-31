import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'..');
const file=path=>readFileSync(resolve(root,path),'utf8');

test('browser modules and main application parse as JavaScript',()=>{
 for(const path of ['app.js','src/orbital-ui.mjs','src/orbital-globe.mjs',
                     'src/explorer-data.mjs','src/itinerary.mjs']){
  assert.doesNotThrow(()=>execFileSync(process.execPath,['--check',resolve(root,path)]),
    {stdio:'pipe'}),path);
 }
});
test('orbital explorer controls expected by browser modules exist in HTML',()=>{
 const html=file('index.html');
 const ids=['orbit-canvas','orbital-motion','orbital-airport-select','selected-airport-name',
  'selected-airport-city','selected-airport-time','selected-timezone','selected-document-link',
  'selected-document-status','selected-airport-map','orbital-airport-total','flight-preview',
  'flight-feedback','trip-departure','trip-return','flight-legs','add-flight-leg',
  'flight-print','trip-clocks'];
 for(const id of ids)assert.ok(html.includes('id="'+id+'"'),'Missing #'+id);
 const script=file('app.js');
 assert.ok(script.includes("initOrbitalExplorer({onTripChange:syncJourneyFromFlightLegs})"));
 assert.ok(script.includes('syncJourneyFromFlightLegs'));
});
test('bundled globe land data is a nonempty self-hosted JSON polygon collection',()=>{
 const geo=JSON.parse(file('data/land.json'));
 assert.ok(Array.isArray(geo.polygons));
 assert.ok(geo.polygons.length>200);
 assert.ok(geo.polygons.every(p=>Array.isArray(p)&&p.length>2));
});
test('orbital browser UI module is importable without loading a remote SDK',async()=>{
 const ui=await import('../src/orbital-ui.mjs');
 const globe=await import('../src/orbital-globe.mjs');
 assert.equal(typeof ui.initOrbitalExplorer,'function');
 assert.equal(typeof globe.createOrbitalGlobe,'function');
});
