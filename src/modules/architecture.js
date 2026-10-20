import portfolio from '../data/portfolio-data.json';
import { escapeHtml, icon, padNumber } from '../lib/utils.js';
import { refreshIcons } from '../lib/icons.js';
import { t, tx } from '../lib/i18n.js';

const layers = portfolio.architecture.layers;
let activeLayerId = 'domain';

function layerListMarkup() {
  return layers
    .map(
      (layer) => `
        <button
          class="layer"
          type="button"
          role="tab"
          id="layer-tab-${layer.id}"
          aria-controls="layer-detail"
          aria-selected="${layer.id === activeLayerId}"
          tabindex="${layer.id === activeLayerId ? '0' : '-1'}"
          data-layer="${layer.id}"
        >
          <span class="layer-code">${escapeHtml(layer.code)}</span>
          <span class="layer-copy">
            <span class="layer-name">${escapeHtml(tx(layer.name))}</span>
            <span class="layer-sub">${escapeHtml(tx(layer.subtitle))}</span>
          </span>
          ${icon('chevron-right', 'layer-arrow')}
        </button>
      `,
    )
    .join('');
}

function layerDetailMarkup() {
  const layer = layers.find((item) => item.id === activeLayerId) || layers[0];
  return `
    <div class="detail-inner">
      <div>
        <div class="detail-kicker">
          <span class="mono-label">${escapeHtml(t('architecture.detail.index'))} ${escapeHtml(
            layer.code,
          )} / ${escapeHtml(t('architecture.detail.role'))}</span>
          <span class="mono-label">${padNumber(layers.indexOf(layer) + 1)} / ${padNumber(layers.length)}</span>
        </div>
        <h3 class="detail-title">${escapeHtml(tx(layer.name))}</h3>
        <p class="detail-subtitle">${escapeHtml(tx(layer.subtitle))}</p>
        <p class="detail-description">${escapeHtml(tx(layer.description))}</p>
      </div>

      <div class="detail-block">
        <div class="detail-block-label">${escapeHtml(t('architecture.detail.responsibilities'))}</div>
        <ul class="responsibility-list">
          ${layer.responsibilities.map((item) => `<li>${escapeHtml(tx(item))}</li>`).join('')}
        </ul>
      </div>

      <div class="detail-block">
        <div class="detail-block-label">${escapeHtml(t('architecture.detail.rule'))}</div>
        <div class="dependency-rule">
          ${icon('git-branch')}
          <span>${escapeHtml(tx(layer.rule))}</span>
        </div>
      </div>

      <div class="detail-tech">
        ${layer.tech.map((tech) => `<span class="tech-chip">${escapeHtml(tech)}</span>`).join('')}
      </div>
    </div>
  `;
}

function renderLayers() {
  const list = document.getElementById('layer-list');
  const detail = document.getElementById('layer-detail');
  if (!list || !detail) return;
  list.innerHTML = layerListMarkup();
  detail.innerHTML = layerDetailMarkup();
  const layer = layers.find((item) => item.id === activeLayerId) || layers[0];
  detail.setAttribute('aria-labelledby', `layer-tab-${layer.id}`);
  refreshIcons(list);
  refreshIcons(detail);
}

function selectLayer(id, { focus = false } = {}) {
  if (!layers.some((layer) => layer.id === id)) return;
  activeLayerId = id;
  renderLayers();
  if (focus) {
    document.querySelector(`#layer-list [data-layer="${id}"]`)?.focus();
  }
}

function renderPrinciples() {
  const container = document.getElementById('principles');
  if (!container) return;
  const principles = t('architecture.principles');
  container.innerHTML = principles
    .map(
      (principle, index) => `
        <article class="principle">
          <span class="principle-number">${padNumber(index + 1)}</span>
          <h3 class="principle-title">${escapeHtml(principle.title)}</h3>
          <p class="principle-body">${escapeHtml(principle.body)}</p>
        </article>
      `,
    )
    .join('');
}

function renderMatrix() {
  const container = document.getElementById('capability-matrix');
  if (!container) return;
  const { platforms, rows } = portfolio.architecture.matrix;
  container.innerHTML = `
    <table class="capability-table">
      <caption class="sr-only">${escapeHtml(t('architecture.matrixLabel'))}</caption>
      <thead>
        <tr>
          <th scope="col">${escapeHtml(t('architecture.capability'))}</th>
          ${platforms.map((platform) => `<th scope="col">${escapeHtml(platform)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>
                <th scope="row">${escapeHtml(tx(row.capability))}</th>
                ${row.support
                  .map(
                    (supported, index) => `
                      <td>
                        <span class="m-label">${escapeHtml(platforms[index])}</span>
                        <span class="m-state" aria-hidden="true">${icon(
                          supported ? 'check' : 'minus',
                          supported ? 'matrix-yes' : 'matrix-no',
                        )}</span>
                        <span class="sr-only">${escapeHtml(
                          supported ? t('architecture.supported') : t('architecture.unsupported'),
                        )}</span>
                      </td>
                    `,
                  )
                  .join('')}
              </tr>
            `,
          )
          .join('')}
      </tbody>
    </table>
  `;
  refreshIcons(container);
}

function renderPipeline() {
  const container = document.getElementById('pipeline-track');
  if (!container) return;
  container.innerHTML = portfolio.architecture.pipeline
    .map(
      (step, index) => `
        <div class="pipeline-step">
          <span class="pipeline-code">${padNumber(index + 1)} / ${padNumber(
            portfolio.architecture.pipeline.length,
          )}</span>
          <div class="pipeline-name">${escapeHtml(tx(step.step))}</div>
          <p class="pipeline-note">${escapeHtml(tx(step.note))}</p>
        </div>
      `,
    )
    .join('');
}

export function initArchitecture() {
  const list = document.getElementById('layer-list');
  const detail = document.getElementById('layer-detail');
  if (!list || !detail) return;

  renderLayers();
  renderPrinciples();
  renderMatrix();
  renderPipeline();

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-layer]');
    if (button) selectLayer(button.dataset.layer);
  });

  list.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const buttons = Array.from(list.querySelectorAll('[data-layer]'));
    const currentIndex = layers.findIndex((layer) => layer.id === activeLayerId);
    let nextIndex = currentIndex;
    if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % layers.length;
    else if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + layers.length) % layers.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = layers.length - 1;
    event.preventDefault();
    selectLayer(layers[nextIndex].id, { focus: true });
    buttons[nextIndex]?.scrollIntoView({ block: 'nearest' });
  });

  detail.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    document.querySelector(`#layer-list [data-layer="${activeLayerId}"]`)?.focus();
  });

  document.addEventListener('languagechange', () => {
    renderLayers();
    renderPrinciples();
    renderMatrix();
    renderPipeline();
  });
}
