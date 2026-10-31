import { buildChecklist, SOURCES } from './checklist.mjs';
import { OFFICIAL_PORTALS, getAirline } from './catalog.mjs';
export { OFFICIAL_PORTALS } from './catalog.mjs';
import { getAirport } from './airports.mjs';

// Starter country selection only. No nationality, visa or entry decisions are inferred.
export const COUNTRIES = Object.freeze([
  ['US', 'United States'], ['GB', 'United Kingdom'], ['CA', 'Canada'],
  ['FR', 'France'], ['DE', 'Germany'], ['IN', 'India'], ['PK', 'Pakistan'],
  ['AE', 'United Arab Emirates'], ['AU', 'Australia'], ['JP', 'Japan'],
  ['NL', 'Netherlands'], ['ES', 'Spain'], ['IT', 'Italy'], ['CH', 'Switzerland'],
  ['SE', 'Sweden'], ['NO', 'Norway'], ['DK', 'Denmark'], ['FI', 'Finland'],
  ['IE', 'Ireland'], ['PT', 'Portugal'], ['LU', 'Luxembourg'], ['BE', 'Belgium'],
  ['TR', 'Türkiye'], ['SA', 'Saudi Arabia'], ['QA', 'Qatar'], ['EG', 'Egypt'],
  ['MX', 'Mexico'], ['BR', 'Brazil'], ['AR', 'Argentina'], ['ZA', 'South Africa'],
  ['KE', 'Kenya'], ['NG', 'Nigeria'], ['SG', 'Singapore'], ['MY', 'Malaysia'],
  ['TH', 'Thailand'], ['KR', 'South Korea'], ['CN', 'China'], ['NZ', 'New Zealand'],
  ['BD', 'Bangladesh'], ['LK', 'Sri Lanka'], ['NP', 'Nepal'],
  ['ID', 'Indonesia'], ['PH', 'Philippines'],
  ['ZZ', 'Other / not listed']
].map(([code, name]) => Object.freeze({ code, name })));

const NAMES = new Map(COUNTRIES.map(({ code, name }) => [code, name]));
const PURPOSES = Object.freeze({
  tourism: { label: 'Tourism', prompt: 'Check whether visitor permission and evidence of accommodation or onward travel apply to your trip.' },
  business: { label: 'Business', prompt: 'Confirm what activities your entry category permits and whether invitations or business documentation apply.' },
  study: { label: 'Study', prompt: 'Check whether admission records, financial evidence, and study-specific immigration permission apply.' },
  work: { label: 'Work', prompt: 'Confirm any work authorization or sponsorship requirement before accepting employment or traveling.' },
  family: { label: 'Visiting family', prompt: 'Check whether visitor or family-route documentation, invitations, or proof of relationship apply.' },
  other: { label: 'Other purpose', prompt: 'Identify your intended activities and check the appropriate immigration category with official authorities.' }
});
export const PURPOSE_OPTIONS = Object.freeze(Object.entries(PURPOSES).map(([value, data]) => Object.freeze({ value, label: data.label })));

const task = (id, title, detail, sourceLabel = 'Confirm with your airline / the relevant authority', source = null) => ({
  id, group: 'Your itinerary', title, detail, sourceLabel, source
});
function validateCountry(code, field) {
  if (typeof code !== 'string' || !NAMES.has(code)) throw new RangeError('Unsupported ' + field);
  return NAMES.get(code);
}
function addResource(resources, id, title, description, url) {
  if (!resources.some((resource) => resource.id === id)) resources.push({ id, title, description, url });
}
// Supports legacy single-transit string for existing integrations.
export const MAX_CONNECTIONS = 5;
export function normalizeConnections(transits, transit = '') {
  const raw = transits === undefined ? (transit ? [transit] : []) : transits;
  if (!Array.isArray(raw)) throw new TypeError('Connections must be an array');
  if (raw.length > MAX_CONNECTIONS) throw new RangeError('Too many connection stops');
  return raw.map((entry, index) => {
    const stop = typeof entry === 'string' ? {country:entry,airport:''} : entry;
    if (!stop || typeof stop !== 'object' || Array.isArray(stop)) throw new TypeError('Invalid connection');
    const country = stop.country;
    const airportCode = stop.airport ?? '';
    validateCountry(country, 'country at connection ' + (index + 1));
    if (typeof airportCode !== 'string') throw new TypeError('Airport code must be a string');
    const airport = getAirport(airportCode);
    if (airport && airport.country !== country) throw new RangeError('Airport country does not match connection');
    return Object.freeze({country,airport:airportCode});
  });
}
export function buildJourneyPlan({
  origin='US', destination='GB', citizenship='US', transit='',
  transits=undefined, purpose='tourism', extras=[], airline=''
}={}) {
  const originName=validateCountry(origin,'departure country');
  const destinationName=validateCountry(destination,'destination country');
  const citizenshipName=validateCountry(citizenship,'passport-issuing country');
  const connections=normalizeConnections(transits,transit);
  if (!Object.hasOwn(PURPOSES,purpose)) throw new RangeError('Unsupported purpose of travel');
  if (!Array.isArray(extras)) throw new TypeError('Extras must be an array');
  const operatingCarrier=getAirline(airline);
  const routeUnspecified=[origin,destination,...connections.map(s=>s.country)].includes('ZZ');
  const crossBorderStop=connections.some(s=>s.country!==origin || s.country!==destination);
  const kind=routeUnspecified ? 'unspecified' :
    origin===destination&&!crossBorderStop ? (origin==='US'?'us-domestic':'other-domestic') : 'international';
  const crossBorder=kind==='international'||kind==='unspecified';
  const items=[],resources=[],notices=[];
  items.push(task('route-review','Review your itinerary and connecting segments',
    'Check all flight numbers, operating airlines, airport codes, dates and connections on your ticket. An airport shown here is a user selection, not a verified flight routing.'));
  if (operatingCarrier) {
    items.push(task('airline-policy-review','Review '+operatingCarrier.name+' passenger policies',
      'Rules depend on fare, ticket, route and operating carrier for each segment. Check each airline on multi-carrier journeys.',
      operatingCarrier.name+' — baggage policy',operatingCarrier.links.baggage));
    notices.push('Selected airline: '+operatingCarrier.name+'. If any part of the itinerary is operated by a different carrier, check that carrier separately.');
    addResource(resources,'airline-'+airline,operatingCarrier.name+' — baggage and fees',
      'Check your booking for applicable allowances.',operatingCarrier.links.baggage);
  }
  if (crossBorder) {
    items.push(task('passport-context','Verify documents for a passport issued by '+citizenshipName,
      'Check nationality, residence status, visa status, other passports, document type, itinerary and current rules.',
      'IATA travel-document information',SOURCES.iata));
    items.push(task('purpose-context','Review '+PURPOSES[purpose].label.toLowerCase()+' travel requirements',
      PURPOSES[purpose].prompt,OFFICIAL_PORTALS[destination]?.title??'Find the destination government or embassy',
      OFFICIAL_PORTALS[destination]?.url??null));
    if(!connections.length) notices.push('No connections selected. If your flight connects, add each transit country and verify its individual requirements.');
    for(const [index,stop] of connections.entries()){
      const number=index+1,code=stop.country,name=validateCountry(code,'connection country');
      const id=index===0?'transit-context':'transit-context-'+number;
      items.push(task(id,'Review connection '+number+' in '+name,
        'Verify transit visa/authorization, airside availability, possible immigration entry, baggage recheck, onward ticket and terminal transfer for this specific stop.',
        OFFICIAL_PORTALS[code]?.title??'Check transit country immigration authority',
        OFFICIAL_PORTALS[code]?.url??null));
      if(code===origin||code===destination) notices.push('Connection '+number+' matches your departure or destination country; verify the full flight sequence.');
      if(OFFICIAL_PORTALS[code]){
        addResource(resources,'transit-'+code,OFFICIAL_PORTALS[code].title,
          'Government '+OFFICIAL_PORTALS[code].coverage+' information for connection '+number+' in '+name,
          OFFICIAL_PORTALS[code].url);
        if(OFFICIAL_PORTALS[code].coverage==='regional')
          notices.push('Connection '+number+' ('+name+'): EU/Schengen link is a regional overview only, NOT complete national transit/entry guidance.');
      } else notices.push('Connection '+number+' ('+name+'): no reviewed government transit source is available. Consult the national immigration authority or embassy.');
      if(stop.airport){
        const airport=getAirport(stop.airport);
        items.push(task('airport-context-'+number,'Review '+airport.code+' airport connections',
          'Check the airport operator map for transfers, terminal changes and services. Flight-specific connection feasibility is not verified.',
          airport.name+' — operator map',airport.url));
        addResource(resources,'airport-'+airport.code,airport.name+' ('+airport.code+') — airport map',
          'Airport-operator map, not a live gate assignment or connection guarantee.',airport.url);
      }
    }
    if(OFFICIAL_PORTALS[destination]){
      items.push(task('destination-portal','Read official entry guidance for '+destinationName,
        'Check requirements for your complete circumstances and date of travel.',
        OFFICIAL_PORTALS[destination].title,OFFICIAL_PORTALS[destination].url));
      addResource(resources,'destination-'+destination,OFFICIAL_PORTALS[destination].title,
        'Official '+OFFICIAL_PORTALS[destination].coverage+' entry-information starting point for '+destinationName,
        OFFICIAL_PORTALS[destination].url);
      if(OFFICIAL_PORTALS[destination].coverage==='regional')
        notices.push('For '+destinationName+', the EU/Schengen link is a REGIONAL overview, not complete national immigration guidance.');
    }else notices.push('We do not yet have a reviewed immigration-authority link for '+destinationName+'. Find its official government or embassy website.');
  } else if(kind==='other-domestic') notices.push('For domestic travel in '+destinationName+', check local ID and screening rules with the airline and competent authorities.');
  // Domestic connections still need a distinct transfer reminder and airport map.
  if(!crossBorder){
    for(const [index,stop] of connections.entries()){
      const number=index+1,name=validateCountry(stop.country,'domestic connection');
      items.push(task('domestic-connection-'+number,'Review domestic connection '+number+' in '+name,
        'Confirm operating airlines, arrival and departure terminals, luggage transfer, screening, and any applicable local document checks.',
        'Check the airport and operating airline',null));
      if(stop.airport){
        const airport=getAirport(stop.airport);
        items.push(task('airport-context-'+number,'Review '+airport.code+' airport connections',
          'Use the airport-operator map for wayfinding. The app does not validate your terminal, flight or connection time.',
          airport.name+' — airport map',airport.url));
        addResource(resources,'airport-'+airport.code,airport.name+' ('+airport.code+') — airport map',
          'Airport-operator wayfinding information; verify current operational details.',airport.url);
      }
    }
  }
  if(origin==='US')addResource(resources,'tsa','TSA — U.S. airport screening','Official U.S. departure screening and packing guidance',SOURCES.tsa);
  if(destination==='US')addResource(resources,'cbp','CBP — Entering the United States','Official U.S. border and customs guidance',SOURCES.cbp);
  if(crossBorder)addResource(resources,'iata','IATA — Travel documentation','Reference only; verify with all relevant government authorities',SOURCES.iata);
  if(routeUnspecified||citizenship==='ZZ')notices.push('One or more countries are not in the starter list. This plan cannot fully address the route.');
  notices.push('No visa, boarding, minimum-connection-time or admission eligibility is determined. Recheck each connection with your airline and official authorities.');
  const baseKind=kind==='us-domestic'?'domestic':kind==='other-domestic'?'domestic-other':'international';
  const contextualBase=buildChecklist(baseKind,extras).map(item=>{
    if(item.id==='baggage'&&operatingCarrier)return {...item,sourceLabel:operatingCarrier.name+' — baggage information',source:operatingCarrier.links.baggage};
    if(item.id==='baggage'&&origin!=='US')return {...item,sourceLabel:'Check your airline and departure authority',source:null};
    if(item.id==='entry')return {...item,sourceLabel:OFFICIAL_PORTALS[destination]?.title??'Check the destination authority',source:OFFICIAL_PORTALS[destination]?.url??null};
    if(item.id==='customs')return {...item,sourceLabel:destination==='US'?'CBP — U.S. travel':'Check destination customs authority',source:destination==='US'?SOURCES.cbp:null};
    if((item.id==='minor-docs'||item.id==='medicine')&&destination!=='US')
      return {...item,sourceLabel:OFFICIAL_PORTALS[destination]?.title??'Check destination government and airline',source:OFFICIAL_PORTALS[destination]?.url??null};
    if(item.id==='assistance'&&origin!=='US')return {...item,sourceLabel:'Check your airline and departure authority',source:null};
    return item;
  });
  const route=[originName,...connections.map(stop=>validateCountry(stop.country,'connection country')),destinationName].join(' → ');
  return {
    kind,connections,
    summary:route+' · '+PURPOSES[purpose].label+' · Passport: '+citizenshipName+
      (operatingCarrier?' · Airline: '+operatingCarrier.name:''),
    items:[...items,...contextualBase],resources,notices
  };
}
