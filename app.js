import { COUNTRIES, PURPOSE_OPTIONS, buildJourneyPlan } from './src/journey.mjs';

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

function readJourney() {
  const form = document.getElementById('journey-form');
  return {
    origin: form.elements.origin.value,
    destination: form.elements.destination.value,
    citizenship: form.elements.citizenship.value,
    transit: form.elements.transit.value,
    purpose: form.elements.purpose.value,
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
