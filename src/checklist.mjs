// General preparation prompts only. This module never makes a travel-eligibility determination.
export const SOURCES = Object.freeze({
  iata: 'https://www.iata.org/en/services/compliance/timatic/travel-documentation',
  state: 'https://travel.state.gov/en/international-travel/planning/checklist.html',
  tsa: 'https://www.tsa.gov/travel',
  tsaId: 'https://www.tsa.gov/travel/security-screening/identification',
  tsaItems: 'https://www.tsa.gov/travel/security-screening/whatcanibring/all',
  cbp: 'https://www.cbp.gov/travel'
});

const CORE = [
  { id: 'booking', group: 'Flight and airline', title: 'Review your booking and passenger name', detail: 'Confirm your itinerary, ticket status, passenger names, and connections directly with your airline.', sourceLabel: 'Contact your airline', source: null },
  { id: 'check-in', group: 'Flight and airline', title: 'Confirm check-in and boarding cutoffs', detail: 'Check your airline’s current online check-in options, arrival guidance, bag-drop deadlines, and boarding time.', sourceLabel: 'Contact your airline', source: null },
  { id: 'baggage', group: 'Flight and airline', title: 'Check baggage sizes, allowances, and fees', detail: 'Allowances vary by airline, route, cabin, fare, and status. Review restricted or oversized items.', sourceLabel: 'TSA: packing rules (U.S.)', source: SOURCES.tsaItems },
  { id: 'notifications', group: 'Flight and airline', title: 'Check flight status and gate updates', detail: 'Recheck notifications from the operating airline and airport before departure and at the terminal.', sourceLabel: 'Contact your airline', source: null }
];

const INTERNATIONAL = [
  { id: 'passport', group: 'International documents', title: 'Verify passport and travel-document validity', detail: 'Check destination and transit-country rules, including any passport validity or blank-page requirements.', sourceLabel: 'IATA Travel Centre', source: SOURCES.iata },
  { id: 'visa', group: 'International documents', title: 'Verify visa, ETA, and transit permission', detail: 'Rules depend on nationality, immigration status, trip purpose, route, and layovers. Verify with competent authorities and your airline.', sourceLabel: 'IATA Travel Centre', source: SOURCES.iata },
  { id: 'entry', group: 'International documents', title: 'Review destination entry, exit, and health rules', detail: 'Check official destination-government guidance for required declarations, documents, and other restrictions.', sourceLabel: 'State Department travel checklist', source: SOURCES.state },
  { id: 'connection', group: 'International documents', title: 'Confirm connection and onward-travel conditions', detail: 'Review airport transfers, possible border entry during connections, and any required onward or return documentation.', sourceLabel: 'IATA Travel Centre', source: SOURCES.iata },
  { id: 'customs', group: 'International documents', title: 'Understand customs and restricted items', detail: 'Check destination-specific rules on medication, food, currency, gifts, and other items.', sourceLabel: 'CBP (U.S. travel)', source: SOURCES.cbp }
];

const DOMESTIC = [
  { id: 'id', group: 'U.S. domestic travel', title: 'Check acceptable ID for U.S. security screening', detail: 'Verify the latest TSA identification requirements and any airline documentation rules for your situation.', sourceLabel: 'TSA identification rules', source: SOURCES.tsaId },
  { id: 'screening', group: 'U.S. domestic travel', title: 'Review airport security screening rules', detail: 'Confirm prohibited items, liquids, electronics, and any screening assistance needs using current TSA guidance.', sourceLabel: 'TSA travel guidance', source: SOURCES.tsa }
];

const EXTRA = {
  minors: [
    { id: 'minor-docs', group: 'Additional needs', title: 'Check documents and rules for minors', detail: 'Airline unaccompanied-minor policies and destination consent or custody documentation can differ. Confirm before travel.', sourceLabel: 'State Department travel checklist', source: SOURCES.state }
  ],
  accessibility: [
    { id: 'assistance', group: 'Additional needs', title: 'Arrange accessibility or mobility assistance', detail: 'Contact the airline about wheelchair assistance, service animals, seating, medical equipment, and airport-specific arrangements.', sourceLabel: 'TSA travel guidance (U.S.)', source: SOURCES.tsa }
  ],
  pets: [
    { id: 'animals', group: 'Additional needs', title: 'Confirm animal transport and entry requirements', detail: 'Airline, origin, destination, and transit rules vary for pets and service animals. Confirm carriers, reservations, and documents.', sourceLabel: 'Contact your airline', source: null }
  ],
  medication: [
    { id: 'medicine', group: 'Additional needs', title: 'Review medication and medical-device rules', detail: 'Review security screening and destination-country restrictions, including medicines that may be controlled abroad.', sourceLabel: 'State Department travel checklist', source: SOURCES.state }
  ]
};

export function buildChecklist(journey = 'international', extras = []) {
  if (!['international', 'domestic'].includes(journey)) throw new RangeError('Unsupported journey type');
  const selected = [...new Set(extras)].filter((key) => Object.hasOwn(EXTRA, key));
  return [...CORE, ...(journey === 'international' ? INTERNATIONAL : DOMESTIC), ...selected.flatMap((key) => EXTRA[key])];
}
