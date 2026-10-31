// Maintained links to authoritative starting points; never interpreted as live rules.
// reviewDate dates record the last editorial URL check, NOT regulatory validity.
export const CATALOG_REVIEW_DATE = '2026-10-30';
const link=(title,url,coverage='national',note='')=>Object.freeze({title,url,coverage,note,reviewDate:CATALOG_REVIEW_DATE});
const schengen=link('European Union — Travel documents for non-EU nationals','https://europa.eu/youreurope/citizens/travel/entry-exit/non-eu-nationals/index_en.htm','regional','EU/Schengen general overview only; check the specific national immigration authority and any special circumstances.');
export const OFFICIAL_PORTALS=Object.freeze({
  US:link('U.S. Department of State — Visa Wizard','https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/wizard.html'),
  GB:link('GOV.UK — Check if you need a visa','https://www.gov.uk/check-uk-visa'),
  CA:link('Government of Canada — Visa / eTA checker','https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/check-visa-eta.html'),
  AU:link('Australian Department of Home Affairs — Entry','https://immi.homeaffairs.gov.au/entering-and-leaving-australia/entering-australia/can-i-go-to-australia'),
  IN:link('Government of India — e-Visa information','https://indianvisaonline.gov.in/evisa/','national','Information relates to Indian e-Visa categories; check other immigration categories with Indian authorities.'),
  SG:link('Singapore ICA — Entry requirements checker','https://www.ica.gov.sg/information-and-e-services/entry-and-departure/entering-singapore'),
  NZ:link('Immigration New Zealand — Find and choose a visa','https://www.immigration.govt.nz/process-to-apply/find-a-visa-tool/'),
  AE:link('UAE Government — Visa information','https://u.ae/en/information-and-services/visa-and-emirates-id/visa-information'),
  JP:link('Embassy of Japan — Visa and travel information','https://www.us.emb-japan.go.jp/itpr_en/travel_and_visa.html','national','U.S.-based embassy guidance; applicants elsewhere should consult their relevant Japanese diplomatic mission.'),
  FR:schengen, DE:schengen, NL:schengen, ES:schengen, IT:schengen,
  CH:schengen, SE:schengen, NO:schengen, DK:schengen, FI:schengen,
  PT:schengen, LU:schengen, BE:schengen
});
export const COUNTRY_SOURCE_COUNT=Object.keys(OFFICIAL_PORTALS).length;

// Only airline-authored pages, cross-checked via airline sites or US GSA directory.
// Unknown entries are deliberately absent; do not infer baggage quantities or prices.
export const AIRLINES=Object.freeze([
 {code:'AA',name:'American Airlines',links:{baggage:'https://www.aa.com/web/i18n/travel-info/baggage/checked-baggage-policy.html',pets:'https://www.aa.com/web/i18n/travel-info/special-assistance/pets.html',service:'https://www.aa.com/web/i18n/travel-info/special-assistance/service-animals.html'}},
 {code:'DL',name:'Delta Air Lines',links:{baggage:'https://www.delta.com/en_US/traveling-with-us/baggage',pets:'https://www.delta.com/us/en/pet-travel/overview',service:'https://www.delta.com/us/en/accessible-travel-services/service-animals'}},
 {code:'UA',name:'United Airlines',links:{baggage:'https://www.united.com/en/US/checked-bag-fee-calculator/any-flights',pets:'https://www.united.com/en/us/fly/travel/traveling-with-pets.html'}},
 {code:'BA',name:'British Airways',links:{baggage:'https://www.britishairways.com/content/en/us/information/baggage-essentials'}},
 {code:'VS',name:'Virgin Atlantic',links:{baggage:'https://help.virginatlantic.com/us/en/baggage/check-in-baggage-allowance.html'}},
 {code:'EK',name:'Emirates',links:{baggage:'https://www.emirates.com/english/before-you-fly/baggage/'}},
 {code:'LH',name:'Lufthansa',links:{baggage:'https://www.lufthansa.com/us/en/baggage-and-other-fees'}},
 {code:'AC',name:'Air Canada',links:{baggage:'https://www.aircanada.com/ca/en/aco/home/plan/baggage/checked.html'}},
 {code:'QR',name:'Qatar Airways',links:{baggage:'https://www.qatarairways.com/en-us/help/baggage-allowance.html'}},
 {code:'AS',name:'Alaska Airlines',links:{baggage:'https://www.alaskaair.com/content/travel-info/baggage/checked-bags'}}
].map(({code,name,links})=>Object.freeze({code,name,links:Object.freeze(links),reviewDate:CATALOG_REVIEW_DATE})));
const AIRLINE_CODES=new Map(AIRLINES.map(carrier=>[carrier.code,carrier]));
export const POLICY_TOPICS=Object.freeze([
 Object.freeze({code:'baggage',label:'Baggage allowances & fees'}),
 Object.freeze({code:'pets',label:'Traveling with pets'}),
 Object.freeze({code:'service',label:'Service animals'})
]);
export function getAirline(code=''){
 if(code==='')return null;
 if(typeof code!=='string'||!AIRLINE_CODES.has(code))throw new RangeError('Unsupported airline');
 return AIRLINE_CODES.get(code);
}
export function findAirlines(query='',topic='baggage'){
 if(!POLICY_TOPICS.some(x=>x.code===topic))throw new RangeError('Unsupported airline policy topic');
 const term=String(query).trim().toLowerCase();
 return AIRLINES.filter(a=>(a.name.toLowerCase().includes(term)||a.code.toLowerCase().includes(term))&&a.links[topic]);
}
export function findCountrySources(countries,query='',coverage='all'){
 if(!['all','national','regional'].includes(coverage))throw new RangeError('Unsupported source coverage');
 const term=String(query).trim().toLowerCase();
 return countries.filter(c=>(c.name.toLowerCase().includes(term)||c.code.toLowerCase().includes(term))&&OFFICIAL_PORTALS[c.code]&&(coverage==='all'||OFFICIAL_PORTALS[c.code].coverage===coverage)).map(c=>({code:c.code,name:c.name,...OFFICIAL_PORTALS[c.code]}));
}
