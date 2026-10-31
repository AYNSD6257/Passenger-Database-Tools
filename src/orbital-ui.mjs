import {EXPLORER_AIRPORTS,getExplorerAirport,formatAirportClock,getCountryTravelResource,registerWorldwideAirport} from './explorer-data.mjs';
import {AIRLINES} from './catalog.mjs';
import {MAX_FLIGHT_LEGS,buildFlightSummary} from './itinerary.mjs';
import {createOrbitalGlobe} from './orbital-globe.mjs';
const $=id=>document.getElementById(id);
function createOptionList(select,items,chosen='',placeholder=null){
 select.replaceChildren();
 if(placeholder)select.add(new Option(placeholder,''));
 for(const item of items)select.add(new Option(item.label,item.value));
 select.value=chosen;
}
const airportOptions=EXPLORER_AIRPORTS.map(a=>({value:a.code,label:a.code+' · '+a.city+' — '+a.name}));
const airlineOptions=AIRLINES.map(a=>({value:a.code,label:a.name+' ('+a.code+')'}));
function labelInput(title,input){
 const label=document.createElement('label');label.className='orbit-field';const text=document.createElement('span');text.textContent=title;
 label.append(text,input);return label;
}
function makeSelect(options,value,placeholder){
 const select=document.createElement('select');createOptionList(select,options,value,placeholder);return select;
}
export function initOrbitalExplorer({onTripChange=()=>{}}={}){
 const canvas=$('orbit-canvas'),preview=$('flight-preview'),message=$('flight-feedback');
 const globe=createOrbitalGlobe(canvas,{onSelect:showAirport});
 let selected='IAD',lastRoute='';
 const airports=EXPLORER_AIRPORTS;
 createOptionList($('orbital-airport-select'),airportOptions,'IAD');
 const tripState=()=>({
   departureDate:$('trip-departure').value,returnDate:$('trip-return').value,
   legs:[...$('flight-legs').querySelectorAll('.flight-leg')].map(row=>({
     from:row.querySelector('.leg-from').value,to:row.querySelector('.leg-to').value,
     airline:row.querySelector('.leg-airline').value,flightNumber:row.querySelector('.leg-flight').value,
     departureLocal:row.querySelector('.leg-departure-time').value,
     arrivalLocal:row.querySelector('.leg-arrival-time').value
   }))
 });
 let currentPlan=null;
 function showAirport(code){
  const airport=getExplorerAirport(code);if(!airport)return;
  selected=code;globe.setSelected(code);$('orbital-airport-select').value=code;
  $('selected-airport-name').textContent=airport.name+' ('+airport.code+')';
  $('selected-airport-city').textContent=airport.city+' · '+airport.country;
  $('selected-airport-time').textContent=formatAirportClock(code);
  $('selected-timezone').textContent=airport.timezone||'Time zone unavailable for this imported airport';
  const source=getCountryTravelResource(airport.country);
  const link=$('selected-document-link');
  if(source){
    link.hidden=false;link.href=source.url;
    link.textContent=(source.coverage==='regional'?'Regional EU/Schengen overview':'Official government starting point')+' ↗';
    $('selected-document-status').textContent=(source.coverage==='regional'?
      'Regional guidance only. Also verify with the national government.':'Check current passport, visa, ETA and transit requirements for your individual circumstances.');
  }else{
    link.hidden=true;link.removeAttribute('href');
    $('selected-document-status').textContent='No reviewed immigration source in this starter directory. Consult the destination government or embassy directly.';
  }
  const map=$('selected-airport-map');
  if(airport.url){map.href=airport.url;map.hidden=false;}else{map.removeAttribute('href');map.hidden=true;}
 }
 function updateClocks(){
   showAirport(selected);
   const cards=$('trip-clocks');cards.replaceChildren();
   if(!currentPlan)return;
   for(const airport of currentPlan.airports){
     const card=document.createElement('div');card.className='clock-chip';
     const code=document.createElement('strong');code.textContent=airport.code;
     const time=document.createElement('span');time.textContent=formatAirportClock(airport.code);
     card.append(code,time);cards.append(card);
   }
 }
 function updateTrip(){
   try{
     const summary=buildFlightSummary(tripState());currentPlan=summary;
     const pairs=summary.legs.map(l=>[l.from,l.to]);globe.setRoutes(pairs);
     const routeCodes=summary.legs.length?[summary.legs[0].from,...summary.legs.map(l=>l.to)]:[];
     const signature=JSON.stringify(summary.legs.map(l=>[l.from,l.to,l.airline]));
     if(signature!==lastRoute&&summary.legs.length){lastRoute=signature;onTripChange(summary.legs);}
     const fragment=document.createDocumentFragment();
     const header=document.createElement('h3');header.textContent='Your flight itinerary';fragment.append(header);
     const sub=document.createElement('p');sub.textContent='Departure: '+(summary.departureDate||'Not entered')+' · Return: '+(summary.returnDate||'One-way / not entered');fragment.append(sub);
     const list=document.createElement('ol');list.className='itinerary-preview-list';
     for(const [i,leg] of summary.legs.entries()){
       const from=getExplorerAirport(leg.from),to=getExplorerAirport(leg.to);
       const li=document.createElement('li');
       const h=document.createElement('strong');h.textContent='Leg '+(i+1)+': '+leg.from+' → '+leg.to+(leg.airline?' · '+(AIRLINES.find(a=>a.code===leg.airline)?.name||leg.airline):'')+(leg.flightNumber?' · '+leg.flightNumber:'');
       const details=document.createElement('span');
       details.textContent='Departure ('+from.timezone+'): '+(leg.departureLocal.replace('T',' ')||'not entered')+' · Arrival ('+to.timezone+'): '+(leg.arrivalLocal.replace('T',' ')||'not entered');
       li.append(h,details);list.append(li);
     }
     fragment.append(list);
     const cautions=document.createElement('p');cautions.className='flight-notes';cautions.textContent=summary.warnings.join(' ');fragment.append(cautions);
     preview.replaceChildren(fragment);message.textContent='Itinerary preview updated · '+summary.legs.length+' leg(s).';
     if(routeCodes.length)showAirport(routeCodes[routeCodes.length-1]);
     updateClocks();
   }catch(error){currentPlan=null;message.textContent=error.message;message.setAttribute('role','alert');}
 }
 function makeRow(data={}){
   if($('flight-legs').children.length>=MAX_FLIGHT_LEGS)return;
   const row=document.createElement('article');row.className='flight-leg';
   const top=document.createElement('div');top.className='flight-leg-top';
   const heading=document.createElement('strong');heading.className='flight-leg-title';
   const remove=document.createElement('button');remove.type='button';remove.className='secondary-btn orbit-remove';remove.textContent='Remove leg';
   remove.addEventListener('click',()=>{row.remove();relabel();updateTrip();});
   top.append(heading,remove);
   const grid=document.createElement('div');grid.className='flight-leg-grid';
   const from=makeSelect(airportOptions,data.from||'IAD');from.className='leg-from';
   const to=makeSelect(airportOptions,data.to||'LHR');to.className='leg-to';
   const carrier=makeSelect(airlineOptions,data.airline||'','Choose operating airline');carrier.className='leg-airline';
   const number=document.createElement('input');number.type='text';number.className='leg-flight';number.maxLength=12;number.placeholder='e.g. VS22';number.value=data.flightNumber||'';
   const departure=document.createElement('input');departure.type='datetime-local';departure.className='leg-departure-time';departure.value=data.departureLocal||'';
   const arrival=document.createElement('input');arrival.type='datetime-local';arrival.className='leg-arrival-time';arrival.value=data.arrivalLocal||'';
   grid.append(labelInput('From airport',from),labelInput('To airport',to),labelInput('Operating airline',carrier),labelInput('Flight number (optional)',number),labelInput('Departure: airport local time',departure),labelInput('Arrival: airport local time',arrival));
   row.append(top,grid);$('flight-legs').append(row);relabel();
 }
 function relabel(){
   [...$('flight-legs').children].forEach((row,i)=>row.querySelector('.flight-leg-title').textContent='Flight segment '+(i+1));
   $('add-flight-leg').disabled=$('flight-legs').children.length>=MAX_FLIGHT_LEGS;
 }
 $('add-flight-leg').addEventListener('click',()=>{
   const previous=$('flight-legs').lastElementChild;
   const from=previous?.querySelector('.leg-to')?.value||'IAD';
   const to=from==='LHR'?'FRA':'LHR';
   makeRow({from,to});updateTrip();
 });
 $('flight-legs').addEventListener('change',updateTrip);
 $('flight-legs').addEventListener('input',e=>{if(e.target.classList.contains('leg-flight'))updateTrip();});
 $('trip-departure').addEventListener('change',updateTrip);
 $('trip-return').addEventListener('change',updateTrip);
 $('orbital-airport-select').addEventListener('change',e=>{globe.focus(e.target.value);showAirport(e.target.value);});
 $('orbital-motion').addEventListener('click',()=>{
   const active=globe.toggleMotion();
   $('orbital-motion').textContent=active?'Pause animation':'Resume animation';
   $('orbital-motion').setAttribute('aria-pressed',String(!active));
 });
 $('flight-print').addEventListener('click',()=>window.print());
 $('orbital-airport-total').textContent=EXPLORER_AIRPORTS.length+' major airports in starter explorer';
 makeRow({from:'IAD',to:'LHR',airline:'VS'});
 showAirport('IAD');
 updateTrip();
 const clockTimer=setInterval(updateClocks,30000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateClocks();});
 return {
  setGlobalClusters(clusters){globe.setGlobalClusters(clusters);},
  setGlobalMode(mode){globe.setGlobalMode(mode);},
  focusWorldwide(record){
    const selectedAirport=registerWorldwideAirport(record);
    selected=selectedAirport.code;
    const picker=$('orbital-airport-select');
    if(![...picker.options].some(o=>o.value===selectedAirport.code)){
      picker.add(new Option((record.iata||record.icao||record.ident)+' · '+record.name,selectedAirport.code));
    }
    showAirport(selectedAirport.code);
    globe.highlightWorldwide(selectedAirport);
  },
  addWorldwideDestination(record){
    const airport=registerWorldwideAirport(record);
    if($('flight-legs').children.length>=MAX_FLIGHT_LEGS)return false;
    const prev=$('flight-legs').lastElementChild;
    const from=prev?.querySelector('.leg-to')?.value||'IAD';
    const label=(record.iata||record.icao||record.ident)+' · '+record.name;
    if(!airportOptions.some(o=>o.value===airport.code))airportOptions.push({value:airport.code,label});
    for(const select of $('flight-legs').querySelectorAll('select.leg-from,select.leg-to')){
      if(![...select.options].some(o=>o.value===airport.code))select.add(new Option(label,airport.code));
    }
    makeRow({from,to:airport.code});
    updateTrip();
    return true;
  },
  destroy(){clearInterval(clockTimer);globe.destroy();},
  getPlan(){return currentPlan;}
 };
}
