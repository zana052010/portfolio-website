import { getCommandHintKey, getCommandKeyLabel } from './utils.js';

const STORAGE_KEY = 'zana-lang';
const SUPPORTED = ['en', 'ru'];
let translations = null;

function detectLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED.includes(saved)) return saved;
  } catch {
    /* Storage can be unavailable; English remains the safe default. */
  }
  return 'en';
}

let language = detectLanguage();

function lookup(dictionary, path) {
  return path.split('.').reduce((value, key) => {
    if (value == null) return undefined;
    return value[key];
  }, dictionary);
}

export function getLang() {
  return language;
}

export function t(path, vars) {
  if (!translations) return path;
  let value = lookup(translations[language], path);
  if (value === undefined) value = lookup(translations.en, path);
  if (value === undefined) return path;
  if (typeof value === 'string' && vars) {
    return value.replace(/\{(\w+)\}/g, (match, name) => {
      if (Object.hasOwn(vars, name)) return String(vars[name]);
      return match;
    });
  }
  return value;
}

export function tx(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[language] ?? value.en ?? '';
}

export function applyStaticTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = t(element.dataset.i18n, { key: getCommandHintKey() });
    if (typeof value === 'string') element.textContent = value;
  });

  root.querySelectorAll('[data-i18n-aria]').forEach((element) => {
    element.setAttribute('aria-label', t(element.dataset.i18nAria));
  });

  root.querySelectorAll('[data-command-key]').forEach((element) => {
    element.textContent = getCommandKeyLabel();
  });

  document.documentElement.lang = language;
  document.title = t('meta.title');
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', t('meta.description'));
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', t('meta.title'));
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.setAttribute('content', t('meta.description'));

  document.querySelectorAll('[data-lang-button]').forEach((button) => {
    const active = button.dataset.langButton === language;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

export function initI18n(catalog) {
  translations = catalog;
  applyStaticTranslations();
  document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang: language } }));
}

export function setLang(next) {
  if (!SUPPORTED.includes(next) || next === language) return;
  language = next;
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    /* Language still applies for the session. */
  }
  applyStaticTranslations();
  document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang: language } }));
}
