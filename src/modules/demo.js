import { escapeHtml, icon, prefersReducedMotion } from '../lib/utils.js';
import { t } from '../lib/i18n.js';
import { refreshIcons } from '../lib/icons.js';

const GAIN_MIN = -12;
const GAIN_MAX = 12;

function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function eqBandMarkup(index, frequency) {
  return `
    <div class="eq-band">
      <span class="eq-value" data-eq-value="${index}">0</span>
      <div
        class="eq-control"
        role="slider"
        tabindex="0"
        aria-label="${escapeHtml(frequency)} Hz"
        aria-orientation="vertical"
        aria-valuemin="${GAIN_MIN}"
        aria-valuemax="${GAIN_MAX}"
        aria-valuenow="0"
        data-eq-band="${index}"
        style="--level: 0.5; --fill-top: 50%; --fill-height: 0%;"
      >
        <span class="eq-center" aria-hidden="true"></span>
        <span class="eq-fill" aria-hidden="true"></span>
        <span class="eq-thumb" aria-hidden="true"></span>
      </div>
      <span class="eq-frequency">${escapeHtml(frequency)}</span>
    </div>
  `;
}

export function demoMarkup(featureId) {
  const bands = t('projects.demo.bands');
  const lyricLines = t('projects.demo.lyricsLines');
  const initialMobile = window.innerWidth < 640;
  const initialPlaying = !prefersReducedMotion();
  const initialModeLabel = t('projects.demo.engine');

  return `
    <div class="demo-shell" data-demo data-mode="engine">
      <div class="demo-topbar">
        <span class="demo-brand">
          ${icon('audio-waveform')}
          <span class="demo-brand-text">AURALIS / ${escapeHtml(initialModeLabel)}</span>
        </span>
        <div class="demo-device-switch" role="group" aria-label="${escapeHtml(t('projects.demo.deviceAria'))}">
          <button
            class="demo-device-btn"
            type="button"
            data-device-select="desktop"
            aria-pressed="true"
            aria-label="${escapeHtml(t('projects.demo.desktop'))}"
          >
            ${icon('monitor')}
            <span class="demo-device-label">${escapeHtml(t('projects.demo.desktop'))}</span>
          </button>
          <button
            class="demo-device-btn"
            type="button"
            data-device-select="mobile"
            aria-pressed="false"
            aria-label="${escapeHtml(t('projects.demo.mobile'))}"
          >
            ${icon('smartphone')}
            <span class="demo-device-label">${escapeHtml(t('projects.demo.mobile'))}</span>
          </button>
        </div>
      </div>

      <div class="demo-stage">
        <div class="demo-device${initialPlaying ? ' is-playing' : ''}" data-device="${initialMobile ? 'mobile' : 'desktop'}">
          <div class="demo-app">
            <aside class="demo-sidebar" aria-hidden="true">
              <span class="demo-side-logo">a</span>
              <span class="demo-side-btn is-active">${icon('disc-3')}</span>
              <span class="demo-side-btn">${icon('search')}</span>
              <span class="demo-side-btn">${icon('list-music')}</span>
              <span class="demo-side-btn">${icon('settings-2')}</span>
            </aside>

            <div class="demo-main">
              <div class="demo-track-row">
                <div class="demo-cover" aria-hidden="true"></div>
                <div class="demo-track-copy">
                  <div class="demo-track-kicker">${escapeHtml(t('projects.demo.nowPlaying'))}</div>
                  <div class="demo-track-title">${escapeHtml(t('projects.demo.trackTitle'))}</div>
                  <div class="demo-track-artist">${escapeHtml(t('projects.demo.trackArtist'))}</div>
                </div>
                <span class="demo-format">${escapeHtml(t('projects.demo.format'))}</span>
              </div>

              <canvas class="spectrum-canvas" data-spectrum aria-hidden="true"></canvas>

              <div class="demo-pane" data-pane="engine">
                <div class="demo-pane-label">
                  <span>${escapeHtml(t('projects.demo.signalPath'))}</span>
                  <span>01</span>
                </div>
                <div class="signal-chain">
                  <div class="signal-step">
                    <span class="signal-key">${escapeHtml(t('projects.demo.chain.source'))}</span>
                    <span class="signal-value">${escapeHtml(t('projects.demo.sourceValue'))}</span>
                  </div>
                  <div class="signal-step">
                    <span class="signal-key">${escapeHtml(t('projects.demo.chain.decode'))}</span>
                    <span class="signal-value">${escapeHtml(t('projects.demo.decodeValue'))}</span>
                  </div>
                  <div class="signal-step">
                    <span class="signal-key">${escapeHtml(t('projects.demo.chain.mix'))}</span>
                    <span class="signal-value">${escapeHtml(t('projects.demo.mixValue'))}</span>
                  </div>
                  <div class="signal-step">
                    <span class="signal-key">${escapeHtml(t('projects.demo.chain.output'))}</span>
                    <span class="signal-value">${escapeHtml(t('projects.demo.outputValue'))}</span>
                  </div>
                </div>
                <div class="demo-format-row">
                  <span class="demo-format-label">${escapeHtml(t('projects.demo.formats'))}</span>
                  ${['FLAC', 'MP3', 'WAV', 'OGG']
                    .map((format) => `<span class="demo-mini-chip">${format}</span>`)
                    .join('')}
                </div>
              </div>

              <div class="demo-pane" data-pane="spectrum" hidden>
                <div class="demo-pane-label">
                  <span>${escapeHtml(t('projects.demo.eqLabel'))}</span>
                  <span>02</span>
                </div>
                <div class="eq-bank">
                  ${bands.map((frequency, index) => eqBandMarkup(index, frequency)).join('')}
                </div>
                <div class="eq-foot">
                  <span class="eq-hint">${escapeHtml(t('projects.demo.eqHint'))}</span>
                  <div class="eq-presets" role="group" aria-label="${escapeHtml(t('projects.demo.presets'))}">
                    <button class="eq-preset is-active" type="button" data-eq-preset="flat" aria-pressed="true">${escapeHtml(
                      t('projects.demo.flat'),
                    )}</button>
                    <button class="eq-preset" type="button" data-eq-preset="warm" aria-pressed="false">${escapeHtml(
                      t('projects.demo.warm'),
                    )}</button>
                    <button class="eq-preset" type="button" data-eq-preset="bright" aria-pressed="false">${escapeHtml(
                      t('projects.demo.bright'),
                    )}</button>
                  </div>
                </div>
              </div>

              <div class="demo-pane" data-pane="lyrics" hidden>
                <div class="demo-pane-label">
                  <span>${escapeHtml(t('projects.demo.lyricsLabel'))}</span>
                  <span>03</span>
                </div>
                <div class="lyrics-list">
                  ${lyricLines
                    .map(
                      (line, index) =>
                        `<span class="lyric-line${index === 1 ? ' is-active' : ''}" data-lyric="${index}">${escapeHtml(
                          line,
                        )}</span>`,
                    )
                    .join('')}
                </div>
                <div class="lyrics-meta">
                  ${icon('captions')}
                  <span>${escapeHtml(t('projects.demo.lyricsMeta'))}</span>
                </div>
              </div>

              <div class="demo-pane" data-pane="ux" hidden>
                <div class="demo-pane-label">
                  <span>${escapeHtml(t('projects.demo.layoutLabel'))}</span>
                  <span>04</span>
                </div>
                <div class="layout-notes">
                  <div class="layout-card${initialMobile ? '' : ' is-current'}" data-layout-card="desktop">
                    <div class="layout-card-title">${icon('monitor')}<span>${escapeHtml(
                      t('projects.demo.desktop'),
                    )}</span></div>
                    <ul>
                      ${t('projects.demo.desktopNotes')
                        .map((note) => `<li>${escapeHtml(note)}</li>`)
                        .join('')}
                    </ul>
                  </div>
                  <div class="layout-card${initialMobile ? ' is-current' : ''}" data-layout-card="mobile">
                    <div class="layout-card-title">${icon('smartphone')}<span>${escapeHtml(
                      t('projects.demo.mobile'),
                    )}</span></div>
                    <ul>
                      ${t('projects.demo.mobileNotes')
                        .map((note) => `<li>${escapeHtml(note)}</li>`)
                        .join('')}
                    </ul>
                  </div>
                </div>
                <div class="layout-note">${escapeHtml(t('projects.demo.layoutNote'))}</div>
              </div>

              <div class="demo-transport">
                <button
                  class="demo-play"
                  type="button"
                  data-demo-play
                  aria-label="${escapeHtml(
                    initialPlaying ? t('projects.demo.pause') : t('projects.demo.play'),
                  )}"
                >
                  ${icon(initialPlaying ? 'pause' : 'play')}
                </button>
                <div class="demo-progress-wrap">
                  <span class="demo-time" data-demo-elapsed>01:24</span>
                  <div class="demo-progress" aria-hidden="true">
                    <span class="demo-progress-fill" data-demo-progress></span>
                  </div>
                  <span class="demo-time">03:42</span>
                </div>
                <span class="demo-volume" aria-hidden="true">
                  ${icon('volume-2')}
                  <span class="demo-volume-bars"><span></span><span></span><span></span></span>
                </span>
              </div>
            </div>

            <div class="demo-bottomnav" aria-hidden="true">
              <span class="is-active">${icon('disc-3')}<span>${escapeHtml(t('projects.demo.engine'))}</span></span>
              <span>${icon('search')}<span>${escapeHtml(t('projects.demo.spectrumLabel'))}</span></span>
              <span>${icon('captions')}<span>${escapeHtml(t('projects.demo.lyricsLabel'))}</span></span>
              <span>${icon('list-music')}<span>${escapeHtml(t('projects.demo.layoutLabel'))}</span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="demo-caption">
        <span><span class="mini-dot"></span>${escapeHtml(t('projects.demo.kicker'))}</span>
        <span>${escapeHtml(t('projects.demo.footerNote'))}</span>
      </div>
    </div>
  `;
}

export function mountDemo(root, { featureId = 'engine', featureLabel = '' } = {}) {
  const shell = root;
  if (!shell) return { setFeature() {}, destroy() {} };

  const controller = new AbortController();
  const { signal } = controller;
  const deviceFrame = shell.querySelector('.demo-device');
  const deviceButtons = shell.querySelectorAll('[data-device-select]');
  const playButton = shell.querySelector('[data-demo-play]');
  const canvas = shell.querySelector('[data-spectrum]');
  const progressFill = shell.querySelector('[data-demo-progress]');
  const elapsedLabel = shell.querySelector('[data-demo-elapsed]');
  const lyricLines = shell.querySelectorAll('[data-lyric]');
  const layoutCards = shell.querySelectorAll('[data-layout-card]');
  const eqControls = shell.querySelectorAll('[data-eq-band]');
  const presetButtons = shell.querySelectorAll('[data-eq-preset]');
  const panes = shell.querySelectorAll('[data-pane]');
  const brandText = shell.querySelector('.demo-brand-text');

  const context = canvas?.getContext('2d');
  const prefersReduced = prefersReducedMotion();
  const state = {
    feature: featureId,
    device: deviceFrame?.dataset.device || 'desktop',
    playing: !prefersReduced,
    elapsed: 84,
    duration: 222,
    gains: [0, 0, 0, 0, 0],
    activePreset: 'flat',
    visible: true,
    frame: 0,
    lastTimestamp: 0,
    lastSecond: -1,
    pausedAt: 0,
  };

  let barValues = [];
  let barCount = 0;
  let textColor = '#fafafa';

  function readColors() {
    const styles = getComputedStyle(document.documentElement);
    textColor = styles.getPropertyValue('--text').trim() || '#fafafa';
  }

  function updatePlayButton() {
    if (!playButton) return;
    playButton.innerHTML = icon(state.playing ? 'pause' : 'play');
    playButton.setAttribute(
      'aria-label',
      state.playing ? t('projects.demo.pause') : t('projects.demo.play'),
    );
    deviceFrame?.classList.toggle('is-playing', state.playing);
    refreshIcons(playButton);
  }

  function updateTime() {
    if (elapsedLabel) elapsedLabel.textContent = formatTime(state.elapsed);
    if (progressFill) {
      progressFill.style.width = `${Math.min(100, (state.elapsed / state.duration) * 100)}%`;
    }

    const ratio = state.elapsed / state.duration;
    const thresholds = [0, 0.28, 0.5, 0.72];
    let activeLine = 0;
    thresholds.forEach((threshold, index) => {
      if (ratio >= threshold) activeLine = index;
    });
    lyricLines.forEach((line, index) => {
      line.classList.toggle('is-active', index === activeLine);
    });
    state.lastSecond = Math.floor(state.elapsed);
  }

  function updateEqVisual(index) {
    const control = eqControls[index];
    const gain = state.gains[index];
    if (!control) return;
    const value = control.querySelector('.eq-value');
    if (value) value.textContent = gain > 0 ? `+${gain}` : String(gain);
    const level = (gain - GAIN_MIN) / (GAIN_MAX - GAIN_MIN);
    const fillTop = Math.min(level, 0.5) * 100;
    const fillHeight = Math.abs(level - 0.5) * 100;
    control.style.setProperty('--level', String(level));
    control.style.setProperty('--fill-top', `${fillTop}%`);
    control.style.setProperty('--fill-height', `${fillHeight}%`);
    control.setAttribute('aria-valuenow', String(gain));
    control.setAttribute('aria-valuetext', `${gain > 0 ? '+' : ''}${gain} dB`);
  }

  function setGain(index, gain) {
    const clamped = Math.max(GAIN_MIN, Math.min(GAIN_MAX, Math.round(gain)));
    state.gains[index] = clamped;
    state.activePreset = null;
    presetButtons.forEach((button) => {
      button.classList.remove('is-active');
      button.setAttribute('aria-pressed', 'false');
    });
    updateEqVisual(index);
    ensureLoop();
  }

  function applyPreset(name) {
    const presets = {
      flat: [0, 0, 0, 0, 0],
      warm: [4, 2, 0, 1, 2],
      bright: [-1, 0, 1, 3, 4],
    };
    const values = presets[name];
    if (!values) return;
    state.gains = [...values];
    state.activePreset = name;
    presetButtons.forEach((button) => {
      const active = button.dataset.eqPreset === name;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    eqControls.forEach((control, index) => updateEqVisual(index));
    ensureLoop();
  }

  function setDevice(device) {
    if (!deviceFrame) return;
    state.device = device;
    deviceFrame.dataset.device = device;
    deviceButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.deviceSelect === device));
    });
    layoutCards.forEach((card) => {
      card.classList.toggle('is-current', card.dataset.layoutCard === device);
    });
    window.requestAnimationFrame(() => {
      resizeCanvas();
      drawSpectrum(performance.now(), true);
    });
  }

  function setFeature(nextFeature, label = '') {
    state.feature = nextFeature;
    shell.dataset.mode = nextFeature;
    panes.forEach((pane) => {
      pane.hidden = pane.dataset.pane !== nextFeature;
    });
    if (brandText && label) {
      brandText.textContent = `AURALIS / ${label}`;
    }
    ensureLoop();
  }

  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      context?.setTransform(dpr, 0, 0, dpr, 0, 0);
      barCount = 0;
    }
  }

  function drawSpectrum(timestamp, force = false) {
    if (!canvas || !context) return;
    resizeCanvas();
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    const gap = width < 260 ? 2 : width < 420 ? 3 : 4;
    const count = Math.max(18, Math.floor(width / 9));
    if (barCount !== count) {
      barCount = count;
      barValues = new Array(count).fill(0.06);
    }

    context.clearRect(0, 0, width, height);
    const step = width / count;
    const barWidth = Math.max(2, step - gap);
    const time = timestamp / 1000;

    for (let i = 0; i < count; i += 1) {
      const ratio = i / count;
      const bandIndex = Math.min(4, Math.floor(ratio * 5));
      const gainFactor = 1 + state.gains[bandIndex] / 16;
      let target = 0.04;
      if (state.playing) {
        const envelope = 0.7 + 0.3 * Math.sin(Math.PI * ratio);
        const oscillation =
          0.11 +
          0.54 * Math.abs(Math.sin(i * 0.47 + time * 1.18)) *
            (0.58 + 0.42 * Math.abs(Math.sin(i * 0.16 - time * 0.63)));
        target = Math.min(1, Math.max(0.06, oscillation * envelope * gainFactor));
      }
      barValues[i] += (target - barValues[i]) * 0.16;
      const value = barValues[i];
      const barHeight = Math.max(1, value * height);
      context.globalAlpha = 0.26 + value * 0.74;
      context.fillStyle = textColor;
      context.fillRect(i * step, height - barHeight, barWidth, barHeight);
    }
    context.globalAlpha = 1;
  }

  function isSettled() {
    return barValues.length > 0 && barValues.every((value) => value < 0.07);
  }

  function stopLoop() {
    if (state.frame) cancelAnimationFrame(state.frame);
    state.frame = 0;
  }

  function ensureLoop() {
    if (!state.visible || document.hidden) return;
    if (state.frame) return;
    state.lastTimestamp = 0;
    state.frame = requestAnimationFrame(tick);
  }

  function tick(timestamp) {
    state.frame = 0;
    if (!state.visible || document.hidden) return;
    if (!state.lastTimestamp) state.lastTimestamp = timestamp;
    const delta = Math.min(0.1, (timestamp - state.lastTimestamp) / 1000);
    state.lastTimestamp = timestamp;

    if (state.playing) {
      state.elapsed += delta;
      if (state.elapsed >= state.duration) state.elapsed = 0;
      if (Math.floor(state.elapsed) !== state.lastSecond) updateTime();
    }

    drawSpectrum(timestamp);

    if (!state.playing && isSettled() && timestamp - state.pausedAt > 420) {
      drawSpectrum(timestamp, true);
      return;
    }

    state.frame = requestAnimationFrame(tick);
  }

  function setPlaying(playing) {
    state.playing = playing;
    updatePlayButton();
    if (playing) {
      state.lastTimestamp = 0;
      ensureLoop();
    } else {
      state.pausedAt = performance.now();
      ensureLoop();
    }
  }

  playButton?.addEventListener(
    'click',
    () => {
      setPlaying(!state.playing);
    },
    { signal },
  );

  deviceButtons.forEach((button) => {
    button.addEventListener(
      'click',
      () => {
        setDevice(button.dataset.deviceSelect);
      },
      { signal },
    );
  });

  eqControls.forEach((control, index) => {
    let dragging = false;
    const updateFromPointer = (event) => {
      const rect = control.getBoundingClientRect();
      const ratio = 1 - (event.clientY - rect.top) / rect.height;
      const gain = GAIN_MIN + Math.max(0, Math.min(1, ratio)) * (GAIN_MAX - GAIN_MIN);
      setGain(index, gain);
    };

    control.addEventListener(
      'pointerdown',
      (event) => {
        event.preventDefault();
        dragging = true;
        control.setPointerCapture(event.pointerId);
        updateFromPointer(event);
      },
      { signal },
    );

    control.addEventListener(
      'pointermove',
      (event) => {
        if (!dragging) return;
        updateFromPointer(event);
      },
      { signal },
    );

    control.addEventListener(
      'pointerup',
      () => {
        dragging = false;
      },
      { signal },
    );

    control.addEventListener(
      'pointercancel',
      () => {
        dragging = false;
      },
      { signal },
    );

    control.addEventListener(
      'keydown',
      (event) => {
        let next = state.gains[index];
        if (event.key === 'ArrowUp' || event.key === 'ArrowRight') next += 1;
        else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') next -= 1;
        else if (event.key === 'PageUp') next += 3;
        else if (event.key === 'PageDown') next -= 3;
        else if (event.key === 'Home') next = GAIN_MIN;
        else if (event.key === 'End') next = GAIN_MAX;
        else return;
        event.preventDefault();
        setGain(index, next);
      },
      { signal },
    );
  });

  presetButtons.forEach((button) => {
    button.addEventListener(
      'click',
      () => {
        applyPreset(button.dataset.eqPreset);
      },
      { signal },
    );
  });

  const resizeObserver =
    'ResizeObserver' in window && canvas
      ? new ResizeObserver(() => {
          resizeCanvas();
          drawSpectrum(performance.now(), true);
        })
      : null;
  resizeObserver?.observe(shell);

  const intersectionObserver =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) => {
            const entry = entries[0];
            state.visible = entry.isIntersecting;
            if (state.visible) ensureLoop();
            else stopLoop();
          },
          { threshold: 0.05 },
        )
      : null;
  intersectionObserver?.observe(shell);

  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) {
        stopLoop();
      } else {
        ensureLoop();
      }
    },
    { signal },
  );

  document.addEventListener(
    'themechange',
    () => {
      readColors();
      drawSpectrum(performance.now(), true);
    },
    { signal },
  );

  readColors();
  eqControls.forEach((control, index) => updateEqVisual(index));
  updatePlayButton();
  updateTime();
  setDevice(state.device);
  setFeature(featureId, featureLabel);
  resizeCanvas();
  drawSpectrum(performance.now(), true);
  if (state.playing) ensureLoop();

  return {
    setFeature,
    setDevice,
    destroy() {
      controller.abort();
      stopLoop();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
    },
  };
}
