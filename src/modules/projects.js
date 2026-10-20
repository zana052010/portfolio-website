import portfolio from '../data/portfolio-data.json';
import { escapeHtml, icon, logoMarkup, padNumber, projectById } from '../lib/utils.js';
import { refreshIcons } from '../lib/icons.js';
import { t, tx } from '../lib/i18n.js';
import { lockScroll, unlockScroll } from '../lib/scroll-lock.js';
import { demoMarkup, mountDemo } from './demo.js';

const filters = [
  { id: 'all', key: 'projects.all' },
  { id: 'cross-platform', key: 'projects.cross-platform' },
  { id: 'web', key: 'projects.web' },
  { id: 'workflow', key: 'projects.workflow' },
];

const categoryKeys = {
  'cross-platform': 'projects.cross-platform',
  web: 'projects.web',
  workflow: 'projects.workflow',
};

let activeFilter = 'all';
let activeFeature = 'engine';
let demoController = null;
let modalLocked = false;
let lastModalTrigger = null;

function categoryLabel(project) {
  return t(categoryKeys[project.category] || 'projects.all');
}

function countByFilter(filterId) {
  return filterId === 'all'
    ? portfolio.projects.length
    : portfolio.projects.filter((project) => project.category === filterId).length;
}

function renderFilters() {
  const container = document.getElementById('project-filters');
  if (!container) return;
  container.innerHTML = filters
    .map(
      (filter) => `
        <button
          class="filter-tab"
          type="button"
          data-filter="${filter.id}"
          aria-pressed="${activeFilter === filter.id}"
        >
          ${escapeHtml(t(filter.key))}
          <span class="filter-tab-count">${padNumber(countByFilter(filter.id))}</span>
        </button>
      `,
    )
    .join('');
}

function featureCopyMarkup(feature) {
  return `
    <p class="feature-copy-body">${escapeHtml(tx(feature.body))}</p>
    <ul class="feature-points">
      ${feature.points.map((point) => `<li>${escapeHtml(tx(point))}</li>`).join('')}
    </ul>
  `;
}

function featureTabsMarkup(project) {
  return project.features
    .map((feature, index) => {
      const selected = feature.id === activeFeature;
      return `
        <button
          class="feature-tab"
          type="button"
          role="tab"
          id="feature-tab-${feature.id}"
          aria-controls="flagship-feature-copy"
          aria-selected="${selected}"
          tabindex="${selected ? '0' : '-1'}"
          data-feature="${feature.id}"
        >
          ${icon(feature.icon)}
          <span class="feature-tab-label">${escapeHtml(tx(feature.tab))}</span>
          <span class="feature-tab-index">${padNumber(index + 1)}</span>
        </button>
      `;
    })
    .join('');
}

function platformMarkup(platforms, className = 'platform-chip') {
  return platforms
    .map(
      (platform) => `
        <span class="${className}" title="${escapeHtml(platform.name)}">
          ${logoMarkup({
            logo: platform.logo,
            monogram: platform.name.slice(0, 2),
            className: 'platform-logo',
            alt: platform.name,
          })}
          <span class="platform-name">${escapeHtml(platform.name)}</span>
        </span>
      `,
    )
    .join('');
}

function flagshipMarkup(project) {
  const feature = project.features.find((item) => item.id === activeFeature) || project.features[0];
  activeFeature = feature.id;

  return `
    <article class="flagship" data-project="${project.id}">
      <div class="flagship-head">
        <div class="flagship-head-left">
          <span class="flagship-tag">${icon('layers')}${escapeHtml(t('projects.flagship'))}</span>
          <span class="flagship-separator" aria-hidden="true"></span>
          <span class="flagship-category">${escapeHtml(categoryLabel(project))} · ${project.year}</span>
        </div>
        <div class="flagship-platforms" aria-label="${escapeHtml(t('projects.targets'))}">
          ${platformMarkup(project.platforms)}
        </div>
      </div>

      <div class="flagship-grid">
        <div class="flagship-info">
          <div class="flagship-kicker">
            <span class="mono-label">${escapeHtml(t('projects.case'))} ${padNumber(project.index)}</span>
            <span class="flagship-kicker-line" aria-hidden="true"></span>
            <span class="mono-label">${escapeHtml(tx(project.role))}</span>
          </div>
          <h3 class="flagship-title">${escapeHtml(tx(project.title))}</h3>
          <p class="flagship-subtitle">${escapeHtml(tx(project.subtitle))}</p>
          <p class="flagship-summary">${escapeHtml(tx(project.summary))}</p>

          <div class="feature-tabs" role="tablist" aria-label="${escapeHtml(t('projects.featureTabsAria'))}">
            ${featureTabsMarkup(project)}
          </div>

          <div
            class="feature-copy"
            id="flagship-feature-copy"
            role="tabpanel"
            aria-labelledby="feature-tab-${feature.id}"
            tabindex="0"
          >
            ${featureCopyMarkup(feature)}
          </div>

          <div class="flagship-stack">
            <span class="stack-caption">${escapeHtml(t('projects.stack'))}</span>
            ${project.stack.map((item) => `<span class="tech-chip">${escapeHtml(item)}</span>`).join('')}
          </div>

          <button class="spec-link" type="button" data-open-project="${project.id}">
            ${escapeHtml(t('projects.viewSpec'))}
            ${icon('arrow-up-right')}
          </button>
        </div>

        <div class="flagship-preview">
          ${demoMarkup(feature.id)}
        </div>
      </div>
    </article>
  `;
}

function projectRowMarkup(project) {
  return `
    <button
      class="project-row"
      type="button"
      data-open-project="${project.id}"
      aria-label="${escapeHtml(`${t('projects.openCase')}: ${tx(project.title)}`)}"
    >
      <span class="project-row-index">${padNumber(project.index)}</span>
      <span class="project-row-main">
        <span class="project-row-kicker">
          ${escapeHtml(categoryLabel(project))}
          <span class="project-row-kicker-dot" aria-hidden="true"></span>
          ${project.year}
        </span>
        <span class="project-row-title">${escapeHtml(tx(project.title))}</span>
        <span class="project-row-subtitle">${escapeHtml(tx(project.subtitle))}</span>
      </span>
      <span class="project-row-summary">${escapeHtml(tx(project.summary))}</span>
      <span class="project-row-side">
        <span class="project-row-side-label">${escapeHtml(t('projects.openCase'))}</span>
        <span class="project-row-arrow">${icon('arrow-up-right')}</span>
      </span>
    </button>
  `;
}

function cleanupDemo() {
  if (demoController) {
    demoController.destroy();
    demoController = null;
  }
}

function mountFlagshipDemo(project) {
  const demo = document.querySelector('#flagship-slot [data-demo]');
  if (!demo) return;
  const feature = project.features.find((item) => item.id === activeFeature) || project.features[0];
  demoController = mountDemo(demo, {
    featureId: feature.preview,
    featureLabel: tx(feature.tab),
  });
  refreshIcons(demo);
}

function renderProjects() {
  cleanupDemo();
  renderFilters();

  const visible = portfolio.projects.filter(
    (project) => activeFilter === 'all' || project.category === activeFilter,
  );
  const flagship = visible.find((project) => project.flagship);
  const rows = visible.filter((project) => !project.flagship);

  const flagshipSlot = document.getElementById('flagship-slot');
  const projectList = document.getElementById('project-list');
  const emptyState = document.getElementById('projects-empty');
  const countLabel = document.getElementById('project-count');

  if (flagshipSlot) {
    flagshipSlot.innerHTML = flagship ? flagshipMarkup(flagship) : '';
    refreshIcons(flagshipSlot);
  }

  if (projectList) {
    projectList.innerHTML = rows.map(projectRowMarkup).join('');
    projectList.hidden = rows.length === 0;
    refreshIcons(projectList);
  }

  if (emptyState) emptyState.hidden = visible.length !== 0;
  if (countLabel) {
    countLabel.textContent = t('projects.count', {
      shown: padNumber(visible.length),
      total: padNumber(portfolio.projects.length),
    });
  }

  if (flagship) mountFlagshipDemo(flagship);
}

function selectFeature(featureId, { focus = false } = {}) {
  const project = projectById(portfolio.projects, 'music-player');
  if (!project) return;
  const feature = project.features.find((item) => item.id === featureId);
  if (!feature) return;
  activeFeature = feature.id;

  const tabs = document.querySelectorAll('#flagship-slot [data-feature]');
  tabs.forEach((tab) => {
    const selected = tab.dataset.feature === feature.id;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focus) tab.focus();
  });

  const copy = document.getElementById('flagship-feature-copy');
  if (copy) {
    copy.setAttribute('aria-labelledby', `feature-tab-${feature.id}`);
    copy.innerHTML = featureCopyMarkup(feature);
    refreshIcons(copy);
  }

  demoController?.setFeature(feature.preview, tx(feature.tab));
}

function modalMarkup(project) {
  return `
    <div class="modal-shell">
      <div class="modal-head">
        <div class="modal-head-copy">
          <div class="modal-kicker">
            <span>${escapeHtml(t('projects.spec.dialogLabel'))}</span>
            <span class="modal-kicker-dot" aria-hidden="true"></span>
            <span>${escapeHtml(t('projects.case'))} ${padNumber(project.index)}</span>
            <span class="modal-kicker-dot" aria-hidden="true"></span>
            <span>${project.year}</span>
          </div>
          <h2 class="modal-title" id="project-dialog-title">${escapeHtml(tx(project.title))}</h2>
          <p class="modal-subtitle">${escapeHtml(tx(project.subtitle))}</p>
        </div>
        <button class="modal-close" type="button" data-modal-close aria-label="${escapeHtml(t('common.close'))}">
          ${icon('x')}
        </button>
      </div>

      <div class="modal-body" tabindex="0">
        <div class="modal-meta-row">
          <div class="modal-meta">
            <span class="modal-meta-label">${escapeHtml(t('projects.year'))}</span>
            <span class="modal-meta-value">${project.year}</span>
          </div>
          <div class="modal-meta">
            <span class="modal-meta-label">${escapeHtml(t('projects.role'))}</span>
            <span class="modal-meta-value">${escapeHtml(tx(project.role))}</span>
          </div>
          <div class="modal-meta">
            <span class="modal-meta-label">${escapeHtml(t('projects.status'))}</span>
            <span class="modal-meta-value">${escapeHtml(tx(project.status))}</span>
          </div>
          <div class="modal-meta">
            <span class="modal-meta-label">${escapeHtml(t('projects.targets'))}</span>
            <span class="modal-meta-value">${project.platforms.map((platform) => platform.name).join(' · ')}</span>
          </div>
        </div>

        <div class="modal-section">
          <span class="modal-section-label">${escapeHtml(t('projects.spec.overview'))}</span>
          <p class="modal-overview">${escapeHtml(tx(project.spec.overview))}</p>
          <div class="modal-metrics">
            ${project.spec.metrics
              .map(
                (metric) => `
                  <div class="modal-metric">
                    <div class="modal-metric-value">${escapeHtml(metric.value)}</div>
                    <div class="modal-metric-label">${escapeHtml(tx(metric.label))}</div>
                  </div>
                `,
              )
              .join('')}
          </div>
        </div>

        <div class="modal-section">
          <span class="modal-section-label">${escapeHtml(t('projects.spec.architecture'))}</span>
          <div class="spec-architecture">
            ${project.spec.architecture
              .map(
                (layer, index) => `
                  <div class="spec-arch-row">
                    <span class="spec-arch-index">${padNumber(index + 1)} / ${padNumber(
                      project.spec.architecture.length,
                    )}</span>
                    <div>
                      <div class="spec-arch-title">${escapeHtml(tx(layer.title))}</div>
                      <p class="spec-arch-body">${escapeHtml(tx(layer.body))}</p>
                    </div>
                  </div>
                `,
              )
              .join('')}
          </div>
        </div>

        <div class="modal-section">
          <div class="spec-columns">
            <div>
              <span class="modal-section-label">${escapeHtml(t('projects.spec.capabilities'))}</span>
              <ul class="check-list">
                ${project.spec.capabilities
                  .map((item) => `<li>${icon('check')}<span>${escapeHtml(tx(item))}</span></li>`)
                  .join('')}
              </ul>
            </div>
            <div>
              <span class="modal-section-label">${escapeHtml(t('projects.spec.delivery'))}</span>
              <ul class="check-list">
                ${project.spec.delivery
                  .map((item) => `<li>${icon('git-branch')}<span>${escapeHtml(tx(item))}</span></li>`)
                  .join('')}
              </ul>
              <div class="modal-targets">
                ${project.platforms
                  .map(
                    (platform) => `
                      <span class="modal-target">
                        ${logoMarkup({
                          logo: platform.logo,
                          monogram: platform.name.slice(0, 2),
                          className: 'modal-target-logo',
                          alt: platform.name,
                        })}
                        <span>${escapeHtml(platform.name)}</span>
                      </span>
                    `,
                  )
                  .join('')}
              </div>
            </div>
          </div>
        </div>

        <div class="modal-section">
          <span class="modal-section-label">${escapeHtml(t('projects.spec.stack'))}</span>
          <div class="modal-stack">
            ${project.stack.map((item) => `<span class="tech-chip">${escapeHtml(item)}</span>`).join('')}
          </div>
        </div>
      </div>

      <div class="modal-foot">
        <span class="modal-foot-meta">zana052010 / ${escapeHtml(t('projects.spec.index'))} ${padNumber(
          project.index,
        )}</span>
        <a
          class="modal-discuss"
          href="${portfolio.profile.github}"
          target="_blank"
          rel="noopener noreferrer"
        >
          ${escapeHtml(t('projects.spec.discuss'))}
          ${icon('arrow-up-right')}
        </a>
      </div>
    </div>
  `;
}

function openProjectModal(projectId) {
  const dialog = document.getElementById('project-dialog');
  const project = projectById(portfolio.projects, projectId);
  if (!dialog || !project) return;

  if (dialog.open) {
    dialog.close();
    if (modalLocked) {
      unlockScroll();
      modalLocked = false;
    }
  }

  lastModalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  dialog.innerHTML = modalMarkup(project);
  dialog.setAttribute('aria-labelledby', 'project-dialog-title');
  dialog.showModal();
  lockScroll();
  modalLocked = true;
  refreshIcons(dialog);

  const closeButton = dialog.querySelector('[data-modal-close]');
  closeButton?.addEventListener('click', () => dialog.close());

  dialog.addEventListener(
    'close',
    () => {
      if (modalLocked) {
        unlockScroll();
        modalLocked = false;
      }
      const trigger = lastModalTrigger;
      lastModalTrigger = null;
      if (trigger && trigger.isConnected && !trigger.closest('#command-palette')) {
        trigger.focus({ preventScroll: true });
      }
    },
    { once: true },
  );
}

function handleFeatureKeyboard(event) {
  if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
    return;
  }
  const tabs = Array.from(document.querySelectorAll('#flagship-slot [data-feature]'));
  if (!tabs.length) return;
  const project = projectById(portfolio.projects, 'music-player');
  if (!project) return;
  const currentIndex = project.features.findIndex((feature) => feature.id === activeFeature);
  let nextIndex = currentIndex;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    nextIndex = (currentIndex + 1) % project.features.length;
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    nextIndex = (currentIndex - 1 + project.features.length) % project.features.length;
  } else if (event.key === 'Home') {
    nextIndex = 0;
  } else if (event.key === 'End') {
    nextIndex = project.features.length - 1;
  }
  event.preventDefault();
  selectFeature(project.features[nextIndex].id, { focus: true });
}

export function initProjects() {
  const filterContainer = document.getElementById('project-filters');
  const flagshipSlot = document.getElementById('flagship-slot');
  const list = document.getElementById('project-list');
  const dialog = document.getElementById('project-dialog');

  filterContainer?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    activeFilter = button.dataset.filter;
    renderProjects();
  });

  flagshipSlot?.addEventListener('click', (event) => {
    const featureTab = event.target.closest('[data-feature]');
    if (featureTab) {
      selectFeature(featureTab.dataset.feature);
      return;
    }
    const op = event.target.closest('[data-open-project]');
    if (op) openProjectModal(op.dataset.openProject);
  });

  flagshipSlot?.addEventListener('keydown', (event) => {
    if (event.target.closest('[data-feature]')) handleFeatureKeyboard(event);
  });

  list?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-open-project]');
    if (button) openProjectModal(button.dataset.openProject);
  });

  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  document.addEventListener('project:open', (event) => {
    openProjectModal(event.detail?.id);
  });

  document.addEventListener('languagechange', () => {
    if (dialog?.open) dialog.close();
    renderProjects();
  });

  renderProjects();
}
