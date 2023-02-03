import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
} from './lib-franklin.js';

const LCP_BLOCKS = ['columns']; // add your LCP blocks to the list
window.hlx.RUM_GENERATION = 'project-1'; // add your RUM generation information here

function buildHeroBlock(main) {
  const section = main.querySelector('div');
  const picture = section.querySelector('picture');
  const elements = [...section.children];
  if (section && picture) {
    section.append(buildBlock('hero', { elems: elements }));
  }
}

function buildArticle(main) {
  const columnContainer = document.createElement('div');
  const columnsWrapper = document.createElement('div');
  const colSection = document.createElement('div');
  const divContainer = document.createElement('div');

  colSection.append(divContainer);
  columnsWrapper.append(colSection);
  columnContainer.append(columnsWrapper);
  columnContainer.classList.add(['section'], ['columns-container']);
  columnsWrapper.classList.add('columns-wrapper');
  colSection.classList.add(['columns'], ['columns-2-cols']);

  const leftColumn = document.createElement('div');
  const rightColumn = document.createElement('div');

  const articleDate = main.querySelector('body.article div.default-content-wrapper > p:first-of-type');

  const hero = main.querySelector('div');
  hero.classList.remove('section');
  hero.classList.add('article-hero');
  rightColumn.append(hero);
  leftColumn.append(articleDate);

  divContainer.append(leftColumn);
  divContainer.append(rightColumn);

  const mainContent = main.querySelector('body.article div.section > div.default-content-wrapper');
  if (mainContent) {
    mainContent.classList.add('article-body');
    rightColumn.append(mainContent);
  }
  main.insertBefore(columnContainer, main.firstChild);
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

function decorateVideos(el) {
  el.querySelectorAll('picture + a[href*=".mp4"]').forEach((a) => {
    const div = document.createElement('div');
    const video = document.createElement('video');
    video.src = a.href;
    video.autoplay = true;
    video.loop = true;
    div.append(video);
    a.previousElementSibling.remove();
    a.replaceWith(div);
    video.load();
  });
}

function autoplayVideos(el) {
  document.body.click();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) {
        e.target.pause();
        return;
      }
      e.target.muted = true;
      e.target.play();
    });
  });
  el.querySelectorAll('video[autoplay]').forEach((v) => {
    observer.observe(v);
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  decorateVideos(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  if (document.body.classList.contains('article')) {
    buildArticle(main);
  }
}

/**
 * loads everything needed to get to LCP.
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

/**
 * loads everything that doesn't need to be delayed.
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);
  autoplayVideos(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  await loadHeader(doc.querySelector('header'));
  await loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.svg`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * loads everything that happens a lot later, without impacting
 * the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
