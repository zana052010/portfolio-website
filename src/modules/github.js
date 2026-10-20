import portfolio from '../data/portfolio-data.json';
import { escapeHtml, formatDate, icon, relativeTime } from '../lib/utils.js';
import { refreshIcons } from '../lib/icons.js';
import { getLang, t, tx } from '../lib/i18n.js';

const CACHE_KEY = 'zana-portfolio:github-v1';
const PROFILE_URL = 'https://api.github.com/users/zana052010';
const REPOS_URL = 'https://api.github.com/users/zana052010/repos?per_page=100&sort=pushed';
const EVENTS_URL = 'https://api.github.com/users/zana052010/events/public?per_page=100';

let bundledFallback = null;

const state = {
  profile: {
    login: 'zana052010',
    name: 'zaNna',
    html_url: portfolio.profile.github,
    public_repos: 0,
    followers: 0,
    created_at: '',
  },
  repos: [],
  events: [],
  source: 'cached',
  updatedAt: new Date().toISOString(),
  attempted: false,
};

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.profile?.login || !Array.isArray(parsed.repos) || !Array.isArray(parsed.events)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache() {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        savedAt: new Date().toISOString(),
        profile: state.profile,
        repos: state.repos,
        events: state.events,
      }),
    );
  } catch {
    /* Cache is best effort. */
  }
}

function applyCachedSnapshot() {
  const cached = readCache();
  if (!cached) return;
  state.profile = cached.profile;
  state.repos = cached.repos;
  state.events = cached.events;
  state.source = 'cached';
  state.updatedAt = cached.savedAt || bundledFallback?.generatedAt || new Date().toISOString();
}

function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function eventDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return localDateKey(date);
}

function buildActivity() {
  const counts = new Map();
  const countedRepoDays = new Set();
  const increment = (key, amount) => {
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + amount);
  };

  (state.events || []).forEach((event) => {
    const key = eventDateKey(event.created_at);
    if (!key) return;
    if (event.type === 'PushEvent') {
      increment(key, Math.max(1, event.payload?.commits?.length || 1));
    } else if (['CreateEvent', 'ReleaseEvent', 'PullRequestEvent', 'IssuesEvent'].includes(event.type)) {
      increment(key, 1);
    }
  });

  (state.repos || []).forEach((repo) => {
    for (const dateValue of [repo.pushed_at, repo.created_at]) {
      const key = eventDateKey(dateValue);
      if (key && !countedRepoDays.has(key)) {
        countedRepoDays.add(key);
        increment(key, 1);
      }
    }
  });

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() - cursor.getDay() - 25 * 7);

  const weeks = [];
  let total = 0;
  let activeDays = 0;
  const monthFormatter = new Intl.DateTimeFormat(getLang(), { month: 'short' });
  let previousMonth = null;

  for (let weekIndex = 0; weekIndex < 26; weekIndex += 1) {
    const week = [];
    const weekStart = new Date(cursor);
    weekStart.setDate(weekStart.getDate() + weekIndex * 7);
    const month = weekStart.getMonth();
    const monthLabel = month !== previousMonth ? monthFormatter.format(weekStart) : '';
    previousMonth = month;

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const date = new Date(cursor);
      date.setDate(cursor.getDate() + weekIndex * 7 + dayIndex);
      const key = localDateKey(date);
      const future = date > today;
      const count = future ? 0 : counts.get(key) || 0;
      if (count > 0) {
        total += count;
        activeDays += 1;
      }
      let level = 0;
      if (count >= 5) level = 4;
      else if (count >= 3) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;
      week.push({ date, key, count, level, future });
    }

    weeks.push({ weekStart, monthLabel, days: week });
  }

  return { weeks, total, activeDays };
}

function topLanguage() {
  const counts = new Map();
  (state.repos || []).forEach((repo) => {
    if (!repo.language) return;
    counts.set(repo.language, (counts.get(repo.language) || 0) + 1);
  });
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || '—';
}

function statusLabel(source) {
  return source === 'live' ? t('activity.live') : t('activity.cached');
}

function statusTitle(source) {
  return source === 'live' ? t('activity.live') : t('activity.snapshotNote');
}

function renderProfile() {
  const container = document.getElementById('github-profile');
  if (!container) return;
  const profile = state.profile;
  const lang = getLang();
  const login = profile.login || portfolio.profile.moniker;
  const displayName = profile.name || login;
  const createdYear = profile.created_at ? new Date(profile.created_at).getFullYear() : '';
  const joined = createdYear ? t('activity.yearLabel', { year: createdYear }) : '';
  const numberOf = (value) => new Intl.NumberFormat(lang).format(value || 0);
  const statusClass = state.source === 'live' ? '' : ' is-cached';

  container.innerHTML = `
    <div class="profile-inner" aria-label="${escapeHtml(t('activity.profileAria'))}">
      <div class="profile-head">
        <div class="profile-identity">
          <img
            class="profile-avatar"
            src="${escapeHtml(profile.avatar_url || 'https://github.com/zana052010.png')}"
            alt="${escapeHtml(t('activity.profileAvatarAlt'))}"
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
            onerror="this.hidden=true;this.nextElementSibling.hidden=false;"
          />
          <span class="avatar-fallback" hidden>z</span>
          <div>
            <div class="profile-name">${escapeHtml(displayName)}</div>
            <div class="profile-handle">@${escapeHtml(login)}</div>
          </div>
        </div>
        <span class="profile-status${statusClass}" title="${escapeHtml(
          statusTitle(state.source),
        )}">
          <span class="mini-dot" aria-hidden="true"></span>
          <span>${escapeHtml(statusLabel(state.source))}</span>
        </span>
      </div>

      <p class="profile-role">${escapeHtml(tx(portfolio.profile.role))}</p>
      <p class="profile-joined">${escapeHtml(joined)}</p>

      <div class="profile-stats">
        <div class="profile-stat">
          <div class="profile-stat-value">${numberOf(profile.public_repos)}</div>
          <div class="profile-stat-label">${escapeHtml(t('activity.publicRepos'))}</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-value">${numberOf(
            (state.repos || []).reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0),
          )}</div>
          <div class="profile-stat-label">${escapeHtml(t('activity.stars'))}</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-value">${numberOf(profile.followers)}</div>
          <div class="profile-stat-label">${escapeHtml(t('activity.followers'))}</div>
        </div>
      </div>

      <div class="profile-foot">
        <a
          class="profile-link"
          href="${escapeHtml(profile.html_url || portfolio.profile.github)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          ${escapeHtml(t('activity.openProfile'))}
          ${icon('arrow-up-right')}
        </a>
        <span class="profile-language" aria-label="${escapeHtml(t('activity.topLanguage'))}" title="${escapeHtml(
          t('activity.topLanguage'),
        )}">${escapeHtml(topLanguage())}</span>
      </div>
    </div>
  `;
  refreshIcons(container);
}

function renderGraph() {
  const container = document.getElementById('github-graph');
  if (!container) return;
  const lang = getLang();
  const activity = buildActivity();
  const dateFormatter = new Intl.DateTimeFormat(lang, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const statusClass = state.source === 'live' ? '' : ' is-cached';

  const weekMarkup = activity.weeks
    .map(
      (week) => `
        <div class="heatmap-week">
          <span class="heatmap-month">${escapeHtml(week.monthLabel)}</span>
          ${week.days
            .map((day) => {
              if (day.future) {
                return '<span class="heatmap-cell" data-level="0" aria-hidden="true"></span>';
              }
              const label = t('activity.dayAria', {
                date: dateFormatter.format(day.date),
                count: day.count,
              });
              return `<span class="heatmap-cell" data-level="${day.level}" title="${escapeHtml(
                label,
              )}" aria-hidden="true"></span>`;
            })
            .join('')}
        </div>
      `,
    )
    .join('');

  const updated = formatDate(state.updatedAt, lang, {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  });

  container.innerHTML = `
    <div class="graph-inner">
      <div class="graph-head">
        <div>
          <div class="graph-kicker">${escapeHtml(t('activity.graphTitle'))}</div>
          <div class="graph-title">${new Intl.NumberFormat(lang).format(activity.total)} ${escapeHtml(
            t('activity.totalSignals'),
          )}</div>
          <p class="graph-note">${escapeHtml(t('activity.graphNote'))}</p>
        </div>
        <span class="graph-live${statusClass}" title="${escapeHtml(
          statusTitle(state.source),
        )}">
          <span class="mini-dot" aria-hidden="true"></span>
          <span>${escapeHtml(statusLabel(state.source))}</span>
        </span>
      </div>

      <div class="heatmap-wrap">
        <div
          class="heatmap-scroll"
          tabindex="0"
          role="region"
          aria-label="${escapeHtml(t('activity.graphTitle'))}"
        >
          <div
            class="heatmap"
            role="img"
            aria-label="${escapeHtml(
              t('activity.graphAria', { count: activity.total, days: activity.activeDays }),
            )}"
          >
            ${weekMarkup}
          </div>
        </div>
        <div class="heatmap-foot">
          <div class="heatmap-stats">
            <span><span class="heatmap-stat-value">${new Intl.NumberFormat(lang).format(
              activity.activeDays,
            )}</span> ${escapeHtml(t('activity.activeDays'))}</span>
            <span aria-hidden="true">/</span>
            <span><span class="heatmap-stat-value">${escapeHtml(topLanguage())}</span> ${escapeHtml(
              t('activity.topLanguage'),
            )}</span>
          </div>
          <div class="heatmap-legend" aria-hidden="true">
            <span>${escapeHtml(t('activity.less'))}</span>
            ${[0, 1, 2, 3, 4].map((level) => `<span class="heatmap-cell" data-level="${level}"></span>`).join('')}
            <span>${escapeHtml(t('activity.more'))}</span>
          </div>
        </div>
        <div class="graph-updated">${escapeHtml(t('activity.updated'))} ${escapeHtml(updated)}</div>
      </div>
    </div>
  `;
}

function renderRepos() {
  const container = document.getElementById('repo-grid');
  if (!container) return;
  const lang = getLang();
  const repos = [...(state.repos || [])]
    .filter((repo) => !repo.fork)
    .sort((a, b) => new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0))
    .slice(0, 4);

  if (repos.length === 0) {
    container.innerHTML = `<p class="empty-state">${escapeHtml(t('activity.noRepos'))}</p>`;
    return;
  }

  container.innerHTML = repos
    .map((repo) => {
      const updated = repo.pushed_at
        ? `${t('activity.updated')} ${relativeTime(repo.pushed_at, lang)}`
        : '';
      const stars = repo.stargazers_count || 0;
      const forks = repo.forks_count || 0;
      return `
        <a
          class="repo-card"
          href="${escapeHtml(repo.html_url || portfolio.profile.github)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="repo-card-top">
            <span class="repo-name">${escapeHtml(repo.name)}</span>
            ${icon('arrow-up-right', 'repo-arrow')}
          </span>
          <span class="repo-description">${escapeHtml(repo.description || t('activity.noDescription'))}</span>
          <span class="repo-meta">
            ${
              repo.language
                ? `<span class="repo-language">${escapeHtml(repo.language)}</span>`
                : ''
            }
            ${updated ? `<span class="repo-updated">${icon('clock-3')}${escapeHtml(updated)}</span>` : ''}
            ${stars > 0 ? `<span class="repo-stars">${icon('star')}${stars}</span>` : ''}
            ${forks > 0 ? `<span class="repo-stars">${icon('git-fork')}${forks}</span>` : ''}
          </span>
        </a>
      `;
    })
    .join('');
  refreshIcons(container);
}

function renderAll() {
  renderProfile();
  renderGraph();
  renderRepos();
}

async function fetchJson(url, signal) {
  const response = await fetch(url, {
    signal,
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!response.ok) throw new Error(`GitHub request failed: ${response.status}`);
  return response.json();
}

async function fetchLive() {
  if (!navigator.onLine) return;
  state.attempted = true;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 9000);

  try {
    const [profileResult, reposResult, eventsResult] = await Promise.allSettled([
      fetchJson(PROFILE_URL, controller.signal),
      fetchJson(REPOS_URL, controller.signal),
      fetchJson(EVENTS_URL, controller.signal),
    ]);

    if (profileResult.status !== 'fulfilled' || reposResult.status !== 'fulfilled') {
      return;
    }

    state.profile = profileResult.value;
    state.repos = Array.isArray(reposResult.value) ? reposResult.value : [];
    if (eventsResult.status === 'fulfilled' && Array.isArray(eventsResult.value)) {
      state.events = eventsResult.value;
    }
    state.source = 'live';
    state.updatedAt = new Date().toISOString();
    writeCache();
    renderAll();
  } finally {
    window.clearTimeout(timer);
  }
}

export function initGithub(fallbackSnapshot) {
  const profilePanel = document.getElementById('github-profile');
  const graphPanel = document.getElementById('github-graph');
  if (!profilePanel || !graphPanel || !fallbackSnapshot) return;

  bundledFallback = fallbackSnapshot;
  state.profile = fallbackSnapshot.profile;
  state.repos = fallbackSnapshot.repos || [];
  state.events = fallbackSnapshot.events || [];
  state.updatedAt = fallbackSnapshot.generatedAt;
  state.source = 'cached';

  applyCachedSnapshot();
  renderAll();

  document.addEventListener('languagechange', renderAll);
  window.addEventListener('online', () => {
    if (!state.attempted || state.source !== 'live') fetchLive();
  });

  fetchLive().catch(() => {
    /* The bundled or cached snapshot is already on screen. */
  });
}
