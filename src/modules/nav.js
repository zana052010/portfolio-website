import { setLang, t } from '../lib/i18n.js';
import { toggleTheme } from '../lib/theme.js';
import { lockScroll, unlockScroll } from '../lib/scroll-lock.js';

let menuOpen = false;
let menuLocked = false;

export function initNav() {
  const header = document.getElementById('site-header');
  const menu = document.getElementById('mobile-menu');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const langButtons = document.querySelectorAll('[data-lang-button]');
  const themeButton = document.querySelector('[data-theme-toggle]');
  const main = document.getElementById('main');
  const footer = document.getElementById('contact');
  const mq = window.matchMedia('(min-width: 961px)');

  if (!header || !menu || !menuToggle) return;

  function setPageInert(value) {
    if (main) main.inert = value;
    if (footer) footer.inert = value;
  }

  function closeMenu({ restoreFocus = false } = {}) {
    if (!menuOpen) return;
    menuOpen = false;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    menu.inert = true;
    header.classList.remove('is-menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', t('nav.menuOpen'));
    setPageInert(false);
    if (menuLocked) {
      unlockScroll();
      menuLocked = false;
    }
    if (restoreFocus) menuToggle.focus({ preventScroll: true });
  }

  function openMenu() {
    if (menuOpen) return;
    menuOpen = true;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    menu.inert = false;
    header.classList.add('is-menu-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', t('nav.menuClose'));
    setPageInert(true);
    if (!menuLocked) {
      lockScroll();
      menuLocked = true;
    }
  }

  menuToggle.addEventListener('click', () => {
    if (menuOpen) closeMenu({ restoreFocus: true });
    else openMenu();
  });

  menu.querySelectorAll('[data-mobile-nav]').forEach((link) => {
    link.addEventListener('click', () => closeMenu());
  });

  header.querySelector('.brand')?.addEventListener('click', () => closeMenu());

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-command-open]');
    if (!trigger) return;
    closeMenu();
    document.dispatchEvent(new CustomEvent('palette:open'));
  });

  langButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setLang(button.dataset.langButton);
    });
  });

  themeButton?.addEventListener('click', () => {
    toggleTheme();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuOpen) {
      closeMenu({ restoreFocus: true });
      return;
    }

    if (!menuOpen || event.key !== 'Tab') return;
    const focusables = [...header.querySelectorAll('a[href], button:not([disabled])'), ...menu.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )].filter((element) => element.getClientRects().length > 0 && !element.hidden);

    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  mq.addEventListener('change', (event) => {
    if (event.matches) closeMenu();
  });

  function updateHeaderState() {
    header.classList.toggle('is-scrolled', window.scrollY > 6);
  }

  let scrollFrame = 0;
  const sectionTargets = ['projects', 'architecture', 'stack', 'activity', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function updateActiveSection() {
    scrollFrame = 0;
    let activeId = null;
    for (const section of sectionTargets) {
      if (section.getBoundingClientRect().top <= 130) activeId = section.id;
    }

    document.querySelectorAll('[data-nav]').forEach((link) => {
      const isActive = link.dataset.nav === activeId;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  function onScroll() {
    updateHeaderState();
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateActiveSection);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateHeaderState();
  updateActiveSection();

  function applyAccessibleLabels() {
    themeButton?.setAttribute('aria-label', t('nav.themeToggle'));
    themeButton?.setAttribute('title', t('nav.themeToggle'));
    menuToggle.setAttribute('aria-label', menuOpen ? t('nav.menuClose') : t('nav.menuOpen'));
    menuToggle.setAttribute('title', menuOpen ? t('nav.menuClose') : t('nav.menuOpen'));
    const langGroup = document.querySelector('.lang-switch');
    langGroup?.setAttribute('aria-label', t('nav.language'));
    const commandTriggers = document.querySelectorAll('.command-trigger');
    commandTriggers.forEach((trigger) => trigger.setAttribute('aria-label', t('nav.openPalette')));
  }

  applyAccessibleLabels();
  document.addEventListener('languagechange', applyAccessibleLabels);

  // Palette and project dialog openers should not leave the drawer covering the page.
  document.addEventListener('palette:open', () => closeMenu());
  document.addEventListener('project:open', () => closeMenu());
}
