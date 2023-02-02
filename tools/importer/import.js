
const createMetadataBlock = (main, document) => {
    const meta = {};

    // find the <title> element
    const title = document.querySelector('title');
    if (title) {
      meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
    }

    // find the <meta property="og:description"> element
    const desc = document.querySelector('[property="og:description"]');
    if (desc) {
      meta.Description = desc.content;
    }

    // find the <meta property="og:image"> element
    const img = document.querySelector('[property="og:image"]');
    if (img) {
      // create an <img> element
      const el = document.createElement('img');
      el.src = img.content;
      meta.Image = el;
    }

    meta.feature = 'false';

    // helper to create the metadata block
    const block = WebImporter.Blocks.getMetadataBlock(document, meta);

    // append the block to the main element
    main.append(block);

    // returning the meta object might be usefull to other rules
    return meta;
  };

  export default {
    transformDOM: ({ document }) => {
      const main = document.querySelector('body');

      createMetadataBlock(main, document);
      // final cleanup
      WebImporter.DOMUtils.remove(main, [
        'header', 'footer', '#av_section_2', '#after_section_2', '#footer', 'a.avia-post-nav', '#scroll-top-link',
      ]);

      return main;
    },
    generateDocumentPath: ({ document, url, html, params }) => {
       return new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '');
    },
  };
