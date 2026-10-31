import { AIRPORTS } from './airports.mjs';
import { OFFICIAL_PORTALS } from './catalog.mjs';

// Coordinates and zones are approximate reference metadata, not verified operations.
const CORE_COORDS={
 IAD:[38.9531,-77.4565,'America/New_York'],JFK:[40.6413,-73.7781,'America/New_York'],
 ATL:[33.6407,-84.4277,'America/New_York'],LHR:[51.4700,-0.4543,'Europe/London'],
 FRA:[50.0379,8.5622,'Europe/Berlin'],AMS:[52.3105,4.7683,'Europe/Amsterdam'],
 DXB:[25.2532,55.3657,'Asia/Dubai'],YYZ:[43.6777,-79.6248,'America/Toronto'],
 SIN:[1.3644,103.9915,'Asia/Singapore'],HND:[35.5494,139.7798,'Asia/Tokyo'],
 SYD:[-33.9399,151.1753,'Australia/Sydney']
};
const EXTRA=[
 ['LAX','Los Angeles International','Los Angeles','US',33.9416,-118.4085,'America/Los_Angeles'],
 ['SFO','San Francisco International','San Francisco','US',37.6213,-122.3790,'America/Los_Angeles'],
 ['ORD',"Chicago O'Hare International",'Chicago','US',41.9742,-87.9073,'America/Chicago'],
 ['MIA','Miami International','Miami','US',25.7954,-80.2901,'America/New_York'],
 ['SEA','Seattle-Tacoma International','Seattle','US',47.4502,-122.3088,'America/Los_Angeles'],
 ['BOS','Boston Logan International','Boston','US',42.3656,-71.0096,'America/New_York'],
 ['DFW','Dallas Fort Worth International','Dallas','US',32.8998,-97.0403,'America/Chicago'],
 ['HNL','Daniel K. Inouye International','Honolulu','US',21.3245,-157.9251,'Pacific/Honolulu'],
 ['YVR','Vancouver International','Vancouver','CA',49.1947,-123.1792,'America/Vancouver'],
 ['YYC','Calgary International','Calgary','CA',51.1215,-114.0076,'America/Edmonton'],
 ['MEX','Mexico City International','Mexico City','MX',19.4361,-99.0719,'America/Mexico_City'],
 ['GRU','São Paulo Guarulhos International','São Paulo','BR',-23.4356,-46.4731,'America/Sao_Paulo'],
 ['EZE','Ezeiza International','Buenos Aires','AR',-34.8222,-58.5358,'America/Argentina/Buenos_Aires'],
 ['CDG','Paris Charles de Gaulle','Paris','FR',49.0097,2.5479,'Europe/Paris'],
 ['MAD','Adolfo Suárez Madrid-Barajas','Madrid','ES',40.4983,-3.5676,'Europe/Madrid'],
 ['FCO','Rome Fiumicino','Rome','IT',41.8003,12.2389,'Europe/Rome'],
 ['ZRH','Zurich Airport','Zurich','CH',47.4581,8.5555,'Europe/Zurich'],
 ['CPH','Copenhagen Airport','Copenhagen','DK',55.6181,12.6560,'Europe/Copenhagen'],
 ['HEL','Helsinki Airport','Helsinki','FI',60.3172,24.9633,'Europe/Helsinki'],
 ['ARN','Stockholm Arlanda','Stockholm','SE',59.6519,17.9186,'Europe/Stockholm'],
 ['OSL','Oslo Gardermoen','Oslo','NO',60.1939,11.1004,'Europe/Oslo'],
 ['IST','Istanbul Airport','Istanbul','TR',41.2753,28.7519,'Europe/Istanbul'],
 ['DOH','Hamad International','Doha','QA',25.2731,51.6081,'Asia/Qatar'],
 ['AUH','Zayed International','Abu Dhabi','AE',24.4330,54.6511,'Asia/Dubai'],
 ['JED','King Abdulaziz International','Jeddah','SA',21.6796,39.1565,'Asia/Riyadh'],
 ['DEL','Indira Gandhi International','New Delhi','IN',28.5562,77.1000,'Asia/Kolkata'],
 ['BOM','Chhatrapati Shivaji Maharaj International','Mumbai','IN',19.0896,72.8656,'Asia/Kolkata'],
 ['BLR','Kempegowda International','Bengaluru','IN',13.1986,77.7066,'Asia/Kolkata'],
 ['ISB','Islamabad International','Islamabad','PK',33.5493,72.8257,'Asia/Karachi'],
 ['KHI','Jinnah International','Karachi','PK',24.9065,67.1608,'Asia/Karachi'],
 ['BKK','Suvarnabhumi Airport','Bangkok','TH',13.6900,100.7501,'Asia/Bangkok'],
 ['HKG','Hong Kong International','Hong Kong','CN',22.3080,113.9185,'Asia/Hong_Kong'],
 ['ICN','Incheon International','Seoul','KR',37.4602,126.4407,'Asia/Seoul'],
 ['PEK','Beijing Capital International','Beijing','CN',40.0799,116.6031,'Asia/Shanghai'],
 ['PVG','Shanghai Pudong International','Shanghai','CN',31.1443,121.8083,'Asia/Shanghai'],
 ['NRT','Narita International','Tokyo','JP',35.7720,140.3929,'Asia/Tokyo'],
 ['KUL','Kuala Lumpur International','Kuala Lumpur','MY',2.7456,101.7072,'Asia/Kuala_Lumpur'],
 ['MNL','Ninoy Aquino International','Manila','PH',14.5086,121.0198,'Asia/Manila'],
 ['DPS','Ngurah Rai International','Bali','ID',-8.7482,115.1672,'Asia/Makassar'],
 ['AKL','Auckland International','Auckland','NZ',-37.0082,174.7850,'Pacific/Auckland'],
 ['JNB','O. R. Tambo International','Johannesburg','ZA',-26.1392,28.2460,'Africa/Johannesburg'],
 ['CAI','Cairo International','Cairo','EG',30.1219,31.4056,'Africa/Cairo'],
 ['NBO','Jomo Kenyatta International','Nairobi','KE',-1.3192,36.9278,'Africa/Nairobi']
];
export const EXPLORER_AIRPORTS=Object.freeze([
 ...AIRPORTS.map(a=>Object.freeze({...a,lat:CORE_COORDS[a.code][0],lon:CORE_COORDS[a.code][1],timezone:CORE_COORDS[a.code][2],officialMap:true})),
 ...EXTRA.map(([code,name,city,country,lat,lon,timezone])=>Object.freeze({code,name,city,country,lat,lon,timezone,url:null,officialMap:false}))
]);
const AIRPORT_BY_CODE=new Map(EXPLORER_AIRPORTS.map(a=>[a.code,a]));
const WORLD_BY_CODE=new Map();
export function registerWorldwideAirport(airport){
 if(!airport||!/^OA-\\d+$/.test(airport.code)||
    !Number.isFinite(airport.lat)||!Number.isFinite(airport.lon))
  throw new TypeError('Invalid imported airport');
 const record=Object.freeze({...airport,timezone:null,url:null});
 WORLD_BY_CODE.set(record.code,record);
 return record;
}
export function getExplorerAirport(code){return AIRPORT_BY_CODE.get(code)||WORLD_BY_CODE.get(code)||null;}
export function searchExplorerAirports(query=''){const q=String(query).trim().toLowerCase();return EXPLORER_AIRPORTS.filter(a=>(a.code+' '+a.name+' '+a.city+' '+a.country).toLowerCase().includes(q));}
export function getCountryTravelResource(country){return OFFICIAL_PORTALS[country]||null;}
export function formatAirportClock(code,instant=new Date()){
 const airport=getExplorerAirport(code);
 if(!airport)throw new RangeError('Unknown airport code');
 if(!airport.timezone)return 'Time zone unavailable (not in OurAirports)';
 return new Intl.DateTimeFormat('en-US',{timeZone:airport.timezone,hour:'2-digit',minute:'2-digit',hour12:false,weekday:'short',month:'short',day:'numeric'}).format(instant);
}
