// Full worldwide OurAirports index is fetched only on request.
// Source CSVs preserve all fields, including rows not present in map index.
export const GLOBAL_FIELDS=['id','ident','type','name','latitude_deg','longitude_deg',
 'iso_country','municipality','iata_code','icao_code','scheduled_service','elevation_ft','iso_region'];
const BASE='./data/airports-global/';
let pending=null;
export async function loadGlobalAirportCatalog(){
 if(pending)return pending;
 pending=(async()=>{
  const [meta,index,clusters]=await Promise.all([
    fetch(BASE+'meta.json').then(getJSON),
    fetch(BASE+'index.json').then(getJSON),
    fetch(BASE+'clusters.json').then(getJSON)
  ]);
  if(!Array.isArray(index.rows)||!Array.isArray(clusters.rows)||
     index.fields.join('|')!==GLOBAL_FIELDS.join('|')||
     index.rows.length<50000||index.rows.length!==meta.geolocated_airports)
    throw new Error('Airport catalog is incomplete or inconsistent');
  return {meta,rows:index.rows,clusters:clusters.rows};
 })().catch(error=>{pending=null;throw error;});
 return pending;
}
async function getJSON(response){
 if(!response.ok)throw new Error('Airport catalog has not been published yet ('+response.status+').');
 return response.json();
}
export function airportRecord(row){
 if(!Array.isArray(row)||row.length<13)throw new TypeError('Unexpected airport entry');
 return {id:row[0],ident:row[1],type:row[2],name:row[3],lat:row[4],lon:row[5],
  country:row[6],city:row[7],iata:row[8],icao:row[9],scheduled:row[10]===1,
  elevationFt:row[11],region:row[12],code:'OA-'+row[0],timezone:null,url:null};
}
export function searchGlobalAirports(rows,{query='',kind='scheduled',country='all',limit=60}={}){
 const q=String(query).trim().toLowerCase(),code=String(country).toUpperCase();
 let count=0;const records=[];
 for(const row of rows){
  const type=row[2],scheduled=row[10]===1;
  if(kind==='scheduled'&&!scheduled)continue;
  if(kind==='open'&&type==='closed')continue;
  if(kind==='large'&&type!=='large_airport')continue;
  if(kind==='medium'&&type!=='medium_airport')continue;
  if(kind==='small'&&type!=='small_airport')continue;
  if(kind==='heliport'&&type!=='heliport')continue;
  if(kind==='closed'&&type!=='closed')continue;
  if(code!=='ALL'&&row[6]!==code)continue;
  if(q&&![row[1],row[3],row[6],row[7],row[8],row[9],row[12]]
      .some(value=>String(value||'').toLowerCase().includes(q)))continue;
  count++;
  if(records.length<limit)records.push(airportRecord(row));
 }
 return {count,records};
}
