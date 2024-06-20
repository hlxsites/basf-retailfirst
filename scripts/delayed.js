// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';

async function loadTagManager() {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.innerHTML = `
        (function (a, b, c, d){
            a = 'https://tags.tiqcdn.com/utag/basf/us-crop/prod/utag.js';
            b=document;c='script';d=b.createElement(c);d.src=a;d.type='text/java'+c;d.async=true;
            a=b.getElementsByTagName(c)[0];a.parentNode.insertBefore(d,a);
        })
    ();
    `;
  document.body.prepend(script);
}

// Core Web Vitals RUM collection
sampleRUM('cwv');
await loadTagManager();

// add more delayed functionality here
function loadUTag() {
  const jquery = document.createElement('script');
  jquery.src = 'https://code.jquery.com/jquery-3.6.3.min.js';
  jquery.async = true;
  document.head.appendChild(jquery);
  const utag = document.createElement('script');
  utag.src = 'https://tags.tiqcdn.com/utag/basf/us-crop/prod/utag.js';
  utag.async = true;
  jquery.onload = () => document.head.appendChild(utag);
}

loadUTag();
