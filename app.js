import { COUNTRIES, PURPOSE_OPTIONS, MAX_CONNECTIONS, buildJourneyPlan } from './src/journey.mjs';
import { getExplorerAirport } from './src/explorer-data.mjs';
import { initOrbitalExplorer } from './src/orbital-ui.mjs';
import { initWorldAirportSearch } from './src/global-ui.mjs';
import { AIRPORTS, findAirports, getAirport, AIRPORT_REVIEW_DATE } from './src/airports.mjs';
import { AIRLINES, POLICY_TOPICS, OFFICIAL_PORTALS, CATALOG_REVIEW_DATE, findCountrySources, findAirlines } from './src/catalog.mjs';

const checklistEl = document.getElementById('checklist');
const progressTextEl = document.getElementById('progress-text');
const progressPercentEl = document.getElementById('progress-percent');
const progressTrackEl = document.getElementById('progress-track');
const progressFillEl = document.getElementById('progress-fill');
const routeSummaryEl = document.getElementById('route-summary');
const routeCategoryEl = document.getElementById('route-category');
const routeLinksEl = document.getElementById('route-links');
const routeNoticesEl = document.getElementById('route-notices');
const reviewed = new Set();
let items = [];

function fillSelect(id, options, selected, includeNone = false) {
  const select = document.getElementById(id);
  if (includeNone) select.add(new Option('No transit / nonstop', ''));
  for (const option of options) select.add(new Option(option.name ?? option.label, option.code ?? option.value));
  select.value = selected;
}
fillSelect('origin', COUNTRIES, 'US');
fillSelect('destination', COUNTRIES, 'GB');
fillSelect('citizenship', COUNTRIES, 'US');

fillSelect('purpose', PURPOSE_OPTIONS, 'tourism');
fillSelect('airline', [{value:'',label:'Not selected'},...AIRLINES.map(({code,name})=>({value:code,label:name+' ('+code+')'}))], '');
fillSelect('policy-topic', POLICY_TOPICS.map(({code,label})=>({value:code,label})), 'baggage');
const airportCountries=[...new Set(AIRPORTS.map(a=>a.country))];
fillSelect('airport-country',
  [{value:'all',label:'All countries'},...COUNTRIES.filter(c=>airportCountries.includes(c.code))],
  'all');
function updateAddConnection(){
  const button=document.getElementById('add-connection');
  const count=document.querySelectorAll('.connection-row').length;
  button.disabled=count>=MAX_CONNECTIONS;
  button.setAttribute('aria-label','Add connection stop ('+count+' of '+MAX_CONNECTIONS+' used)');
}
function updateAirportOptions(row,selected=''){
  const country=row.querySelector('.connection-country').value;
  const select=row.querySelector('.connection-airport');
  select.replaceChildren(new Option('Airport not specified',''));
  for(const airport of AIRPORTS.filter(a=>a.country===country)){
    select.add(new Option(airport.code+' — '+airport.name,airport.code));
  }
  select.value=selected;
  select.disabled=!AIRPORTS.some(a=>a.country===country);
}
function renumberConnections(){
  const rows=[...document.querySelectorAll('.connection-row')];
  rows.forEach((row,i)=>{
    row.querySelector('.connection-title').textContent='Connection '+(i+1);
    row.querySelector('.connection-country').setAttribute('aria-label','Connection '+(i+1)+' country');
    row.querySelector('.connection-airport').setAttribute('aria-label','Connection '+(i+1)+' airport');
    row.querySelector('.remove-connection').setAttribute('aria-label','Remove connection '+(i+1));
  });
  updateAddConnection();
}
function addConnection(country='',airport=''){
  if(document.querySelectorAll('.connection-row').length>=MAX_CONNECTIONS)return;
  const row=document.createElement('div');
  row.className='connection-row';
  const head=document.createElement('div');
  head.className='connection-row-head';
  const heading=document.createElement('strong');
  heading.className='connection-title';
  const remove=document.createElement('button');
  remove.type='button';
  remove.className='remove-connection secondary-btn';
  remove.textContent='Remove';
  remove.addEventListener('click',()=>{row.remove();renumberConnections();reviewed.clear();render();});
  head.append(heading,remove);
  const countrySelect=document.createElement('select');
  countrySelect.className='connection-country';
  countrySelect.name='connection-country';
  countrySelect.add(new Option('Choose transit country',''));
  for(const entry of COUNTRIES)countrySelect.add(new Option(entry.name,entry.code));
  countrySelect.value=country;
  const airportSelect=document.createElement('select');
  airportSelect.className='connection-airport';
  airportSelect.name='connection-airport';
  const countryLabel=document.createElement('label');
  countryLabel.textContent='Transit country';
  countryLabel.append(countrySelect);
  const airportLabel=document.createElement('label');
  airportLabel.textContent='Airport (optional)';
  airportLabel.append(airportSelect);
  const fields=document.createElement('div');
  fields.className='connection-row-fields';
  fields.append(countryLabel,airportLabel);
  row.append(head,fields);
  document.getElementById('connections').append(row);
  updateAirportOptions(row,airport);
  renumberConnections();
}

function readJourney() {
  const form = document.getElementById('journey-form');
  return {
    origin: form.elements.origin.value,
    destination: form.elements.destination.value,
    citizenship: form.elements.citizenship.value,
    transits:[...document.querySelectorAll('.connection-row')].map(row=>({
      country:row.querySelector('.connection-country').value,
      airport:row.querySelector('.connection-airport').value
    })).filter(stop=>stop.country),
    purpose: form.elements.purpose.value,
    airline: form.elements.airline.value,
    extras: [...form.querySelectorAll('input[name="extra"]:checked')].map((el) => el.value)
  };
}

function updateProgress() {
  const count = items.filter((item) => reviewed.has(item.id)).length;
  const percent = items.length ? Math.round((count / items.length) * 100) : 0;
  progressTextEl.textContent = count + ' of ' + items.length + ' steps reviewed';
  progressPercentEl.textContent = percent + '%';
  progressTrackEl.setAttribute('aria-valuenow', String(percent));
  progressFillEl.style.width = percent + '%';
}
function makeItem(item) {
  const article = document.createElement('article');
  article.className = 'task';
  const label = document.createElement('label');
  label.className = 'task-label';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = reviewed.has(item.id);
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) reviewed.add(item.id);
    else reviewed.delete(item.id);
    updateProgress();
  });
  const content = document.createElement('span');
  content.className = 'task-main';
  const strong = document.createElement('strong');
  strong.textContent = item.title;
  const detail = document.createElement('span');
  detail.className = 'task-detail';
  detail.textContent = item.detail;
  content.append(strong, detail);
  label.append(checkbox, content);
  article.append(label);
  if (item.source) {
    const source = document.createElement('a');
    source.className = 'task-source';
    source.href = item.source;
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    source.textContent = item.sourceLabel + ' ↗';
    article.append(source);
  } else {
    const note = document.createElement('span');
    note.className = 'task-source task-source-muted';
    note.textContent = item.sourceLabel;
    article.append(note);
  }
  return article;
}
function renderResources(plan) {
  routeLinksEl.replaceChildren();
  for (const resource of plan.resources) {
    const link = document.createElement('a');
    link.className = 'route-link';
    link.href = resource.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const title = document.createElement('strong');
    title.textContent = resource.title + ' ↗';
    const detail = document.createElement('span');
    detail.textContent = resource.description;
    link.append(title, detail);
    routeLinksEl.append(link);
  }
  const heading = document.createElement('h3');
  heading.textContent = 'Important limitations to review';
  const list = document.createElement('ul');
  for (const notice of plan.notices) {
    const li = document.createElement('li');
    li.textContent = notice;
    list.append(li);
  }
  routeNoticesEl.replaceChildren(heading, list);
}
function render() {
  const plan = buildJourneyPlan(readJourney());
  items = plan.items;
  const visibleIds = new Set(items.map((item) => item.id));
  for (const id of reviewed) if (!visibleIds.has(id)) reviewed.delete(id);
  routeSummaryEl.textContent = plan.summary;
  routeCategoryEl.textContent = ({
    international: 'International journey',
    'us-domestic': 'U.S. domestic journey',
    'other-domestic': 'Domestic journey (outside U.S.)',
    unspecified: 'Route needs verification'
  })[plan.kind];
  renderResources(plan);
  checklistEl.replaceChildren();
  let currentGroup = '';
  for (const item of items) {
    if (item.group !== currentGroup) {
      currentGroup = item.group;
      const heading = document.createElement('h3');
      heading.className = 'group-heading';
      heading.textContent = currentGroup;
      checklistEl.append(heading);
    }
    checklistEl.append(makeItem(item));
  }
  updateProgress();
}

// Do not carry completed checkboxes to a different itinerary.
document.getElementById('add-connection').addEventListener('click',()=>{addConnection();reviewed.clear();render();});
document.getElementById('journey-form').addEventListener('change',event=>{
  if(event.target.classList.contains('connection-country')){
    updateAirportOptions(event.target.closest('.connection-row'));
  }
  reviewed.clear();
  render();
});
document.getElementById('reset').addEventListener('click', () => { reviewed.clear(); render(); });
document.getElementById('print').addEventListener('click', () => window.print());
render();

function directoryCard(title, tag, description, url) {
  const card = document.createElement('article');
  card.className = 'directory-card';
  const heading = document.createElement('strong');
  heading.textContent = title;
  const badge = document.createElement('span');
  badge.className = 'source-tag';
  badge.textContent = tag;
  const detail = document.createElement('p');
  detail.textContent = description;
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'Open official resource ↗';
  card.append(heading, badge, detail, link);
  return card;
}
function renderCountryDirectory() {
  const q = document.getElementById('country-search').value;
  const coverage = document.getElementById('country-coverage').value;
  const matches = findCountrySources(COUNTRIES, q, coverage);
  const results = document.getElementById('country-results');
  results.replaceChildren();
  document.getElementById('country-count').textContent = matches.length + ' country / region references found';
  if (!matches.length) {
    const p = document.createElement('p');
    p.className = 'directory-empty';
    p.textContent = 'No reviewed source matches. Check the relevant government or embassy website directly.';
    results.append(p);
  }
  for (const match of matches) {
    const note = match.coverage === 'regional'
      ? 'EU/Schengen regional overview only — verify national rules separately.'
      : 'Government starting point, not an eligibility decision.' + (match.note ? ' ' + match.note : '');
    results.append(directoryCard(match.name, match.coverage === 'regional' ? 'REGIONAL OVERVIEW' : 'NATIONAL SOURCE', note, match.url));
  }
}
function renderAirlineDirectory() {
  const topic = document.getElementById('policy-topic').value;
  const matches = findAirlines(document.getElementById('airline-search').value, topic);
  const results = document.getElementById('airline-results');
  results.replaceChildren();
  document.getElementById('airline-count').textContent = matches.length + ' reviewed airline policy links found';
  if (!matches.length) {
    const p = document.createElement('p');
    p.className = 'directory-empty';
    p.textContent = 'No reviewed link for this airline and topic yet. Check the operating airline website.';
    results.append(p);
  }
  const label = POLICY_TOPICS.find(p=>p.code===topic)?.label || 'Policy';
  for (const airline of matches) {
    results.append(directoryCard(airline.name + ' (' + airline.code + ')', 'AIRLINE-AUTHORED',
      label + '. Current fees and eligibility depend on route, fare, class, date and operating carrier. Last URL check: ' + CATALOG_REVIEW_DATE + '.',
      airline.links[topic]));
  }
}
document.getElementById('country-search').addEventListener('input', renderCountryDirectory);
document.getElementById('country-coverage').addEventListener('change', renderCountryDirectory);
document.getElementById('airline-search').addEventListener('input', renderAirlineDirectory);
document.getElementById('policy-topic').addEventListener('change', renderAirlineDirectory);
renderCountryDirectory();
renderAirlineDirectory();

function renderAirportDirectory(){
  const q=document.getElementById('airport-search').value;
  const country=document.getElementById('airport-country').value;
  const matching=findAirports(q,country);
  const results=document.getElementById('airport-results');
  results.replaceChildren();
  document.getElementById('airport-count').textContent=matching.length+' airport maps available';
  if(!matching.length){
    const p=document.createElement('p');
    p.className='directory-empty';
    p.textContent='No operator map in this starter directory. Verify the airport directly.';
    results.append(p);
  }
  for(const airport of matching){
    results.append(directoryCard(airport.name+' ('+airport.code+')',
      'AIRPORT OPERATOR',airport.city+' · Map URL checked '+AIRPORT_REVIEW_DATE+
      '. Check terminals, gates and transfer rules with the airport and airline.',airport.url));
  }
}
document.getElementById('airport-search').addEventListener('input',renderAirportDirectory);
document.getElementById('airport-country').addEventListener('change',renderAirportDirectory);
renderAirportDirectory();

function syncJourneyFromFlightLegs(legs){
  if(!Array.isArray(legs)||!legs.length)return;
  const stops=[legs[0].from,...legs.map(leg=>leg.to)].map(getExplorerAirport);
  if(stops.some(a=>!a)||stops.some(a=>!COUNTRIES.some(c=>c.code===a.country)))return;
  const origin=stops[0].country,destination=stops[stops.length-1].country;
  const intermediate=stops.slice(1,-1);
  document.getElementById('origin').value=origin;
  document.getElementById('destination').value=destination;
  document.getElementById('airline').value=legs[0].airline||'';
  document.getElementById('connections').replaceChildren();
  for(const airport of intermediate.slice(0,MAX_CONNECTIONS)){
    // Only airports with curated operator map links are in the original form.
    const curated=AIRPORTS.some(a=>a.code===airport.code)?airport.code:'';
    addConnection(airport.country,curated);
  }
  reviewed.clear();
  render();
}
const orbitalController=initOrbitalExplorer({onTripChange:syncJourneyFromFlightLegs});
initWorldAirportSearch(orbitalController);
