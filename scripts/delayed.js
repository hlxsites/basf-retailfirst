// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

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
