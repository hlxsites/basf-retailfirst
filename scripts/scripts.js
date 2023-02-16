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
window.hlx.RUM_GENERATION = 'basf-retailfirst'; // add your RUM generation information here

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

async function fetchIndex(indexURL) {
  try {
    const resp = await fetch(indexURL);
    const json = await resp.json();
    // eslint-disable-next-line no-console
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
    const indexURL = '/query-index.json';
    const index = await fetchIndex(indexURL);
    const shortIndex = index.filter((e) => (e.template === 'article' && e.lastModified && e.image && e.title));
    shortIndex.sort((e1, e2) => e1.lastModified - e2.lastModified);
    const articles = [];
    const count = Math.min(ARTICLE_COUNT, shortIndex.length);
    for (let i = 0; i < count; i += 1) {
      articles.push(`<article>
        <a href=${shortIndex[i].path}>
          <img src='${shortIndex[i].image}'/>
          <p>${shortIndex[i].title}</p>
        </a>
      </article>`);
    }
    const block = buildBlock('recent-articles', [['<h1>Other features this month</h1>'], articles]);
    block.classList.add('block');
    block.setAttribute('data-block-name', 'recent-articles');
    main.append(block);
    loadBlock(block);
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
// eslint-disable-next-line no-unused-vars
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

function handlePost(response, message) {
  if (!response.ok) {
    message.innerText = 'Invitation Failed. Try Again.';
  } else {
    message.innerText = 'Invitation Successful!';
  }
}

function submitInvite(event) {
  // validate fields
  let valid = 0;
  const messageDiv = event.target.parentNode.parentNode.querySelector('.row.message');
  const name = event.target.parentNode.parentNode.querySelector('.row > input[id=name]').value;
  const email = event.target.parentNode.parentNode.querySelector('.row > input[id=email]').value;
  const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  if (name === '') {
    messageDiv.innerText = 'Name is required';
    valid += 1;
  }
  if (!email.match(validRegex)) {
    messageDiv.innerText = 'Valid email is required';
    valid += 1;
  }
  if (valid === 0) {
    fetch('/invite-form', {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          name,
          email,
        },
      }),
    }).then((response) => handlePost(response, messageDiv));
  }
}

function hideModal(event) {
  if (event.target.matches('.invite-modal') || event.target.matches('.close-invite')) {
    const modal = document.querySelector('.invite-modal');
    modal.style.display = 'none';
    modal.removeEventListener('click', hideModal);
  }
}

function showModal() {
  const modal = document.querySelector('.invite-modal');
  modal.style.display = 'block';
  modal.addEventListener('click', (event) => {
    hideModal(event);
  });
  modal.querySelector('.row > input[type=button]').addEventListener('click', submitInvite);
  modal.querySelector('div > .close-invite').addEventListener('click', (event) => {
    hideModal(event);
  });
}

function makeInviteModal() {
  const modal = document.querySelector("[title='Share with a friend or colleague.']");
  if (modal) {
    modal.addEventListener('click', () => {
      showModal();
    });
    // eslint-disable-next-line no-script-url
    modal.href = 'javascript:void(0);';
  }
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
      e.target.play().catch((error) => console.error('unable to play videos', error));
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
  makeInviteModal(main);

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
