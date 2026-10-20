import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './style.css';

import portfolio from './data/portfolio-data.json';
import translations from './i18n/translations.json';
import githubFallback from './data/github-fallback.json';

import { initTheme } from './lib/theme.js';
import { initI18n } from './lib/i18n.js';
import { refreshIcons } from './lib/icons.js';
import { initMotion } from './lib/motion.js';
import { initNav } from './modules/nav.js';
import { initHero } from './modules/hero.js';
import { initProjects } from './modules/projects.js';
import { initArchitecture } from './modules/architecture.js';
import { initStack } from './modules/stack.js';
import { initGithub } from './modules/github.js';
import { initFooter } from './modules/footer.js';
import { initPalette } from './modules/palette.js';

function injectStructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: portfolio.profile.name,
    alternateName: portfolio.profile.moniker,
    url: portfolio.profile.github,
    sameAs: [portfolio.profile.github],
    jobTitle: portfolio.profile.role.en,
    description: portfolio.profile.philosophy.en,
    knowsAbout: portfolio.tech.map((technology) => technology.name),
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.append(script);
}

initTheme();
initI18n(translations);

initNav();
initHero();
initProjects();
initArchitecture();
initStack();
initGithub(githubFallback);
initFooter();
initPalette();

injectStructuredData();
initMotion();
refreshIcons(document);
