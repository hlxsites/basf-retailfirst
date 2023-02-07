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
  getMetadata,
  loadBlock,
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

async function fetchIndex(indexURL) {
  try {
    const resp = await fetch(indexURL);
    const json = await resp.json();
    // eslint-disable-next-line no-console
    console.log(`${indexURL}: ${json.data.length}`);
    return json.data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(`error while fetching ${indexURL}`, e);
    return [];
  }
}

async function buildRecentArticlesBlock(main) {
  const ARTICLE_COUNT = 3;
  const template = getMetadata('template');
  if (template === 'article') {
    console.log('yes article');
    const indexURL = '/query-index.json';
    const index = await fetchIndex(indexURL);
    const shortIndex = index.filter((e) => (e.template === 'article' && e.lastModified && e.image && e.title));
    shortIndex.sort((e1, e2) => e1.lastModified -  e2.lastModified);
    let articles = [];
    const count = Math.min(ARTICLE_COUNT, shortIndex.length);
    for (let i = 0; i < count; i++) {
      articles.push(`<article>
        <a href=${shortIndex[i].path}>
          <img src='${shortIndex[i].image}'/>
          <p>${shortIndex[i].title}</p>
        </a>
      </article>`);
    }
    const block = buildBlock('recent-articles', [articles]);
    block.classList.add('block');
    block.setAttribute('data-block-name', 'recent-articles');
    main.append(block);
    loadBlock(block);
    console.log(shortIndex);
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // buildHeroBlock(main);
    buildRecentArticlesBlock(main);
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
