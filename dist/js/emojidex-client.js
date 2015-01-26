/*
 *  emojidex client - v0.1.0
 *  * Provides search, index caching and combining and asset URI resolution
 *  https://github.com/emojidex/emojidex-web-client
 *
 *  =LICENSE=
 *  Licensed under the emojidex Open License
 *  https://www.emojidex.com/emojidex/emojidex_open_license
 *
 *  Copyright 2013 Genshin Souzou Kabushiki Kaisha
 */
(function() {
  var EmojidexCategories, EmojidexData, EmojidexShared, EmojidexUtil, Test;

  this.EmojidexClient = (function() {
    function EmojidexClient(opts) {
      if (opts == null) {
        opts = {};
      }
      this.Util = new EmojidexUtil;
      this.Data = new EmojidexData(opts);
      this.S = new EmojidexShared(this.Data, opts);
      this.Categories = new EmojidexCategories(this.Data, opts);
      this.next = function() {
        return null;
      };
    }

    return EmojidexClient;

  })();

  EmojidexCategories = (function() {
    function EmojidexCategories(shared, data, opts) {
      this.S = shared || new EmojidexShared;
      this.Data = data || new EmojidexData;
      this._categories = this.Data.categories();
      if (this.Data.categories().length === 0) {
        this.sync(null, opts.locale || 'en');
      }
    }

    EmojidexCategories.prototype.sync = function(callback, locale) {
      var _this = this;
      if (callback == null) {
        callback = null;
      }
      return $.getJSON(this.S.api_url + 'categories?' + $.param({
        locale: locale
      })).success(function(response) {
        _this._categories = _this.Data.categories(response.categories);
        if (callback) {
          return callback(response.categories);
        }
      });
    };

    EmojidexCategories.prototype.all = function() {
      return this._categories;
    };

    return EmojidexCategories;

  })();

  EmojidexData = (function() {
    function EmojidexData(opts) {
      this.storage = $.localStorage;
      if (!this.storage.isSet("emojidex")) {
        this.storage.set("emojidex", {});
      }
      if (!this.storage.isSet("emojidex.emoji")) {
        this.storage.set("emojidex.emoji", opts.emoji || []);
      }
      if (!this.storage.isSet("emojidex.history")) {
        this.storage.set("emojidex.history", opts.history || []);
      }
      if (!this.storage.isSet("emojidex.favorites")) {
        this.storage.set("emojidex.favorites", opts.favorites || []);
      }
    }

    EmojidexData.prototype.emoji = function(emoji_set) {
      if (emoji_set == null) {
        emoji_set = null;
      }
      if (emoji_set !== null) {
        this.storage.set("emojidex.emoji", emoji_set);
      }
      return this.storage.get("emojidex.emoji");
    };

    EmojidexData.prototype.favorites = function(favorites_set) {
      if (favorites_set == null) {
        favorites_set = null;
      }
      if (favorites_set !== null) {
        this.storage.set("emojidex.favorites", favorites_set);
      }
      return this.storage.get("emojidex.favorites");
    };

    EmojidexData.prototype.history = function(history_set) {
      if (history_set == null) {
        history_set = null;
      }
      if (history_set !== null) {
        this.storage.set("emojidex.history", history_set);
      }
      return this.storage.get("emojidex.history");
    };

    EmojidexData.prototype.categories = function(categories_set) {
      if (categories_set == null) {
        categories_set = null;
      }
      if (categories_set !== null) {
        this.storage.set("emojidex.categories", categories_set);
      }
      return this.storage.get("emojidex.categories");
    };

    return EmojidexData;

  })();

  EmojidexShared = (function() {
    EmojidexShared.prototype.defaults = function() {
      return {
        locale: 'en',
        api_url: 'https://www.emojidex.com/api/v1/',
        cdn_url: 'http://cdn.emojidex.com/emoji',
        closed_net: false,
        min_query_len: 4,
        size_code: 'px32',
        detailed: false,
        limit: 32
      };
    };

    function EmojidexShared(opts) {
      opts = $.extend({}, this.defaults(), opts);
      this.closed_net = opts.closed_net;
      this.api_url = opts.api_url;
      this.cdn_url = opts.cdn_url;
      this.size_code = opts.size_code;
      this.detailed = opts.detailed;
      this.limit = opts.limit;
    }

    return EmojidexShared;

  })();

  Test = (function() {
    function Test() {
      console.log("Test Class");
    }

    Test.prototype.log = function(log) {
      return console.log(log);
    };

    return Test;

  })();

  EmojidexUtil = (function() {
    function EmojidexUtil() {}

    EmojidexUtil.prototype.escape_term = function(term) {
      return term.split(' ').join('_');
    };

    EmojidexUtil.prototype.de_escape_term = function(term) {
      return term.split('_').join(' ');
    };

    EmojidexUtil.prototype.breakout = function(items) {
      if (items === null) {
        return [];
      }
      if (!(items instanceof Array)) {
        items = [items];
      }
      return items;
    };

    return EmojidexUtil;

  })();

}).call(this);
