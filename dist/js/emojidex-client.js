/**
,* emojidex client - v0.13.8
,* * Provides search, index caching and combining and asset URI resolution
,* https://github.com/emojidex/emojidex-web-client
,*
,* =LICENSE=
,* Licensed under the emojidex Open License
,* https://www.emojidex.com/emojidex/emojidex_open_license
,*
,* Copyright 2013 the emojidex project / K.K. GenSouSha
,**/

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _data = require('../../src/es6/components/data');

var _data2 = _interopRequireDefault(_data);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// emojidex client aaa
// * Provides search, index caching and combining and asset URI resolution
//
// =LICENSE=
// Licensed under the emojidex Open License
// https://www.emojidex.com/emojidex/emojidex_open_license
//
// Copyright 2013 the emojidex project / K.K. GenSouSha

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

var EmojidexClient = function () {
  function EmojidexClient(options) {
    _classCallCheck(this, EmojidexClient);

    this.env = {
      api_ver: 1,
      cdn_addr: 'cdn.emojidex.com',
      s_cdn_addr: 'cdn.emojidex.com',
      asset_addr: 'assets.emojidex.com',
      s_asset_addr: ''
    };

    // sets global default value
    this.defaults = {
      locale: 'en',
      api_url: 'https://www.emojidex.com/api/v1/',
      cdn_url: 'https://cdn.emojidex.com/emoji/',
      closed_net: false,
      min_query_len: 4,
      size_code: 'xhdpi',
      detailed: false,
      limit: 32,
      onReady: function onReady(arg) {
        return {};
      }
    };

    this.options = _jquery2.default.extend({}, this.defaults, options);

    // set closed network flag (for OSS distrobutions, intranet/private neworks, or closed license)
    // DO NOT set to true unless permitted by an emojidex License
    this.closed_net = this.options.closed_net;

    // set end points
    this.api_url = this.options.api_url;
    this.cdn_url = this.options.cdn_url;
    this.size_code = this.options.size_code;

    // common @options
    this.detailed = this.options.detailed;
    this.limit = this.options.limit;
    this.locale = this.options.locale;
  }

  _createClass(EmojidexClient, [{
    key: 'init',
    value: function init() {
      // // // new Emojidex modules
      // this.Data = new EmojidexData(this, this.options).then(data => {
      //   this.Util = new EmojidexUtil(this);
      //   this.User = new EmojidexUser(this);
      //   this.Indexes = new EmojidexIndexes(this);
      //   this.Search = new EmojidexSearch(this);
      //   this.Emoji = new EmojidexEmoji(this);
      //   this.Categories = new EmojidexCategories(this);
      // }).then(() => {
      //   this.options.onReady(this);
      // });
      this.options.onReady(this);
    }
  }]);

  return EmojidexClient;
}();

exports.default = EmojidexClient;