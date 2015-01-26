(function() {
  var EmojidexCategories, EmojidexData, EmojidexEmoji, EmojidexIndexes, EmojidexSearch, EmojidexShared, EmojidexUtil, Test;

  this.EmojidexClient = (function() {
    function EmojidexClient(opts) {
      if (opts == null) {
        opts = {};
      }
      this.Util = new EmojidexUtil;
      this.S = new EmojidexShared(opts);
      this.Data = this.S.Data;
      this.Emoji = this.S.Emoji;
      this.Categories = this.S.Categories;
      this.Search = new EmojidexSearch(this.S);
    }

    return EmojidexClient;

  })();

  EmojidexCategories = (function() {
    function EmojidexCategories(shared, opts) {
      if (shared == null) {
        shared = null;
      }
      this.S = shared || new EmojidexShared;
      this._categories = this.S.Data.categories();
      if (this.S.Data.categories().length === 0) {
        this.sync();
      }
    }

    EmojidexCategories.prototype.sync = function(callback, locale) {
      var _this = this;
      if (callback == null) {
        callback = null;
      }
      if (locale == null) {
        locale = null;
      }
      if (!locale) {
        locale = this.S.locale;
      }
      return $.getJSON(this.S.api_url + 'categories?' + $.param({
        locale: locale
      })).success(function(response) {
        _this._categories = _this.S.Data.categories(response.categories);
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

  EmojidexEmoji = (function() {
    function EmojidexEmoji(shared, data, opts) {
      if (shared == null) {
        shared = null;
      }
      if (data == null) {
        data = null;
      }
      this.S = shared || new EmojidexShared;
      this.Data = data || new EmojidexData;
      this._emoji = this.Data.emoji();
      if (this.Data.emoji().length === 0) {
        this.seed();
      }
    }

    EmojidexEmoji.prototype.seed = function(callback, locale) {
      if (callback == null) {
        callback = null;
      }
      if (locale === null) {
        locale = this.S.locale;
      }
      switch (locale) {
        case 'en':
          this.S.Index.user('emoji', this.combine);
          return this.S.Index.user('emojidex', this.combine);
        case 'ja':
          this.S.Index.user('絵文字', this.combine);
          return this.S.Index.user('絵文字デックス', this.combine);
      }
    };

    EmojidexEmoji.prototype.all = function() {
      return this._emoji;
    };

    EmojidexEmoji.prototype.search = function(term, callback) {
      var moji, results;
      if (callback == null) {
        callback = null;
      }
      results = (function() {
        var _i, _len, _ref, _results;
        _ref = this._emoji;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          moji = _ref[_i];
          if (this._emoji.code.match('.*' + term + '.*/i')) {
            _results.push(moji);
          }
        }
        return _results;
      }).call(this);
      if (callback) {
        callback(results);
      }
      return results;
    };

    EmojidexEmoji.prototype.combine = function(emoji) {
      this._emoji = $.extend(this._emoji, emoji);
      return this.Data.emoji(this._emoji);
    };

    return EmojidexEmoji;

  })();

  EmojidexIndexes = (function() {
    function EmojidexIndexes(shared, opts) {
      if (shared == null) {
        shared = null;
      }
      this.S = shared || new EmojidexShared;
    }

    EmojidexIndexes.prototype.user = function(username, callback, opts) {
      var _this = this;
      if (callback == null) {
        callback = null;
      }
      opts = this._combine_opts(opts);
      return $.getJSON(this.api_url + 'users/' + username + '/emoji?' + $.param(opts)).error(function(response) {
        return _this.results = [];
      }).success(function(response) {
        return _this._succeed(response, callback);
      });
    };

    EmojidexIndexes.prototype._combine_opts = function(opts) {
      return $.extend({}, {
        page: 1,
        limit: this.S.limit,
        detailed: this.S.detailed
      }, opts);
    };

    EmojidexIndexes.prototype._succeed = function(response, callback) {
      this.results = response.emoji;
      this.cur_page = response.meta.page;
      this.count = response.meta.count;
      this.S.Emoji.combine(response.emoji);
      if (callback) {
        return callback(response.emoji);
      }
    };

    return EmojidexIndexes;

  })();

  EmojidexSearch = (function() {
    function EmojidexSearch(shared, data) {
      this.S = shared || new EmojidexShared;
      this.Data = data || new EmojidexData;
      this.Util = new EmojidexUtil;
      this.results = [];
      this.next = function() {
        return null;
      };
    }

    EmojidexSearch.prototype.search = function(term, callback, opts) {
      var _this = this;
      if (callback == null) {
        callback = null;
      }
      this.next = function() {
        return this.search(term, callback, $.extend(opts, {
          page: opts.page + 1
        }));
      };
      opts = this._combine_opts(opts);
      if (term.length >= this.min_query_len && !this.closed_net) {
        $.getJSON(this.S.api_url + 'search/emoji?' + $.param($.extend({}, {
          code_cont: this.Util.escape_term(term)
        }, opts))).error(function(response) {
          return _this.results = [];
        }).success(function(response) {
          return _this._succeed(response, callback);
        });
      } else {
        this.S.Emoji.search(term, callback);
      }
      return this.S.Emoji.search(term);
    };

    EmojidexSearch.prototype.starting = function(term, callback, opts) {
      var _this = this;
      if (callback == null) {
        callback = null;
      }
      this.next = function() {
        return this.starting(term, callback, $.extend(opts, {
          page: opts.page + 1
        }));
      };
      opts = this._combine_opts(opts);
      return $.getJSON(this.S.api_url + 'search/emoji?' + $.param($.extend({}, {
        code_sw: this.Util.escape_term(term)
      }, opts))).error(function(response) {
        return _this.results = [];
      }).success(function(response) {
        return _this._succeed(response, callback);
      });
    };

    EmojidexSearch.prototype.ending = function(term, callback, opts) {
      var _this = this;
      if (callback == null) {
        callback = null;
      }
      this.next = function() {
        return this.ending(term, callback, $.extend(opts, {
          page: opts.page + 1
        }));
      };
      opts = this._combine_opts(opts);
      return $.getJSON(this.S.api_url + 'search/emoji?' + $.param($.extend({}, {
        code_ew: this.Util.escape_term(term)
      }, opts))).error(function(response) {
        return _this.results = [];
      }).success(function(response) {
        return _this._succeed(response, callback);
      });
    };

    EmojidexSearch.prototype.tags = function(tags, callback, opts) {
      var _this = this;
      if (callback == null) {
        callback = null;
      }
      this.next = function() {
        return this.tags(term, callback, $.extend(opts, {
          page: opts.page + 1
        }));
      };
      opts = this._combine_opts(opts);
      return $.getJSON(this.S.api_url + 'search/emoji?' + $.param($.extend({}, {
        "tags[]": this.Util.breakout(tags)
      }, opts))).error(function(response) {
        return _this.results = [];
      }).success(function(response) {
        return _this._succeed(response, callback);
      });
    };

    EmojidexSearch.prototype.advanced = function(term, tags, categories, callback, opts) {
      var params,
        _this = this;
      if (tags == null) {
        tags = [];
      }
      if (categories == null) {
        categories = [];
      }
      if (callback == null) {
        callback = null;
      }
      this.next = function() {
        return this.advanced(term, tags, categories, callback, $.extend(opts, {
          page: opts.page + 1
        }));
      };
      opts = this._combine_opts(opts);
      params = {
        code_cont: this.Util.escape_term(term)
      };
      if (tags.length > 0) {
        params = $.extend(params, {
          "tags[]": this.Util.breakout(tags)
        });
      }
      if (categories.length > 0) {
        params = $.extend(params, {
          "categories[]": this.Util.breakout(categories)
        });
      }
      return $.getJSON(this.S.api_url + 'search/emoji?' + $.param($.extend(params, opts))).error(function(response) {
        return _this.results = [];
      }).success(function(response) {
        return _this._succeed(response, callback);
      });
    };

    EmojidexSearch.prototype._combine_opts = function(opts) {
      return $.extend({}, {
        page: 1,
        limit: this.S.limit,
        detailed: this.S.detailed
      }, opts);
    };

    EmojidexSearch.prototype._succeed = function(response, callback) {
      this.results = response.emoji;
      this.cur_page = response.meta.page;
      this.count = response.meta.count;
      this.S.Emoji.combine(response.emoji);
      if (callback) {
        return callback(response.emoji);
      }
    };

    return EmojidexSearch;

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
      this.locale = opts.locale;
      this.Data = new EmojidexData(this);
      this.Emoji = new EmojidexEmoji(this);
      this.Categories = new EmojidexCategories(this);
      this.Indexes = new EmojidexIndexes(this);
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

    EmojidexUtil.prototype.simplify = function(emoji, size_code) {
      var moji, _i, _len, _results;
      if (emoji == null) {
        emoji = this.results;
      }
      if (size_code == null) {
        size_code = this.size_code;
      }
      _results = [];
      for (_i = 0, _len = emoji.length; _i < _len; _i++) {
        moji = emoji[_i];
        _results.push({
          code: this.Util.escape_term(moji.code),
          img_url: "" + this.cdn_url + "/" + size_code + "/" + (this.Util.escape_term(moji.code)) + ".png"
        });
      }
      return _results;
    };

    return EmojidexUtil;

  })();

}).call(this);
