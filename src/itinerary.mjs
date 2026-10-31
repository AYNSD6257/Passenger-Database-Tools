import { getExplorerAirport } from './explorer-data.mjs';
import { getAirline } from './catalog.mjs';
export const MAX_FLIGHT_LEGS=6;
const DATE=/^\d{4}-\d{2}-\d{2}$/;
const LOCAL=/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d$/;
export function normalizeFlightLegs(legs=[]){
 if(!Array.isArray(legs)||legs.length>MAX_FLIGHT_LEGS)throw new RangeError('Up to six flight legs allowed');
 return legs.map((leg,index)=>{
   if(!leg||typeof leg!=='object'||Array.isArray(leg))throw new TypeError('Invalid flight leg');
   const from=String(leg.from||'').toUpperCase(),to=String(leg.to||'').toUpperCase();
   if(!getExplorerAirport(from)||!getExplorerAirport(to))throw new RangeError('Choose supported airports for leg '+(index+1));
   if(from===to)throw new RangeError('A flight leg needs different departure and arrival airports');
   const airline=leg.airline||'';
   if(airline)getAirline(airline);
   const number=String(leg.flightNumber||'').trim().toUpperCase();
   if(number&&!/^[A-Z0-9 -]{1,12}$/.test(number))throw new RangeError('Invalid flight number');
   const departureLocal=leg.departureLocal||'',arrivalLocal=leg.arrivalLocal||'';
   if(departureLocal&&!LOCAL.test(departureLocal))throw new RangeError('Invalid local departure date-time');
   if(arrivalLocal&&!LOCAL.test(arrivalLocal))throw new RangeError('Invalid local arrival date-time');
   return Object.freeze({from,to,airline,flightNumber:number,departureLocal,arrivalLocal});
 });
}
export function buildFlightSummary({legs=[],departureDate='',returnDate=''}={}){
 const normalized=normalizeFlightLegs(legs);
 if(departureDate&&!DATE.test(departureDate))throw new RangeError('Invalid departure date');
 if(returnDate&&!DATE.test(returnDate))throw new RangeError('Invalid return date');
 if(departureDate&&returnDate&&returnDate<departureDate)throw new RangeError('Return date is before departure date');
 const warnings=[];
 if(!normalized.length)warnings.push('Add at least one flight segment for your itinerary.');
 normalized.forEach((leg,i)=>{
   if(i>0&&normalized[i-1].to!==leg.from)warnings.push('Flight legs '+i+' and '+(i+1)+' do not connect at the same airport.');
   if(!leg.departureLocal||!leg.arrivalLocal)warnings.push('Leg '+(i+1)+': planned flight times are incomplete.');
 });
 warnings.push('Entered flight times are traveler-supplied local times, not live schedules; no time-zone conversion or connection feasibility is guaranteed.');
 const airports=[...new Set(normalized.flatMap(leg=>[leg.from,leg.to]))].map(getExplorerAirport);
 return Object.freeze({legs:normalized,departureDate,returnDate,airports,warnings});
}
export function flightCountryPath(summary){
 const path=summary.legs.length?[summary.legs[0].from,...summary.legs.map(l=>l.to)]:[];
 return path.map(getExplorerAirport).filter(Boolean).map(a=>a.country);
}
