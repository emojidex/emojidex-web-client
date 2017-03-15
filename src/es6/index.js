import $ from 'jquery';
import EmojidexClient from './client'
if (!global._babelPolyfill) {
  require('babel-polyfill');
}

window.$ = $;
window.EmojidexClient = EmojidexClient;
