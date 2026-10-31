import { buildChecklist, SOURCES } from './checklist.mjs';
import { OFFICIAL_PORTALS, getAirline } from './catalog.mjs';
export { OFFICIAL_PORTALS } from './catalog.mjs';

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
export function buildJourneyPlan({ origin = 'US', destination = 'GB', citizenship = 'US', transit = '', purpose = 'tourism', extras = [], airline = '' } = {}) {
  const originName = validateCountry(origin, 'departure country');
  const destinationName = validateCountry(destination, 'destination country');
  const citizenshipName = validateCountry(citizenship, 'passport-issuing country');
  const transitName = transit === '' ? '' : validateCountry(transit, 'transit country');
  if (!Object.hasOwn(PURPOSES, purpose)) throw new RangeError('Unsupported purpose of travel');
  if (!Array.isArray(extras)) throw new TypeError('Extras must be an array');
  const operatingCarrier = getAirline(airline);

  const routeUnspecified = origin === 'ZZ' || destination === 'ZZ' || transit === 'ZZ';
  const crossBorderStop = Boolean(transit && transit !== origin && transit !== destination);
  const kind = routeUnspecified ? 'unspecified' : origin === destination && !crossBorderStop ? (origin === 'US' ? 'us-domestic' : 'other-domestic') : 'international';
  const crossBorder = kind === 'international' || kind === 'unspecified';
  const items = [];
  const resources = [];
  const notices = [];
  items.push(task('route-review', 'Review your ' + originName + ' → ' + destinationName + ' itinerary', 'Confirm the operating airline, all stops, boarding cutoffs, and ticket details. Your selections are not sent to a server.'));

  if (operatingCarrier) {
    items.push(task('airline-policy-review','Review ' + operatingCarrier.name + ' passenger policies','Baggage and special-service rules depend on ticket, fare, status, route and the carrier operating each segment. Check every operating carrier.',operatingCarrier.name + ' — baggage policy',operatingCarrier.links.baggage));
    notices.push('Selected airline: ' + operatingCarrier.name + '. If any part of your journey is operated by a different carrier, check that carrier separately.');
    addResource(resources,'airline-' + airline,operatingCarrier.name + ' — baggage and fees','Operating-carrier reference; check your ticket and booking for the applicable allowance.',operatingCarrier.links.baggage);
  }
  if (crossBorder) {
    items.push(task('passport-context', 'Verify documents for a passport issued by ' + citizenshipName, 'Citizenship alone cannot establish entry or transit requirements. Check residence status, visa status, multiple passports, document type, and current rules.', 'IATA travel-document information', SOURCES.iata));
    items.push(task('purpose-context', 'Review ' + PURPOSES[purpose].label.toLowerCase() + ' travel requirements', PURPOSES[purpose].prompt, OFFICIAL_PORTALS[destination]?.title ?? 'Find the destination government or embassy', OFFICIAL_PORTALS[destination]?.url ?? null));
    if (transit) {
      items.push(task('transit-context', 'Confirm connection rules for ' + transitName, 'Check transit documents, airside transfers, terminal changes, and possible border entry in ' + transitName + ', even if you do not plan to leave the airport.', OFFICIAL_PORTALS[transit]?.title ?? 'Find the transit-country immigration authority', OFFICIAL_PORTALS[transit]?.url ?? null));
      if (transit === origin || transit === destination) notices.push('Your transit country matches the departure or destination country. Double-check your itinerary and any additional connections.');
    } else {
      notices.push('No transit country selected. If your flight connects through another country, add it and check each connection separately.');
    }
    if (OFFICIAL_PORTALS[destination]) {
      items.push(task('destination-portal', 'Read official entry guidance for ' + destinationName, 'Check the destination authority directly for travel requirements based on your complete circumstances and travel date.', OFFICIAL_PORTALS[destination].title, OFFICIAL_PORTALS[destination].url));
      addResource(resources, 'destination-' + destination, OFFICIAL_PORTALS[destination].title, 'Official ' + OFFICIAL_PORTALS[destination].coverage + ' guidance starting point for ' + destinationName, OFFICIAL_PORTALS[destination].url);
      if (OFFICIAL_PORTALS[destination].coverage === 'regional') notices.push('For ' + destinationName + ', the linked EU/Schengen guide is a REGIONAL overview, not country-specific entry advice. Also check the national immigration authority or embassy.');
    } else {
      notices.push('We do not yet have a reviewed immigration-authority link for ' + destinationName + '. Find its official government or embassy website before traveling.');
    }
    if (transit && transit !== destination && OFFICIAL_PORTALS[transit]) {
      addResource(resources, 'transit-' + transit, OFFICIAL_PORTALS[transit].title, 'Official ' + OFFICIAL_PORTALS[transit].coverage + ' overview for transit in ' + transitName, OFFICIAL_PORTALS[transit].url);
      if (OFFICIAL_PORTALS[transit].coverage === 'regional') notices.push('For transit through ' + transitName + ', EU/Schengen information is a regional overview only; consult national transit/entry guidance.');
    }
    else if (transit && !OFFICIAL_PORTALS[transit]) notices.push('We do not yet have a reviewed government transit link for ' + transitName + '. Check its official immigration authority.');
  } else if (kind === 'other-domestic') {
    notices.push('This journey is within ' + destinationName + '. Local ID and screening requirements are not covered by the U.S. TSA guidance; verify them with your airline and local authorities.');
  }
  if (origin === 'US') addResource(resources, 'tsa', 'TSA — U.S. airport screening', 'Official U.S. departure screening and packing guidance', SOURCES.tsa);
  if (destination === 'US') addResource(resources, 'cbp', 'CBP — Entering the United States', 'Official U.S. border and customs information', SOURCES.cbp);
  if (crossBorder) addResource(resources, 'iata', 'IATA — Travel documentation', 'General reference; verify with destination and transit authorities', SOURCES.iata);
  if (routeUnspecified || citizenship === 'ZZ') notices.push('One or more countries are not in the starter list. This plan is general, not a complete review of your route or documents.');
  notices.push('This checklist cannot determine visa eligibility, boarding eligibility, or permission to enter or transit. Verify details with official authorities and your operating airline.');

  const baseKind = kind === 'us-domestic' ? 'domestic' : kind === 'other-domestic' ? 'domestic-other' : 'international';
  const contextualBase = buildChecklist(baseKind, extras).map((item) => {
    if (item.id === 'baggage' && operatingCarrier) return { ...item, sourceLabel: operatingCarrier.name + ' — baggage information', source: operatingCarrier.links.baggage };
    if (item.id === 'baggage' && origin !== 'US') return { ...item, sourceLabel: 'Check your airline and departure authority', source: null };
    if (item.id === 'entry') return { ...item, sourceLabel: OFFICIAL_PORTALS[destination]?.title ?? 'Check the destination authority', source: OFFICIAL_PORTALS[destination]?.url ?? null };
    if (item.id === 'customs') return { ...item, sourceLabel: destination === 'US' ? 'CBP — U.S. travel' : 'Check destination customs authority', source: destination === 'US' ? SOURCES.cbp : null };
    if ((item.id === 'minor-docs' || item.id === 'medicine') && destination !== 'US') return { ...item, sourceLabel: OFFICIAL_PORTALS[destination]?.title ?? 'Check destination government and airline', source: OFFICIAL_PORTALS[destination]?.url ?? null };
    if (item.id === 'assistance' && origin !== 'US') return { ...item, sourceLabel: 'Check your airline and departure authority', source: null };
    return item;
  });
  return {
    kind,
    summary: originName + ' → ' + destinationName + (transit ? ' · via ' + transitName : '') + ' · ' + PURPOSES[purpose].label + ' · Passport: ' + citizenshipName + (operatingCarrier ? ' · Airline: ' + operatingCarrier.name : ''),
    items: [...items, ...contextualBase],
    resources,
    notices
  };
}
