import {loadGlobalAirportCatalog,searchGlobalAirports} from './global-airports.mjs';
const $=id=>document.getElementById(id);
export function initWorldAirportSearch(orbital){
 let catalog=null,debounce=null;
 const button=$('world-load'),results=$('world-results');
 function status(s){$('world-status').textContent=s;}
 function search(){
  if(!catalog)return;
  const matches=searchGlobalAirports(catalog.rows,{
    query:$('world-search').value,kind:$('world-kind').value,
    country:$('world-country').value,limit:80
  });
  $('world-count').textContent=matches.count.toLocaleString()+
    ' matching records · Showing '+matches.records.length;
  results.replaceChildren();
  if(!matches.count){
    const p=document.createElement('p');p.textContent='No matches with these filters.';results.append(p);
    return;
  }
  for(const record of matches.records){
    const card=document.createElement('article');card.className='world-result-card';
    const title=document.createElement('strong');
    title.textContent=(record.iata||record.icao||record.ident)+' · '+record.name;
    const desc=document.createElement('span');
    desc.textContent=(record.city||'Municipality not provided')+' · '+record.country+
      ' · '+record.type.replaceAll('_',' ')+' · Scheduled service: '+(record.scheduled?'flagged yes':'flagged no');
    const actions=document.createElement('div');actions.className='world-result-actions';
    const locate=document.createElement('button');locate.type='button';
    locate.className='secondary-btn';locate.textContent='Highlight on globe';
    locate.addEventListener('click',()=>{
      orbital.focusWorldwide(record);
      $('world-selected').textContent='Highlighted '+record.name+' ('+(record.iata||record.ident)+'). This is not a flight availability result.';
    });
    const flight=document.createElement('button');flight.type='button';
    flight.className='secondary-btn';flight.textContent='Add as flight destination';
    flight.addEventListener('click',()=>{
      orbital.focusWorldwide(record);
      $('world-selected').textContent=orbital.addWorldwideDestination(record)?
        'Added flight destination: '+record.name+'. Verify schedules, airline service and airport time zones manually.':
        'Maximum of six flight legs reached. Remove a leg first.';
    });
    const source=document.createElement('a');source.target='_blank';source.rel='noopener noreferrer';
    source.href='https://ourairports.com/airports/'+encodeURIComponent(record.ident)+'/';
    source.textContent='View OurAirports entry ↗';
    actions.append(locate,flight,source);
    card.append(title,desc,actions);results.append(card);
  }
 }
 async function load(){
  if(catalog)return;
  button.disabled=true;button.textContent='Loading worldwide catalog…';
  status('Downloading the worldwide search index and globe cluster data from this site. Several MB may be transferred.');
  try{
    catalog=await loadGlobalAirportCatalog();
    orbital.setGlobalClusters(catalog.clusters);
    const m=catalog.meta;
    $('world-total').textContent=m.total_source_airports.toLocaleString();
    $('world-geolocated').textContent=m.geolocated_airports.toLocaleString();
    $('world-scheduled').textContent=m.scheduled_service_rows.toLocaleString();
    $('world-source-time').textContent=String(m.generated_utc).slice(0,10);
    $('world-controls').hidden=false;button.textContent='Worldwide catalog loaded';
    const countries=[...new Set(catalog.rows.map(r=>r[6]).filter(Boolean))].sort();
    const picker=$('world-country');
    picker.replaceChildren(new Option('All countries','all'));
    for(const code of countries)picker.add(new Option(code,code));
    status('Imported '+m.total_source_airports.toLocaleString()+' airport/facility records from OurAirports. Globe markers show geographic clusters; no live flight availability is implied.');
    search();
  }catch(error){
    button.disabled=false;button.textContent='Retry worldwide catalog';
    status('The global catalog cannot be loaded: '+error.message+'. The existing curated globe remains available.');
  }
 }
 button.addEventListener('click',load);
 $('world-search').addEventListener('input',()=>{
   clearTimeout(debounce);debounce=setTimeout(search,170);
 });
 $('world-kind').addEventListener('change',()=>{
   orbital.setGlobalMode($('world-kind').value==='scheduled'?'scheduled':'all');
   search();
 });
 $('world-country').addEventListener('change',search);
}
