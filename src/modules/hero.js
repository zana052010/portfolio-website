import portfolio from '../data/portfolio-data.json';
import { escapeHtml, icon, logoMarkup, padNumber } from '../lib/utils.js';
import { refreshIcons } from '../lib/icons.js';
import { t, tx } from '../lib/i18n.js';

let activeTargetId = portfolio.targets[0].id;

function renderTabs(tabs) {
  const activeTarget = portfolio.targets.find((target) => target.id === activeTargetId) || portfolio.targets[0];
  tabs.innerHTML = portfolio.targets
    .map((target) => {
      const selected = target.id === activeTarget.id;
      return `
        <button
          class="inspector-tab"
          type="button"
          role="tab"
          id="inspector-tab-${target.id}"
          aria-controls="inspector-panel-${target.id}"
          aria-selected="${selected}"
          tabindex="${selected ? '0' : '-1'}"
          data-target="${target.id}"
        >
          ${icon(target.icon)}
          <span>${escapeHtml(tx(target.tabLabel))}</span>
        </button>
      `;
    })
    .join('');
}

function renderPanel(target) {
  return `
    <div
      class="inspector-panel"
      id="inspector-panel-${target.id}"
      role="tabpanel"
      aria-labelledby="inspector-tab-${target.id}"
      tabindex="0"
    >
      <div class="target-top">
        <div>
          <span class="target-kicker mono-label">${escapeHtml(tx(target.tabLabel))} / ${padNumber(
            portfolio.targets.indexOf(target) + 1,
          )}</span>
          <h3 class="target-title">${escapeHtml(tx(target.title))}</h3>
        </div>
        <span class="target-count" aria-label="${escapeHtml(
          `${target.systems.length} ${t('hero.inspector.systems')}`,
        )}">${padNumber(target.systems.length)}</span>
      </div>
      <p class="target-description">${escapeHtml(tx(target.description))}</p>
      <div class="os-row" aria-label="${escapeHtml(t('hero.inspector.systems'))}">
        ${target.systems
          .map(
            (system) => `
              <span class="os-chip">
                ${logoMarkup({
                  logo: system.logo,
                  monogram: system.name.slice(0, 2),
                  className: 'os-logo',
                  alt: system.name,
                })}
                <span>${escapeHtml(system.name)}</span>
              </span>
            `,
          )
          .join('')}
      </div>
      <div class="spec-list" aria-label="${escapeHtml(t('hero.inspector.specifications'))}">
        ${target.specs
          .map(
            (spec) => `
              <div class="spec-row">
                <span class="spec-key">${escapeHtml(t(`hero.inspector.specs.${spec.key}`))}</span>
                <span class="spec-value">${escapeHtml(tx(spec.value))}</span>
              </div>
            `,
          )
          .join('')}
      </div>
    </div>
  `;
}

export function initHero() {
  const tabs = document.getElementById('inspector-tabs');
  const body = document.getElementById('inspector-body');
  const role = document.getElementById('hero-role');
  if (!tabs || !body) return;

  tabs.setAttribute('aria-label', t('hero.inspector.tablist'));

  function selectTarget(id, { focus = false } = {}) {
    const target = portfolio.targets.find((item) => item.id === id);
    if (!target) return;
    activeTargetId = target.id;
    tabs.querySelectorAll('[data-target]').forEach((button) => {
      const selected = button.dataset.target === target.id;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && focus) button.focus();
    });
    body.innerHTML = renderPanel(target);
    refreshIcons(body);
  }

  function render() {
    tabs.setAttribute('aria-label', t('hero.inspector.tablist'));
    renderTabs(tabs);
    const target =
      portfolio.targets.find((item) => item.id === activeTargetId) || portfolio.targets[0];
    body.innerHTML = renderPanel(target);
    if (role) role.textContent = tx(portfolio.profile.role);
    refreshIcons(tabs);
    refreshIcons(body);
  }

  tabs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-target]');
    if (!button) return;
    selectTarget(button.dataset.target);
  });

  tabs.addEventListener('keydown', (event) => {
    const currentIndex = portfolio.targets.findIndex((target) => target.id === activeTargetId);
    let nextIndex = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % portfolio.targets.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + portfolio.targets.length) % portfolio.targets.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = portfolio.targets.length - 1;
    }
    if (nextIndex === null) return;
    event.preventDefault();
    selectTarget(portfolio.targets[nextIndex].id, { focus: true });
  });

  render();
  document.addEventListener('languagechange', render);
}
