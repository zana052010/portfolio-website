import portfolio from '../data/portfolio-data.json';
import { brandIcon, escapeHtml, icon, scrollToTarget } from '../lib/utils.js';
import { getLang, setLang, t, tx } from '../lib/i18n.js';
import { getTheme, toggleTheme } from '../lib/theme.js';
import { lockScroll, unlockScroll } from '../lib/scroll-lock.js';
import { showToast } from '../lib/toast.js';
import { refreshIcons } from '../lib/icons.js';

const groupOrder = ['navigate', 'projects', 'system'];
const groupKeys = {
  navigate: 'palette.groups.navigate',
  projects: 'palette.groups.projects',
  system: 'palette.groups.system',
};

const navEntries = [
  {
    id: 'top',
    target: '#top',
    title: 'palette.goTop',
    badge: '00',
    icon: 'arrow-up',
    keywords: 'home top start overview главная начало',
  },
  {
    id: 'projects',
    target: '#projects',
    title: 'palette.goProjects',
    badge: '01',
    icon: 'arrow-right',
    keywords: 'project projects work case files проекты кейсы работа',
  },
  {
    id: 'architecture',
    target: '#architecture',
    title: 'palette.goArchitecture',
    badge: '02',
    icon: 'layers',
    keywords: 'system design layers architecture архитектура слои',
  },
  {
    id: 'stack',
    target: '#stack',
    title: 'palette.goStack',
    badge: '03',
    icon: 'sliders-horizontal',
    keywords: 'tech technology tools stack skills стек технологии инструменты',
  },
  {
    id: 'activity',
    target: '#activity',
    title: 'palette.goActivity',
    badge: '04',
    icon: 'file-text',
    keywords: 'github activity commits repos активность коммиты репозитории',
  },
  {
    id: 'contact',
    target: '#contact',
    title: 'palette.goContact',
    badge: '05',
    icon: 'arrow-down',
    keywords: 'contact hire collaboration contact связь контакт сотрудничество',
  },
];

let overlay;
let input;
let results;
let isOpen = false;
let activeIndex = 0;
let filteredCommands = [];
let previousFocus = null;
let scrollLocked = false;

function categoryLabel(project) {
  if (project.category === 'web') return t('projects.web');
  if (project.category === 'workflow') return t('projects.workflow');
  return t('projects.cross-platform');
}

function buildCommands() {
  const theme = getTheme();
  const lang = getLang();

  const navCommands = navEntries.map((entry) => ({
    id: `nav-${entry.id}`,
    group: 'navigate',
    title: t(entry.title),
    subtitle: entry.target.replace('#', '/'),
    badge: entry.badge,
    icon: entry.icon,
    keywords: `${t(entry.title)} ${entry.keywords}`,
    run: () => scrollToTarget(entry.target),
  }));

  const projectCommands = portfolio.projects.map((project) => ({
    id: `project-${project.id}`,
    group: 'projects',
    title: `${t('palette.project')} — ${tx(project.title)}`,
    subtitle: `${categoryLabel(project)} · ${project.year}`,
    badge: `${t('projects.case').toUpperCase()} ${project.index}`,
    icon: 'file-text',
    keywords: [
      'project case file',
      'проект кейс',
      project.title.en,
      project.title.ru,
      categoryLabel(project),
      project.stack.join(' '),
    ].join(' '),
    run: () => {
      document.dispatchEvent(new CustomEvent('project:open', { detail: { id: project.id } }));
    },
  }));

  const systemCommands = [
    {
      id: 'theme',
      group: 'system',
      title: theme === 'dark' ? t('palette.toggleThemeLight') : t('palette.toggleThemeDark'),
      subtitle: t('palette.toggleTheme'),
      badge: theme === 'dark' ? 'LIGHT' : 'DARK',
      icon: theme === 'dark' ? 'sun' : 'moon',
      keywords: 'theme appearance dark light тема оформление тёмная светлая',
      run: () => toggleTheme(),
    },
    {
      id: 'language',
      group: 'system',
      title: t('palette.switchLanguageTo'),
      subtitle: lang === 'en' ? 'English → Русский' : 'Русский → English',
      badge: lang === 'en' ? 'RU' : 'EN',
      icon: 'languages',
      keywords: 'language locale english russian en ru язык английский русский',
      run: () => setLang(lang === 'en' ? 'ru' : 'en'),
    },
    {
      id: 'copy',
      group: 'system',
      title: t('palette.copyGithub'),
      subtitle: 'github.com/zana052010',
      badge: 'URL',
      icon: 'copy',
      keywords: 'copy clipboard link url github ссылка скопировать буфер',
      run: copyGithub,
    },
    {
      id: 'github',
      group: 'system',
      title: t('palette.openGithub'),
      subtitle: 'github.com/zana052010',
      badge: 'GH',
      iconHtml: brandIcon('github'),
      keywords: 'github profile repository repos профиль репозиторий',
      run: () => {
        window.open(portfolio.profile.github, '_blank', 'noopener,noreferrer');
      },
    },
  ];

  return [...navCommands, ...projectCommands, ...systemCommands];
}

function commandMatches(command, query) {
  if (!query) return true;
  const haystack = `${command.title} ${command.subtitle} ${command.badge} ${
    command.keywords || ''
  }`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token));
}

function updateSelection(index, { scroll = true } = {}) {
  if (!filteredCommands.length) {
    activeIndex = -1;
    input?.removeAttribute('aria-activedescendant');
    return;
  }
  activeIndex = (index + filteredCommands.length) % filteredCommands.length;
  results.querySelectorAll('[data-command-index]').forEach((item) => {
    const selected = Number(item.dataset.commandIndex) === activeIndex;
    item.setAttribute('aria-selected', String(selected));
    if (selected) {
      input?.setAttribute('aria-activedescendant', item.id);
      if (scroll) item.scrollIntoView({ block: 'nearest' });
    }
  });
}

function renderResults() {
  if (!results || !input) return;
  const query = input.value.trim();
  const commands = buildCommands().filter((command) => commandMatches(command, query));
  filteredCommands = commands;

  if (commands.length === 0) {
    activeIndex = -1;
    input.removeAttribute('aria-activedescendant');
    results.innerHTML = `
      <div class="palette-empty">
        <div class="palette-empty-title">${escapeHtml(t('palette.noResults'))}</div>
        <div class="palette-empty-note">${escapeHtml(t('palette.try'))}</div>
      </div>
    `;
    return;
  }

  let globalIndex = 0;
  results.innerHTML = groupOrder
    .map((group) => {
      const groupCommands = commands.filter((command) => command.group === group);
      if (!groupCommands.length) return '';
      return `
        <div class="palette-group" role="group" aria-label="${escapeHtml(t(groupKeys[group]))}">
          <div class="palette-group-label">${escapeHtml(t(groupKeys[group]))}</div>
          ${groupCommands
            .map((command) => {
              const index = globalIndex;
              globalIndex += 1;
              return `
                <button
                  class="palette-item"
                  type="button"
                  id="palette-option-${index}"
                  role="option"
                  tabindex="-1"
                  aria-selected="${index === activeIndex}"
                  data-command-index="${index}"
                >
                  ${command.iconHtml || icon(command.icon)}
                  <span class="palette-item-copy">
                    <span class="palette-item-title">${escapeHtml(command.title)}</span>
                    <span class="palette-item-sub">${escapeHtml(command.subtitle)}</span>
                  </span>
                  <span class="palette-item-badge">${escapeHtml(command.badge)}</span>
                </button>
              `;
            })
            .join('')}
        </div>
      `;
    })
    .join('');

  refreshIcons(results);
  updateSelection(Math.max(0, Math.min(activeIndex, commands.length - 1)), { scroll: false });
}

function openPalette() {
  if (!overlay || isOpen) return;
  const dialog = document.getElementById('project-dialog');
  if (dialog?.open) dialog.close();

  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  isOpen = true;
  overlay.hidden = false;
  document.body.classList.add('palette-is-open');
  input.value = '';
  activeIndex = 0;
  input.placeholder = t('palette.placeholder');
  input.setAttribute('aria-label', t('palette.aria'));
  results.setAttribute('aria-label', t('palette.resultsLabel'));
  renderResults();
  lockScroll();
  scrollLocked = true;
  window.requestAnimationFrame(() => {
    input.focus({ preventScroll: true });
    updateSelection(0, { scroll: false });
  });
}

function closePalette({ restoreFocus = true } = {}) {
  if (!isOpen) return;
  isOpen = false;
  overlay.hidden = true;
  document.body.classList.remove('palette-is-open');
  if (scrollLocked) {
    unlockScroll();
    scrollLocked = false;
  }
  if (restoreFocus && previousFocus?.isConnected) {
    previousFocus.focus({ preventScroll: true });
  }
  previousFocus = null;
}

function executeCommand(index) {
  const command = filteredCommands[index];
  if (!command) return;
  closePalette({ restoreFocus: false });
  window.requestAnimationFrame(() => {
    command.run();
  });
}

async function copyGithub() {
  const url = portfolio.profile.github;
  try {
    await navigator.clipboard.writeText(url);
    showToast(t('common.copied'));
  } catch {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.append(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      textarea.remove();
      showToast(copied ? t('common.copied') : t('common.copyFailed'));
    } catch {
      showToast(t('common.copyFailed'));
    }
  }
}

export function initPalette() {
  overlay = document.getElementById('command-palette');
  input = document.getElementById('palette-input');
  results = document.getElementById('palette-results');
  if (!overlay || !input || !results) return;

  input.addEventListener('input', () => {
    activeIndex = 0;
    renderResults();
  });

  overlay.addEventListener('keydown', (event) => {
    if (!isOpen) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      updateSelection(activeIndex + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      updateSelection(activeIndex - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      updateSelection(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      updateSelection(filteredCommands.length - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      executeCommand(activeIndex);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closePalette();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      input.focus();
    }
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closePalette({ restoreFocus: false });
      return;
    }
    const item = event.target.closest('[data-command-index]');
    if (!item) return;
    activeIndex = Number(item.dataset.commandIndex);
    executeCommand(activeIndex);
  });

  overlay.addEventListener('pointermove', (event) => {
    const item = event.target.closest('[data-command-index]');
    if (!item) return;
    const index = Number(item.dataset.commandIndex);
    if (index !== activeIndex) updateSelection(index, { scroll: false });
  });

  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (isOpen) closePalette();
      else openPalette();
    }
    if (event.key === 'Escape' && isOpen) closePalette();
  });

  document.addEventListener('palette:open', openPalette);

  document.addEventListener('languagechange', () => {
    if (!isOpen) return;
    input.placeholder = t('palette.placeholder');
    input.setAttribute('aria-label', t('palette.aria'));
    results.setAttribute('aria-label', t('palette.resultsLabel'));
    renderResults();
  });

  document.addEventListener('themechange', () => {
    if (isOpen) renderResults();
  });
}
