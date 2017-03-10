if (!global._babelPolyfill) {
  require('babel-polyfill');
}

import $ from 'jquery';
window.$ = $;

import EmojidexClient from './client'
window.EmojidexClient = EmojidexClient;
