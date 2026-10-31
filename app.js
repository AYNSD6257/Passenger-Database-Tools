import { COUNTRIES, PURPOSE_OPTIONS, buildJourneyPlan } from './src/journey.mjs';
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
fillSelect('transit', COUNTRIES, '', true);
fillSelect('purpose', PURPOSE_OPTIONS, 'tourism');
fillSelect('airline', [{value:'',label:'Not selected'},...AIRLINES.map(({code,name})=>({value:code,label:name+' ('+code+')'}))], '');
fillSelect('policy-topic', POLICY_TOPICS.map(({code,label})=>({value:code,label})), 'baggage');

function readJourney() {
  const form = document.getElementById('journey-form');
  return {
    origin: form.elements.origin.value,
    destination: form.elements.destination.value,
    citizenship: form.elements.citizenship.value,
    transit: form.elements.transit.value,
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
document.querySelectorAll('#journey-form select').forEach((el) => el.addEventListener('change', () => { reviewed.clear(); render(); }));
document.querySelectorAll('input[name="extra"]').forEach((el) => el.addEventListener('change', render));
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
