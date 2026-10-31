import { buildChecklist } from './src/checklist.mjs';

const checklistEl = document.getElementById('checklist');
const progressTextEl = document.getElementById('progress-text');
const progressPercentEl = document.getElementById('progress-percent');
const progressTrackEl = document.getElementById('progress-track');
const progressFillEl = document.getElementById('progress-fill');
const reviewed = new Set();
let items = [];

function selectedJourney() {
  return document.querySelector('input[name="journey"]:checked').value;
}

function selectedExtras() {
  return [...document.querySelectorAll('input[name="extra"]:checked')].map((el) => el.value);
}

function updateProgress() {
  const count = items.filter((item) => reviewed.has(item.id)).length;
  const percent = items.length ? Math.round((count / items.length) * 100) : 0;
  progressTextEl.textContent = `${count} of ${items.length} steps reviewed`;
  progressPercentEl.textContent = `${percent}%`;
  progressTrackEl.setAttribute('aria-valuenow', String(percent));
  progressFillEl.style.width = `${percent}%`;
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
    source.textContent = `${item.sourceLabel} ↗`;
    article.append(source);
  } else {
    const note = document.createElement('span');
    note.className = 'task-source task-source-muted';
    note.textContent = item.sourceLabel;
    article.append(note);
  }
  return article;
}

function render() {
  items = buildChecklist(selectedJourney(), selectedExtras());
  const visibleIds = new Set(items.map((item) => item.id));
  for (const id of reviewed) if (!visibleIds.has(id)) reviewed.delete(id);
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

document.querySelectorAll('input[name="journey"], input[name="extra"]').forEach((el) => el.addEventListener('change', render));
document.getElementById('reset').addEventListener('click', () => { reviewed.clear(); render(); });
document.getElementById('print').addEventListener('click', () => window.print());
render();
