const STORAGE_KEY = 'nix-tracker-state-v1';

const typeLabels = {
  field: 'Nix Field Event', dungeon: 'Данж', boss: 'Босс', custom: 'Другое',
  peace: 'Мирный босс', war: 'PvP', archboss: 'Архбосс', dynamic: 'Dynamic Event'
};

const typeIcons = { field: '❄', dungeon: '◇', boss: '♜', custom: '✦' };

const defaultState = {
  activities: [],
  events: [],
  history: [],
  settings: { alwaysOnTop: false, compact: false },
  notified: {}
};

let state = loadState();

const $ = (selector) => document.querySelector(selector);
const activityList = $('#activityList');
const eventList = $('#eventList');
const historyList = $('#historyList');

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...structuredClone(defaultState), ...parsed, settings: { ...defaultState.settings, ...(parsed?.settings || {}) } };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = String(value);
  return element.innerHTML;
}

function formatDuration(ms) {
  if (ms <= 0) return 'ГОТОВО';
  const total = Math.ceil(ms / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp));
}

function dayLabel(rule) {
  return { daily: 'Каждый день', weekdays: 'Пн–Пт', weekends: 'Сб–Вс', wed_sat: 'Ср и Сб' }[rule] || 'Каждый день';
}

function isAllowedDay(date, rule) {
  const day = date.getDay();
  if (rule === 'weekdays') return day >= 1 && day <= 5;
  if (rule === 'weekends') return day === 0 || day === 6;
  if (rule === 'wed_sat') return day === 3 || day === 6;
  return true;
}

function getNextOccurrence(event, now = new Date()) {
  const [hours, minutes] = event.time.split(':').map(Number);
  for (let offset = 0; offset < 8; offset += 1) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + offset);
    candidate.setHours(hours, minutes, 0, 0);
    if (candidate > now && isAllowedDay(candidate, event.days)) return candidate;
  }
  return null;
}

function renderActivities() {
  const now = Date.now();
  $('#activityEmpty').hidden = state.activities.length > 0;
  activityList.hidden = state.activities.length === 0;

  activityList.innerHTML = state.activities.map((activity) => {
    const remaining = activity.endsAt ? Math.max(0, activity.endsAt - now) : 0;
    const active = remaining > 0;
    const total = activity.durationMinutes * 60 * 1000;
    const progress = active ? Math.max(0, Math.min(100, remaining / total * 100)) : 0;
    return `
      <article class="activity-card" data-id="${activity.id}">
        <div class="activity-icon">${typeIcons[activity.type] || '✦'}</div>
        <div class="activity-info">
          <div class="activity-name">${escapeHtml(activity.name)}</div>
          <div class="activity-meta">${typeLabels[activity.type] || 'Другое'} · ${activity.durationMinutes} мин</div>
        </div>
        <div class="activity-controls">
          <div class="timer-value ${active ? '' : 'ready'}">${formatDuration(remaining)}</div>
          <button class="done-button" data-action="start">${active ? 'ПРОЙДЕНО' : 'СТАРТ'}</button>
          <button class="menu-button" data-action="edit" title="Изменить">•••</button>
        </div>
        <div class="progress-bar" style="width:${progress}%"></div>
      </article>`;
  }).join('');

  const activeCount = state.activities.filter((a) => a.endsAt && a.endsAt > now).length;
  $('#activeCount').textContent = activeCount;
  $('#readyCount').textContent = state.activities.length - activeCount;
}

function renderEvents() {
  const now = new Date();
  const upcoming = state.events
    .map((event) => ({ ...event, next: getNextOccurrence(event, now) }))
    .filter((event) => event.next)
    .sort((a, b) => a.next - b.next);

  $('#eventEmpty').hidden = state.events.length > 0;
  eventList.hidden = state.events.length === 0;

  eventList.innerHTML = upcoming.map((event) => {
    const diff = event.next - now;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const when = event.next.toDateString() === now.toDateString() ? 'сегодня' : 'след. день';
    return `
      <div class="event-row" data-id="${event.id}">
        <div class="event-time">${event.time}</div>
        <div><div class="event-name">${escapeHtml(event.name)}</div><div class="event-meta">${typeLabels[event.type] || 'Событие'} · ${dayLabel(event.days)}</div></div>
        <div><div class="event-countdown">${when}<br>через ${hours}ч ${minutes}м</div><button class="menu-button" data-action="edit-event">•••</button></div>
      </div>`;
  }).join('');

  $('#nextEventSummary').textContent = upcoming[0]
    ? `${upcoming[0].time} · ${upcoming[0].name}`
    : 'Не задано';
}

function renderHistory() {
  const today = new Date().toDateString();
  const items = state.history.filter((item) => new Date(item.completedAt).toDateString() === today).slice(0, 12);
  $('#historyEmpty').hidden = items.length > 0;
  historyList.hidden = items.length === 0;
  historyList.innerHTML = items.map((item) => `
    <div class="history-row"><span class="history-dot"></span><div class="history-name">${escapeHtml(item.name)}</div><time class="history-time">${formatTime(item.completedAt)}</time></div>
  `).join('');
}

function renderAll() {
  renderActivities();
  renderEvents();
  renderHistory();
}

async function notify(title, body) {
  if (window.nixDesktop) await window.nixDesktop.notify(title, body);
}

function checkNotifications() {
  const now = Date.now();
  for (const activity of state.activities) {
    if (!activity.endsAt) continue;
    const remaining = activity.endsAt - now;
    const warningMs = activity.warningMinutes * 60000;
    const runKey = `${activity.id}:${activity.endsAt}`;
    if (remaining <= warningMs && remaining > 0 && warningMs > 0 && !state.notified[`${runKey}:warning`]) {
      state.notified[`${runKey}:warning`] = true;
      notify('Nix Tracker', `${activity.name}: осталось ${activity.warningMinutes} мин.`);
      saveState();
    }
    if (remaining <= 0 && !state.notified[`${runKey}:ready`]) {
      state.notified[`${runKey}:ready`] = true;
      notify('Активность снова доступна', `${activity.name} — кулдаун завершён.`);
      saveState();
    }
  }

  for (const event of state.events.filter((item) => item.notify)) {
    const next = getNextOccurrence(event, new Date(now - 11 * 60000));
    if (!next) continue;
    const remaining = next.getTime() - now;
    const key = `event:${event.id}:${next.getTime()}`;
    if (remaining <= 10 * 60000 && remaining > 9 * 60000 && !state.notified[key]) {
      state.notified[key] = true;
      notify('Событие через 10 минут', `${event.name} начнётся в ${event.time}.`);
      saveState();
    }
  }
}

function startActivity(id) {
  const activity = state.activities.find((item) => item.id === id);
  if (!activity) return;
  const completedAt = Date.now();
  activity.endsAt = completedAt + activity.durationMinutes * 60000;
  state.history.unshift({ id: uid(), activityId: id, name: activity.name, completedAt });
  state.history = state.history.slice(0, 300);
  saveState();
  renderAll();
}

function openActivityDialog(activity = null) {
  $('#activityModalTitle').textContent = activity ? 'Изменить активность' : 'Новая активность';
  $('#activityId').value = activity?.id || '';
  $('#activityName').value = activity?.name || '';
  $('#activityMinutes').value = activity?.durationMinutes || 30;
  $('#activityWarning').value = activity?.warningMinutes ?? 5;
  $('#activityType').value = activity?.type || 'field';
  $('#deleteActivityButton').hidden = !activity;
  $('#activityDialog').showModal();
  setTimeout(() => $('#activityName').focus(), 50);
}

function openEventDialog(event = null) {
  $('#eventModalTitle').textContent = event ? 'Изменить событие' : 'Новое событие';
  $('#eventId').value = event?.id || '';
  $('#eventName').value = event?.name || '';
  $('#eventTime').value = event?.time || '20:00';
  $('#eventType').value = event?.type || 'peace';
  $('#eventDays').value = event?.days || 'daily';
  $('#eventNotify').checked = event?.notify ?? true;
  $('#deleteEventButton').hidden = !event;
  $('#eventDialog').showModal();
  setTimeout(() => $('#eventName').focus(), 50);
}

$('#activityForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const id = $('#activityId').value;
  const values = {
    name: $('#activityName').value.trim(),
    durationMinutes: Number($('#activityMinutes').value),
    warningMinutes: Number($('#activityWarning').value),
    type: $('#activityType').value
  };
  if (!values.name) return;
  if (id) Object.assign(state.activities.find((item) => item.id === id), values);
  else state.activities.push({ id: uid(), endsAt: null, ...values });
  saveState(); renderAll(); $('#activityDialog').close();
});

$('#eventForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const id = $('#eventId').value;
  const values = {
    name: $('#eventName').value.trim(), time: $('#eventTime').value,
    type: $('#eventType').value, days: $('#eventDays').value, notify: $('#eventNotify').checked
  };
  if (!values.name || !values.time) return;
  if (id) Object.assign(state.events.find((item) => item.id === id), values);
  else state.events.push({ id: uid(), ...values });
  saveState(); renderAll(); $('#eventDialog').close();
});

activityList.addEventListener('click', (event) => {
  const card = event.target.closest('.activity-card');
  if (!card) return;
  const activity = state.activities.find((item) => item.id === card.dataset.id);
  if (event.target.closest('[data-action="start"]')) startActivity(card.dataset.id);
  if (event.target.closest('[data-action="edit"]')) openActivityDialog(activity);
});

eventList.addEventListener('click', (event) => {
  const row = event.target.closest('.event-row');
  if (!row || !event.target.closest('[data-action="edit-event"]')) return;
  const item = state.events.find((entry) => entry.id === row.dataset.id);
  openEventDialog(item);
});

$('#deleteActivityButton').addEventListener('click', () => {
  const id = $('#activityId').value;
  const item = state.activities.find((entry) => entry.id === id);
  if (item && confirm(`Удалить «${item.name}»?`)) {
    state.activities = state.activities.filter((entry) => entry.id !== id);
    saveState(); renderAll(); $('#activityDialog').close();
  }
});

$('#deleteEventButton').addEventListener('click', () => {
  const id = $('#eventId').value;
  const item = state.events.find((entry) => entry.id === id);
  if (item && confirm(`Удалить «${item.name}»?`)) {
    state.events = state.events.filter((entry) => entry.id !== id);
    saveState(); renderAll(); $('#eventDialog').close();
  }
});

for (const button of ['#addActivityButton', '#addActivitySmall', '#emptyAddButton']) {
  $(button)?.addEventListener('click', () => openActivityDialog());
}
$('#addEventButton').addEventListener('click', () => openEventDialog());

document.querySelectorAll('[data-close]').forEach((button) => {
  button.addEventListener('click', () => document.getElementById(button.dataset.close).close());
});

$('#clearHistoryButton').addEventListener('click', () => {
  if (state.history.length && confirm('Очистить историю прохождений?')) {
    state.history = []; saveState(); renderHistory();
  }
});

$('#alwaysOnTopButton').addEventListener('click', async () => {
  state.settings.alwaysOnTop = !state.settings.alwaysOnTop;
  $('#alwaysOnTopButton').setAttribute('aria-pressed', String(state.settings.alwaysOnTop));
  saveState();
  if (window.nixDesktop) await window.nixDesktop.setAlwaysOnTop(state.settings.alwaysOnTop);
});

$('#compactButton').addEventListener('click', async () => {
  state.settings.compact = !state.settings.compact;
  document.body.classList.toggle('compact', state.settings.compact);
  $('#compactButton').setAttribute('aria-pressed', String(state.settings.compact));
  saveState();
  if (window.nixDesktop) await window.nixDesktop.setCompact(state.settings.compact);
});

function updateClock() {
  $('#moscowClock').textContent = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(new Date());
}

document.body.classList.toggle('compact', state.settings.compact);
$('#alwaysOnTopButton').setAttribute('aria-pressed', String(state.settings.alwaysOnTop));
$('#compactButton').setAttribute('aria-pressed', String(state.settings.compact));
if (window.nixDesktop) {
  window.nixDesktop.setAlwaysOnTop(state.settings.alwaysOnTop);
  if (state.settings.compact) window.nixDesktop.setCompact(true);
}

renderAll();
updateClock();
checkNotifications();
setInterval(() => { updateClock(); renderActivities(); checkNotifications(); }, 1000);
setInterval(renderEvents, 30000);
