import portfolio from '../data/portfolio-data.json';
import { getLang, tx } from '../lib/i18n.js';

export function initFooter() {
  const role = document.getElementById('footer-role');
  const clock = document.getElementById('local-clock');
  const year = document.getElementById('current-year');

  function renderRole() {
    if (role) role.textContent = tx(portfolio.profile.role);
  }

  function renderClock() {
    if (!clock) return;
    const formatter = new Intl.DateTimeFormat(getLang(), {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    clock.textContent = formatter.format(new Date());
  }

  if (year) year.textContent = String(new Date().getFullYear());
  renderRole();
  renderClock();
  const timer = window.setInterval(renderClock, 1000);

  document.addEventListener('languagechange', () => {
    renderRole();
    renderClock();
  });

  window.addEventListener('pagehide', () => {
    window.clearInterval(timer);
  });
}
