const STORAGE_KEY = 'zana-theme';
const THEMES = ['dark', 'light'];

function readSavedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (THEMES.includes(saved)) return saved;
  } catch {
    /* Storage is optional. */
  }
  return 'dark';
}

export function getTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function applyTheme(theme) {
  const resolved = THEMES.includes(theme) ? theme : 'dark';
  document.documentElement.dataset.theme = resolved;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  document.documentElement.style.colorScheme = resolved;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#09090B' : '#F8F8F7');
}

export function setTheme(theme) {
  applyTheme(theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* Theme still applies for the session. */
  }
  document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

export function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  return getTheme();
}

export function initTheme() {
  applyTheme(readSavedTheme());
  document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: getTheme() } }));
}
