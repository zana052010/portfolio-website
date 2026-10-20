import portfolio from '../data/portfolio-data.json';
import { escapeHtml, icon, logoMarkup, padNumber, projectById } from '../lib/utils.js';
import { refreshIcons } from '../lib/icons.js';
import { t, tx } from '../lib/i18n.js';

const categories = [
  { id: 'all', key: 'stack.all' },
  { id: 'languages', key: 'stack.languages' },
  { id: 'frameworks', key: 'stack.frameworks' },
  { id: 'architecture', key: 'stack.architecture' },
  { id: 'devops', key: 'stack.devops' },
];

const categoryLabelKeys = {
  languages: 'stack.languages',
  frameworks: 'stack.frameworks',
  architecture: 'stack.architecture',
  devops: 'stack.devops',
};

let activeCategory = 'all';
let activeTechId = 'csharp';

function techLogo(tech, context = 'row') {
  if (!tech.logo && tech.icon) {
    return icon(tech.icon, context === 'detail' ? 'tech-detail-fallback-icon' : 'tech-fallback-icon');
  }
  const isMonoLogo = tech.logo?.includes('simple-icons');
  const className = `${context === 'detail' ? 'tech-detail-logo-img' : 'tech-logo'}${
    isMonoLogo ? ' is-mono-logo' : ''
  }`;
  return logoMarkup({
    logo: tech.logo,
    monogram: tech.monogram,
    className,
    alt: tech.name,
  });
}

function filteredTech() {
  return activeCategory === 'all'
    ? portfolio.tech
    : portfolio.tech.filter((tech) => tech.category === activeCategory);
}

function levelMarkup(tech, context = 'row') {
  const label = t(`stack.levels.${tech.level}`);
  const bars = Array.from({ length: 5 }, (_, index) => {
    const filled = index < tech.level;
    return `<span class="level-bar${filled ? ' is-filled' : ''}" aria-hidden="true"></span>`;
  }).join('');
  return `
    <span
      class="${context === 'detail' ? 'tech-detail-level' : 'tech-level'}"
      role="img"
      aria-label="${escapeHtml(t('stack.levelAria', { level: label, filled: tech.level }))}"
    >
      <span class="level-bars">${bars}</span>
      <span class="level-name">${escapeHtml(label)}</span>
    </span>
  `;
}

function usedBadge(projectId) {
  if (projectId === 'portfolio') {
    return `<span class="used-badge used-badge--portfolio" title="${escapeHtml(
      t('stack.detail.thisSite'),
    )}">P</span>`;
  }
  const project = projectById(portfolio.projects, projectId);
  if (!project) return '';
  return `<span class="used-badge" title="${escapeHtml(tx(project.title))}">${padNumber(
    project.index,
  )}</span>`;
}

function renderFilters() {
  const container = document.getElementById('stack-filters');
  if (!container) return;
  container.innerHTML = categories
    .map((category) => {
      const count =
        category.id === 'all'
          ? portfolio.tech.length
          : portfolio.tech.filter((tech) => tech.category === category.id).length;
      return `
        <button
          class="filter-tab"
          type="button"
          data-stack-filter="${category.id}"
          aria-pressed="${activeCategory === category.id}"
        >
          ${escapeHtml(t(category.key))}
          <span class="filter-tab-count">${padNumber(count)}</span>
        </button>
      `;
    })
    .join('');
}

function renderTable() {
  const container = document.getElementById('tech-table');
  const count = document.getElementById('stack-count');
  if (!container) return;
  const techList = filteredTech();
  if (!techList.some((tech) => tech.id === activeTechId) && techList[0]) {
    activeTechId = techList[0].id;
  }

  container.innerHTML = techList
    .map(
      (tech) => `
        <button
          class="tech-row${tech.id === activeTechId ? ' is-active' : ''}"
          type="button"
          data-tech-id="${tech.id}"
          aria-label="${escapeHtml(`${tech.name}, ${tx(tech.role)}, ${t(`stack.levels.${tech.level}`)}`)}"
        >
          <span class="tech-identity">
            <span class="tech-logo-wrap">${techLogo(tech)}</span>
            <span class="tech-name-wrap">
              <span class="tech-name">${escapeHtml(tech.name)}</span>
              <span class="tech-category">${escapeHtml(
                t(categoryLabelKeys[tech.category] || 'stack.all'),
              )}</span>
            </span>
          </span>
          <span class="tech-role">${escapeHtml(tx(tech.role))}</span>
          ${levelMarkup(tech)}
          <span class="tech-used">
            ${tech.usedIn.map(usedBadge).join('')}
          </span>
        </button>
      `,
    )
    .join('');

  if (techList.length === 0) {
    container.innerHTML = `<p class="empty-state">${escapeHtml(t('stack.empty'))}</p>`;
  }

  if (count) {
    count.textContent = t('stack.count', {
      shown: padNumber(techList.length),
      total: padNumber(portfolio.tech.length),
    });
  }
  refreshIcons(container);
}

function renderDetail() {
  const container = document.getElementById('tech-detail');
  if (!container) return;
  const tech = portfolio.tech.find((item) => item.id === activeTechId) || filteredTech()[0];
  if (!tech) {
    container.innerHTML = `<p class="tech-detail-empty">${escapeHtml(t('stack.detail.hint'))}</p>`;
    return;
  }

  const index = portfolio.tech.indexOf(tech) + 1;
  const usedItems = tech.usedIn
    .map((projectId) => {
      if (projectId === 'portfolio') {
        return `
          <div class="tech-used-static">
            <span class="used-badge used-badge--portfolio">P</span>
            <span>${escapeHtml(t('stack.detail.thisSite'))}</span>
          </div>
        `;
      }
      const project = projectById(portfolio.projects, projectId);
      if (!project) return '';
      return `
        <button class="tech-used-link" type="button" data-tech-project="${project.id}">
          <span class="used-badge">${padNumber(project.index)}</span>
          <span>${escapeHtml(tx(project.title))}</span>
          ${icon('arrow-up-right')}
        </button>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="tech-detail-inner">
      <div class="tech-detail-head">
        <div class="tech-detail-id">
          <span class="tech-detail-logo">${techLogo(tech, 'detail')}</span>
          <div>
            <div class="tech-detail-name">${escapeHtml(tech.name)}</div>
            <div class="tech-detail-category">${escapeHtml(
              t(categoryLabelKeys[tech.category] || 'stack.all'),
            )}</div>
          </div>
        </div>
        <span class="detail-index">${padNumber(index)} / ${padNumber(portfolio.tech.length)}</span>
      </div>

      <div class="tech-detail-section">
        <div class="tech-detail-label">${escapeHtml(t('stack.detail.description'))}</div>
        <p class="tech-detail-description">${escapeHtml(tx(tech.description))}</p>
      </div>

      <div class="tech-detail-section">
        <div class="tech-detail-label">${escapeHtml(t('stack.detail.role'))}</div>
        <div class="tech-detail-role">${escapeHtml(tx(tech.role))}</div>
      </div>

      <div class="tech-detail-section">
        <div class="tech-detail-label">${escapeHtml(t('stack.detail.level'))}</div>
        ${levelMarkup(tech, 'detail')}
      </div>

      <div class="tech-detail-section">
        <div class="tech-detail-label">${escapeHtml(t('stack.detail.usedIn'))}</div>
        <div class="tech-detail-used">${usedItems}</div>
      </div>

      <div class="tech-detail-footer">
        <p class="mono-note">${escapeHtml(t('stack.detail.hint'))}</p>
      </div>
    </div>
  `;
  refreshIcons(container);
}

function updateActiveRowStyles() {
  document.querySelectorAll('#tech-table [data-tech-id]').forEach((row) => {
    row.classList.toggle('is-active', row.dataset.techId === activeTechId);
  });
}

function selectTech(id) {
  if (id === activeTechId) return;
  const tech = portfolio.tech.find((item) => item.id === id);
  if (!tech) return;
  activeTechId = id;
  updateActiveRowStyles();
  renderDetail();
}

export function initStack() {
  const filtersContainer = document.getElementById('stack-filters');
  const table = document.getElementById('tech-table');
  const detail = document.getElementById('tech-detail');
  if (!filtersContainer || !table) return;

  renderFilters();
  renderTable();
  renderDetail();

  filtersContainer.addEventListener('click', (event) => {
    const button = event.target.closest('[data-stack-filter]');
    if (!button) return;
    activeCategory = button.dataset.stackFilter;
    renderFilters();
    renderTable();
    renderDetail();
  });

  table.addEventListener('pointerover', (event) => {
    const row = event.target.closest('[data-tech-id]');
    if (row) selectTech(row.dataset.techId);
  });

  table.addEventListener('focusin', (event) => {
    const row = event.target.closest('[data-tech-id]');
    if (row) selectTech(row.dataset.techId);
  });

  table.addEventListener('click', (event) => {
    const row = event.target.closest('[data-tech-id]');
    if (row) selectTech(row.dataset.techId);
  });

  detail?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-tech-project]');
    if (!button) return;
    document.dispatchEvent(new CustomEvent('project:open', { detail: { id: button.dataset.techProject } }));
  });

  document.addEventListener('languagechange', () => {
    renderFilters();
    renderTable();
    renderDetail();
  });
}
