import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.innerHTML = row.innerHTML;
    if (!li.querySelector('ul')) {
      li.classList.add('has-overlay');
    }
    [...li.children].forEach((div) => {
      [...div.childNodes].forEach((el) => {
        li.append(el);
        div.remove();
      });
    });
    li.addEventListener('click', (ev) => {
      const parent = ev.target.closest('li');
      if (!parent.classList.contains('has-overlay')) {
        return;
      }
      parent.querySelector('a').click();
    });
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);
}
