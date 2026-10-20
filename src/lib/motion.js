import { prefersReducedMotion } from './utils.js';

let revealObserver;

export function initMotion() {
  document.documentElement.classList.add('js');

  if (prefersReducedMotion()) {
    document.querySelectorAll('[data-reveal]').forEach((element) => {
      element.classList.add('is-visible');
    });
  } else if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    );

    document.querySelectorAll('[data-reveal]').forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    document.querySelectorAll('[data-reveal]').forEach((element) => {
      element.classList.add('is-visible');
    });
  }

  initSpotlight();
}

function initSpotlight() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let frame = 0;
  let activePanel = null;
  let pointerX = 0;
  let pointerY = 0;

  document.addEventListener(
    'pointermove',
    (event) => {
      const panel = event.target.closest('.spotlight');
      if (!panel) return;
      activePanel = panel;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (!activePanel) return;
        const rect = activePanel.getBoundingClientRect();
        activePanel.style.setProperty('--mx', `${pointerX - rect.left}px`);
        activePanel.style.setProperty('--my', `${pointerY - rect.top}px`);
      });
    },
    { passive: true },
  );
}
