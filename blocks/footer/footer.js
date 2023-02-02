import { readBlockConfig, decorateIcons, decorateButtons } from '../../scripts/lib-franklin.js';

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`);
  const html = await resp.text();
  const footer = document.createElement('div');
  footer.innerHTML = html;
  await decorateIcons(footer);
  await decorateButtons(footer);
  block.append(footer);

  block.querySelector('a[href="bookmark://top"]').addEventListener('click', (ev) => {
    ev.preventDefault();
    document.body.scrollIntoView({ behavior: 'smooth' });
  });

  document.addEventListener('scroll', () => {
    const goToTop = block.querySelector('.button-container');
    if (window.scrollY > 510) {
      goToTop.style.display = 'block';
    } else if (window.scrollY < 460) {
      goToTop.style.display = 'none';
    }
  }, { passive: true });
}
