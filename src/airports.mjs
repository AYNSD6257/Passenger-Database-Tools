// Curated airport-operator map and wayfinding links. No live terminal, gate,
// minimum-connection-time or border-crossing information is calculated.
export const AIRPORT_REVIEW_DATE = '2026-10-30';
export const AIRPORTS = Object.freeze([
  {code:'IAD',name:'Washington Dulles International',city:'Washington, DC / Dulles',country:'US',url:'https://www.flydulles.com/travel-information/airport-and-terminal-maps'},
  {code:'JFK',name:'John F. Kennedy International',city:'New York',country:'US',url:'https://www.jfkairport.com/explore-jfk/airport-map'},
  {code:'ATL',name:'Hartsfield-Jackson Atlanta International',city:'Atlanta',country:'US',url:'https://www.atl.com/maps/'},
  {code:'LHR',name:'London Heathrow',city:'London',country:'GB',url:'https://www.heathrow.com/at-the-airport/airport-maps'},
  {code:'FRA',name:'Frankfurt Airport',city:'Frankfurt',country:'DE',url:'https://www.frankfurt-airport.com/en/at-the-airport/orientation/airport-map.html'},
  {code:'AMS',name:'Amsterdam Airport Schiphol',city:'Amsterdam',country:'NL',url:'https://www.schiphol.nl/en/airport-maps/'},
  {code:'DXB',name:'Dubai International Airport',city:'Dubai',country:'AE',url:'https://dubaiairports.ae/express-maps'},
  {code:'YYZ',name:'Toronto Pearson International',city:'Toronto',country:'CA',url:'https://www.torontopearson.com/en/while-you-are-here/terminal-maps'},
  {code:'SIN',name:'Singapore Changi Airport',city:'Singapore',country:'SG',url:'https://www.changiairport.com/in/en/at-changi/map.html'},
  {code:'HND',name:'Tokyo Haneda Airport',city:'Tokyo',country:'JP',url:'https://www.tokyo-haneda.com/en/floor/floor-guide.html'},
  {code:'SYD',name:'Sydney Airport',city:'Sydney',country:'AU',url:'https://www.sydneyairport.com/airport-guide/departing/domestic/maps'}
].map(a=>Object.freeze({...a,reviewDate:AIRPORT_REVIEW_DATE})));
const BY_CODE=new Map(AIRPORTS.map(a=>[a.code,a]));
export function getAirport(code=''){
  if(code==='') return null;
  if(typeof code!=='string'||!BY_CODE.has(code)) throw new RangeError('Unsupported airport');
  return BY_CODE.get(code);
}
export function findAirports(query='',country='all'){
  if(country!=='all'&&!AIRPORTS.some(a=>a.country===country)) throw new RangeError('Unsupported airport country');
  const q=String(query).trim().toLowerCase();
  return AIRPORTS.filter(a=>(country==='all'||a.country===country)&&
    [a.code,a.name,a.city,a.country].some(s=>s.toLowerCase().includes(q)));
}
