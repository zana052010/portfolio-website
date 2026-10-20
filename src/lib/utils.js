export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function icon(name, className = '') {
  return `<i data-lucide="${escapeHtml(name)}"${className ? ` class="${escapeHtml(className)}"` : ''} aria-hidden="true"></i>`;
}

export function brandIcon(slug, className = 'brand-icon') {
  return `<img class="${escapeHtml(
    className,
  )}" src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${escapeHtml(
    slug,
  )}.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.hidden=true;">`;
}

export function logoMarkup({ logo, monogram = '', className = '', alt = '' }) {
  const fallback = `<span class="logo-fallback${className ? ` ${escapeHtml(className)}` : ''}" hidden>${escapeHtml(monogram || '•')}</span>`;
  if (!logo) {
    return `<span class="logo-fallback${className ? ` ${escapeHtml(className)}` : ''}" aria-hidden="true">${escapeHtml(monogram || '•')}</span>`;
  }
  return `<img class="${escapeHtml(className)}" src="${escapeHtml(logo)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.hidden=false;">${fallback}`;
}

export function padNumber(value, length = 2) {
  return String(value).padStart(length, '0');
}

export function relativeTime(dateString, lang) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absolute = Math.abs(seconds);
  const formatter = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });

  const units = [
    { limit: 60, divisor: 1, unit: 'second' },
    { limit: 3600, divisor: 60, unit: 'minute' },
    { limit: 86400, divisor: 3600, unit: 'hour' },
    { limit: 604800, divisor: 86400, unit: 'day' },
    { limit: 2629800, divisor: 604800, unit: 'week' },
    { limit: 31557600, divisor: 2629800, unit: 'month' },
    { limit: Number.POSITIVE_INFINITY, divisor: 31557600, unit: 'year' },
  ];

  for (const { limit, divisor, unit } of units) {
    if (absolute < limit) {
      return formatter.format(Math.round(seconds / divisor), unit);
    }
  }

  return formatter.format(Math.round(seconds / 31557600), 'year');
}

export function formatDate(dateString, lang, options = {}) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(lang, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date);
}

export function isMacPlatform() {
  if (typeof navigator === 'undefined') return false;
  const platform = navigator.userAgentData?.platform || navigator.platform || '';
  return /mac|iphone|ipad|ipod/i.test(platform);
}

export function getCommandKeyLabel() {
  return isMacPlatform() ? '⌘K' : 'Ctrl K';
}

export function getCommandHintKey() {
  return isMacPlatform() ? '⌘' : 'Ctrl+';
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function projectById(projects, id) {
  return projects.find((project) => project.id === id);
}

export function scrollToTarget(target) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;
  element.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  });
}
