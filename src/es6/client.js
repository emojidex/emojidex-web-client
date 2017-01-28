// emojidex coffee client
// * Provides search, index caching and combining and asset URI resolution
//
// =LICENSE=
// Licensed under the emojidex Open License
// https://www.emojidex.com/emojidex/emojidex_open_license
//
// Copyright 2013 the emojidex project / K.K. GenSouSha

class EmojidexClient {
  constructor(options) {
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
      cdn_url: 'https://www.emojidex.com/emoji/',
      closed_net: false,
      min_query_len: 4,
      size_code: 'xhdpi',
      detailed: false,
      limit: 32,
      onReady: arg => ({})
    };

    this.options = $.extend({}, this.defaults, options);

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

    // new Emojidex modules
    this.Data = new EmojidexData(this, this.options).then(data => {
      this.Util = new EmojidexUtil(this);
      this.User = new EmojidexUser(this);
      this.Indexes = new EmojidexIndexes(this);
      this.Search = new EmojidexSearch(this);
      this.Emoji = new EmojidexEmoji(this);
      this.Categories = new EmojidexCategories(this);
    }

    ).then(() => {
      this.options.onReady(this);
    });
  }
};
