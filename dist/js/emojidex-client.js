/*
 *  emojidex client - v0.2.0
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
  var EmojidexCategories, EmojidexData, EmojidexEmoji, EmojidexIndexes, EmojidexSearch, EmojidexShared, EmojidexUser, EmojidexUserFavorites, EmojidexUserHistory, EmojidexUtil, Test,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

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
      this.Indexes = this.S.Indexes;
      this.User = this.S.User;
      this.Search = new EmojidexSearch(this.S);
    }

    return EmojidexClient;

  })();

  EmojidexCategories = (function() {
    function EmojidexCategories(shared) {
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
      if (!this.storage.isSet("emojidex.auth_info")) {
        this.storage.set("emojidex.auth_info", opts.auth_info || this._def_auth_info());
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

    EmojidexData.prototype._def_auth_info = function() {
      return {
        status: 'none',
        user: '',
        token: null
      };
    };

    EmojidexData.prototype.auth_info = function(auth_info_set) {
      if (auth_info_set == null) {
        auth_info_set = null;
      }
      if (auth_info_set !== null) {
        this.storage.set("emojidex.auth_info", auth_info_set);
      }
      return this.storage.get("emojidex.auth_info");
    };

    return EmojidexData;

  })();

  EmojidexEmoji = (function() {
    function EmojidexEmoji(shared) {
      if (shared == null) {
        shared = null;
      }
      this.combine = __bind(this.combine, this);
      this.S = shared || new EmojidexShared;
      this._emoji = this.S.Data.emoji();
      if (this.S.Data.emoji().length === 0) {
        this.seed();
      }
    }

    EmojidexEmoji.prototype.seed = function(locale) {
      if (locale === null) {
        locale = this.S.locale;
      }
      switch (locale) {
        case 'en':
          this.S.Indexes.user('emoji', this.combine);
          return this.S.Indexes.user('emojidex', this.combine);
        case 'ja':
          this.S.Indexes.user('絵文字', this.combine);
          return this.S.Indexes.user('絵文字デックス', this.combine);
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
          if (moji.code.match(term)) {
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

    EmojidexEmoji.prototype.starting = function(term, callback) {
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
          if (moji.code.match(term)) {
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
      return this._emoji = this.S.Data.emoji($.extend(this._emoji, emoji));
    };

    EmojidexEmoji.prototype.flush = function() {
      return this._emoji = this.S.Data.emoji([]);
    };

    return EmojidexEmoji;

  })();

  EmojidexIndexes = (function() {
    function EmojidexIndexes(shared, opts) {
      if (shared == null) {
        shared = null;
      }
      this.S = shared || new EmojidexShared;
      this.results = [];
      this.cur_page = 1;
      this.cur_limit = this.S.limit;
      this.count = 0;
    }

    EmojidexIndexes.prototype.index = function(callback, opts) {
      var _this = this;
      if (callback == null) {
        callback = null;
      }
      this.next = function() {
        return this.get_index(callback, $.extend(opts, {
          page: opts.page + 1
        }));
      };
      opts = this._combine_opts(opts);
      return $.getJSON(this.S.api_url + '/emoji?' + $.param(opts)).error(function(response) {
        return _this.results = [];
      }).success(function(response) {
        return _this._succeed(response, callback);
      });
    };

    EmojidexIndexes.prototype.newest = function(callback, opts) {
      var _this = this;
      if (callback == null) {
        callback = null;
      }
      this.next = function() {
        return this.get_newest(callback, $.extend(opts, {
          page: opts.page + 1
        }));
      };
      opts = this._combine_opts(opts);
      return $.getJSON(this.S.api_url + '/newest?' + $.param(opts)).error(function(response) {
        return _this.results = [];
      }).success(function(response) {
        return _this._succeed(response, callback);
      });
    };

    EmojidexIndexes.prototype.popular = function(callback, opts) {
      var _this = this;
      if (callback == null) {
        callback = null;
      }
      this.next = function() {
        return this.get_popular(callback, $.extend(opts, {
          page: opts.page + 1
        }));
      };
      opts = this._combine_opts(opts);
      return $.getJSON(this.S.api_url + '/popular?' + $.param(opts)).error(function(response) {
        return _this.results = [];
      }).success(function(response) {
        return _this._succeed(response, callback);
      });
    };

    EmojidexIndexes.prototype.user = function(username, callback, opts) {
      var _this = this;
      if (callback == null) {
        callback = null;
      }
      opts = this._combine_opts(opts);
      return $.getJSON(this.S.api_url + 'users/' + username + '/emoji?' + $.param(opts)).error(function(response) {
        return _this.results = [];
      }).success(function(response) {
        return _this._succeed(response, callback);
      });
    };

    EmojidexIndexes.prototype._combine_opts = function(opts) {
      return $.extend({
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
    function EmojidexSearch(shared) {
      this.S = shared || new EmojidexShared;
      this.Util = new EmojidexUtil;
      this.results = [];
      this.cur_page = 1;
      this.cur_limit = this.S.limit;
      this.count = 0;
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
      if (!this.S.closed_net) {
        opts = this._combine_opts(opts);
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
      if (!this.S.closed_net) {
        opts = this._combine_opts(opts);
        $.getJSON(this.S.api_url + 'search/emoji?' + $.param($.extend({}, {
          code_sw: this.Util.escape_term(term)
        }, opts))).error(function(response) {
          return _this.results = [];
        }).success(function(response) {
          return _this._succeed(response, callback);
        });
      } else {
        this.S.Emoji.starting(term, callback);
      }
      return this.S.Emoji.starting(term);
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
      this.Data = new EmojidexData(this, opts);
      this.Emoji = new EmojidexEmoji(this);
      this.Categories = new EmojidexCategories(this);
      this.User = new EmojidexUser(this);
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

  EmojidexUser = (function() {
    function EmojidexUser(shared, opts) {
      if (shared == null) {
        shared = null;
      }
      this.S = shared || new EmojidexShared;
      this.auth_info = this.S.Data._def_auth_info();
      this.History = new EmojidexUserHistory(this.S);
      this.Favorites = new EmojidexUserFavorites(this.S);
      this._auto_login();
    }

    EmojidexUser.prototype._auto_login = function() {
      if (this.closed_net) {
        return;
      }
      this.auth_info = this.S.Data.auth_info();
      if (this.auth_info['token'] !== null) {
        return this.sync_user_data();
      } else {
        return this.logout();
      }
    };

    EmojidexUser.prototype.login = function(params) {
      switch (params.authtype) {
        case 'plain':
          return this.plain_auth(params.username, params.password, params.callback);
        case 'basic':
          return this.basic_auth(params.user, params.pass, params.callback);
        case 'google':
          return this.google_auth(params.callback);
        default:
          return this._auto_login();
      }
    };

    EmojidexUser.prototype.logout = function() {
      return this.S.Data.auth_info(this.S.Data._def_auth_info());
    };

    EmojidexUser.prototype.plain_auth = function(username, password, callback) {
      var url,
        _this = this;
      if (callback == null) {
        callback = null;
      }
      url = this.S.api_url + 'users/authenticate?' + $.param({
        username: username,
        password: password
      });
      return $.getJSON(url).error(function(response) {
        return _this.auth_info = _this.S.Data.auth_info({
          status: response.auth_status,
          token: null,
          user: ''
        });
      }).success(function(response) {
        _this._set_auth_from_response(response);
        if (callback) {
          return callback(_this.auth_info);
        }
      });
    };

    EmojidexUser.prototype.basic_auth = function(user, pass, callback) {
      if (callback == null) {
        callback = null;
      }
      return false;
    };

    EmojidexUser.prototype.google_auth = function(callback) {
      if (callback == null) {
        callback = null;
      }
      return false;
    };

    EmojidexUser.prototype._set_auth_from_response = function(response) {
      this.auth_info = this.S.Data.auth_info({
        status: response.auth_status,
        token: response.auth_token,
        user: response.auth_user
      });
      this.History.token = this.Favorites.token = this.auth_info['token'];
      return this.sync_user_data();
    };

    EmojidexUser.prototype.sync_user_data = function() {
      this.Favorites.sync();
      return this.History.sync();
    };

    return EmojidexUser;

  })();

  EmojidexUserFavorites = (function() {
    function EmojidexUserFavorites(shared, token) {
      if (shared == null) {
        shared = null;
      }
      if (token == null) {
        token = null;
      }
      this.S = shared || new EmojidexShared;
      this.token = token;
    }

    EmojidexUserFavorites.prototype.get = function() {
      if (this.token != null) {
        return $.ajax({
          url: this.S.api_url + 'users/favorites',
          data: {
            auth_token: this.token
          },
          success: function(response) {
            return this.favorites = response;
          },
          error: function(response) {
            return this.favorites = [];
          }
        });
      }
    };

    EmojidexUserFavorites.prototype.set = function(emoji_code) {
      if (this.token != null) {
        return $.ajax({
          type: 'POST',
          url: this.S.api_url + 'users/favorites',
          data: {
            auth_token: this.token,
            emoji_code: emoji_code
          },
          success: function(response) {}
        });
      }
    };

    EmojidexUserFavorites.prototype.unset = function(emoji_code) {
      if (this.token != null) {
        return $.ajax({
          type: 'DELETE',
          url: this.S.api_url + 'users/favorites',
          data: {
            auth_token: this.token,
            emoji_code: emoji_code
          },
          success: function(response) {}
        });
      }
    };

    EmojidexUserFavorites.prototype.sync = function() {
      var _this = this;
      if (this.token != null) {
        return $.getJSON(this.S.api_url + 'users/history?' + $.param({
          auth_token: this.token
        })).success(function(response) {
          var local, remote;
          remote = response.emoji;
          return local = _this.S.Data.history();
        });
      }
    };

    return EmojidexUserFavorites;

  })();

  EmojidexUserHistory = (function() {
    function EmojidexUserHistory(shared, token) {
      if (shared == null) {
        shared = null;
      }
      if (token == null) {
        token = null;
      }
      this.S = shared || new EmojidexShared;
      this.token = token;
    }

    EmojidexUserHistory.prototype.get = function(opts) {
      var _this = this;
      if (this.token != null) {
        return $.getJSON(this.S.api_url + 'users/history?' + $.param({
          auth_token: this.token
        })).error(function(response) {
          return _this.history = [];
        }).success(function(response) {
          return _this.history = response;
        });
      }
    };

    EmojidexUserHistory.prototype.set = function(emoji_code) {
      if (this.token != null) {
        return $.post(this.S.api_url + 'users/history?' + $.param({
          auth_token: this.token,
          emoji_code: emoji_code
        }));
      }
    };

    EmojidexUserHistory.prototype.sync = function() {
      var _this = this;
      if (this.token != null) {
        return $.getJSON(this.S.api_url + 'users/history?' + $.param({
          auth_token: this.token
        })).success(function(response) {
          var local, remote;
          remote = response.emoji;
          return local = _this.S.Data.history();
        });
      }
    };

    return EmojidexUserHistory;

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
