(function() {
  var EmojidexCategories, EmojidexData, EmojidexEmoji, EmojidexIndexes, EmojidexSearch, EmojidexUser, EmojidexUserFavorites, EmojidexUserHistory, EmojidexUtil,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.EmojidexClient = (function() {
    function EmojidexClient(options) {
      this.options = options;
      this.defaults = {
        locale: 'en',
        api_url: 'https://www.emojidex.com/api/v1/',
        cdn_url: 'http://cdn.emojidex.com/emoji',
        closed_net: false,
        min_query_len: 4,
        size_code: 'px32',
        detailed: false,
        limit: 32
      };
      this.options = $.extend({}, this.defaults, this.options);
      this.closed_net = this.options.closed_net;
      this.api_url = this.options.api_url;
      this.cdn_url = this.options.cdn_url;
      this.size_code = this.options.size_code;
      this.detailed = this.options.detailed;
      this.limit = this.options.limit;
      this.locale = this.options.locale;
      this.Data = new EmojidexData(this);
      this.Emoji = new EmojidexEmoji(this);
      this.Categories = new EmojidexCategories(this);
      this.User = new EmojidexUser(this);
      this.Indexes = new EmojidexIndexes(this);
      this.Util = new EmojidexUtil(this);
      this.Search = new EmojidexSearch(this);
    }

    return EmojidexClient;

  })();

  EmojidexCategories = (function() {
    function EmojidexCategories(EC) {
      var cat;
      this.EC = EC;
      this._categories = this.EC.Data.categories();
      cat = this.EC.Data.categories();
      if (cat === 0) {
        this.sync();
      }
    }

    EmojidexCategories.prototype.sync = function(callback, locale) {
      var _this = this;
      if (locale == null) {
        locale = this.EC.locale;
      }
      return $.ajax({
        url: this.EC.api_url + 'categories',
        dataType: 'json',
        data: {
          locale: locale
        },
        success: function(response) {
          _this._categories;
          return typeof callback === "function" ? callback(response.categories) : void 0;
        }
      });
    };

    EmojidexCategories.prototype.all = function() {
      return this._categories;
    };

    return EmojidexCategories;

  })();

  EmojidexData = (function() {
    function EmojidexData(EC) {
      this.EC = EC;
      this._def_auth_info = {
        status: 'none',
        user: '',
        token: null
      };
      this.storage = $.localStorage;
      if (!this.storage.isSet("emojidex")) {
        this.storage.set("emojidex", {});
      }
      if (!this.storage.isSet("emojidex.emoji")) {
        this.storage.set("emojidex.emoji", this.EC.options.emoji || []);
      }
      if (!this.storage.isSet("emojidex.history")) {
        this.storage.set("emojidex.history", this.EC.options.history || []);
      }
      if (!this.storage.isSet("emojidex.favorites")) {
        this.storage.set("emojidex.favorites", this.EC.options.favorites || []);
      }
      if (!this.storage.isSet("emojidex.auth_info")) {
        this.storage.set("emojidex.categories", this.EC.options.categories || []);
      }
      if (!this.storage.isSet("emojidex.auth_info")) {
        this.storage.set("emojidex.auth_info", this.EC.options.auth_info || this._def_auth_info);
      }
    }

    EmojidexData.prototype.emoji = function(emoji_set) {
      if (emoji_set != null) {
        this.storage.set("emojidex.emoji", emoji_set);
      }
      return this.storage.get("emojidex.emoji");
    };

    EmojidexData.prototype.favorites = function(favorites_set) {
      if (favorites_set != null) {
        this.storage.set("emojidex.favorites", favorites_set);
      }
      return this.storage.get("emojidex.favorites");
    };

    EmojidexData.prototype.history = function(history_set) {
      if (history_set != null) {
        this.storage.set("emojidex.history", history_set);
      }
      return this.storage.get("emojidex.history");
    };

    EmojidexData.prototype.categories = function(categories_set) {
      if (categories_set != null) {
        this.storage.set("emojidex.categories", categories_set);
      }
      return this.storage.get("emojidex.categories");
    };

    EmojidexData.prototype.auth_info = function(auth_info_set) {
      if (auth_info_set != null) {
        this.storage.set("emojidex.auth_info", auth_info_set);
      }
      return this.storage.get("emojidex.auth_info");
    };

    return EmojidexData;

  })();

  EmojidexEmoji = (function() {
    function EmojidexEmoji(EC) {
      this.EC = EC;
      this.combine = __bind(this.combine, this);
      this._emoji = this.EC.Data.emoji();
      this.util = new EmojidexUtil;
      if (this.EC.Data.emoji().length === 0) {
        this.seed();
      }
    }

    EmojidexEmoji.prototype.seed = function(locale) {
      if (locale == null) {
        locale = this.EC.locale;
      }
      switch (locale) {
        case 'en':
          this.EC.Indexes.user('emoji', this.combine);
          return this.EC.Indexes.user('emojidex', this.combine);
        case 'ja':
          this.EC.Indexes.user('絵文字', this.combine);
          return this.EC.Indexes.user('絵文字デックス', this.combine);
      }
    };

    EmojidexEmoji.prototype.all = function() {
      return this._emoji;
    };

    EmojidexEmoji.prototype.search = function(term, callback) {
      var moji, results;
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
      if (typeof callback === "function") {
        callback(results);
      }
      return results;
    };

    EmojidexEmoji.prototype.starting = function(term, callback) {
      var moji, results;
      results = (function() {
        var _i, _len, _ref, _results;
        _ref = this._emoji;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          moji = _ref[_i];
          if (moji.code.match('^' + term)) {
            _results.push(moji);
          }
        }
        return _results;
      }).call(this);
      if (typeof callback === "function") {
        callback(results);
      }
      return results;
    };

    EmojidexEmoji.prototype.ending = function(term, callback) {
      var moji, results;
      results = (function() {
        var _i, _len, _ref, _results;
        _ref = this._emoji;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          moji = _ref[_i];
          if (moji.code.match(term + '$')) {
            _results.push(moji);
          }
        }
        return _results;
      }).call(this);
      if (typeof callback === "function") {
        callback(results);
      }
      return results;
    };

    EmojidexEmoji.prototype.tags = function(tags, opts) {
      var collect, moji, selection, tag, _i, _len;
      tags = this.util.breakout(tags);
      selection = opts.selection || this._emoji;
      for (_i = 0, _len = tags.length; _i < _len; _i++) {
        tag = tags[_i];
        collect = (function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = selection.length; _j < _len1; _j++) {
            moji = selection[_j];
            if ($.inArray(tag, moji.tags) >= 0) {
              _results.push(moji);
            }
          }
          return _results;
        })();
      }
      return collect;
    };

    EmojidexEmoji.prototype.categories = function(categories, opts) {
      var category, collect, moji, source, _i, _len;
      categories = this.util.breakout(categories);
      source = opts.selection || this._emoji;
      collect = [];
      for (_i = 0, _len = categories.length; _i < _len; _i++) {
        category = categories[_i];
        collect.concat((function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = source.length; _j < _len1; _j++) {
            moji = source[_j];
            if (moji.category === category) {
              _results.push(moji);
            }
          }
          return _results;
        })());
      }
      return collect;
    };

    EmojidexEmoji.prototype.advanced = function(term, tags, categories) {
      return this.categories(categories, {
        selection: this.tags(tags, {
          selection: this.search(term)
        })
      });
    };

    EmojidexEmoji.prototype.combine = function(emoji) {
      return this._emoji = this.EC.Data.emoji($.extend(this._emoji, emoji));
    };

    EmojidexEmoji.prototype.flush = function() {
      return this._emoji = this.EC.Data.emoji([]);
    };

    return EmojidexEmoji;

  })();

  EmojidexIndexes = (function() {
    function EmojidexIndexes(EC) {
      this.EC = EC;
      this.results = [];
      this.cur_page = 1;
      this.cur_limit = this.EC.limit;
      this.count = 0;
    }

    EmojidexIndexes.prototype._getEmojiUseAjax_setNextAndPrev = function(query, callback, opts, func) {
      var default_params,
        _this = this;
      if (func != null) {
        this.next = function() {
          opts.page++;
          return func(callback, opts);
        };
        this.prev = function() {
          if (opts.page > 1) {
            opts.page--;
          }
          return func(callback, opts);
        };
      }
      default_params = {
        page: 1,
        limit: this.EC.limit,
        detailed: this.EC.detailed
      };
      return $.ajax({
        url: this.EC.api_url + query,
        dataType: 'json',
        data: $.extend({}, default_params, opts),
        success: function(response) {
          _this.results = response.emoji;
          _this.cur_page = response.meta.page;
          _this.count = response.meta.count;
          _this.EC.Emoji.combine(response.emoji);
          return typeof callback === "function" ? callback(response.emoji) : void 0;
        },
        error: function(response) {
          return _this.results = [];
        }
      });
    };

    EmojidexIndexes.prototype.index = function(callback, opts) {
      return this._getEmojiUseAjax_setNextAndPrev('emoji', callback, opts, this.index);
    };

    EmojidexIndexes.prototype.newest = function(callback, opts) {
      return this._getEmojiUseAjax_setNextAndPrev('newest', callback, opts, this.newest);
    };

    EmojidexIndexes.prototype.popular = function(callback, opts) {
      return this._getEmojiUseAjax_setNextAndPrev('popular', callback, opts, this.popular);
    };

    EmojidexIndexes.prototype.user = function(username, callback, opts) {
      return this._getEmojiUseAjax_setNextAndPrev("users/" + username + "/emoji", callback, opts);
    };

    return EmojidexIndexes;

  })();

  EmojidexSearch = (function() {
    function EmojidexSearch(EC) {
      this.EC = EC;
      this.Util = new EmojidexUtil;
      this.results = [];
      this.cur_page = 1;
      this.cur_limit = this.EC.limit;
      this.count = 0;
    }

    EmojidexSearch.prototype._getEmojiUseAjax_setNextAndPrev = function(query, callback, opts, func) {
      var default_params,
        _this = this;
      if (func != null) {
        this.next = function() {
          opts.page++;
          return func(callback, opts);
        };
        this.prev = function() {
          if (opts.page > 1) {
            opts.page--;
          }
          return func(callback, opts);
        };
      }
      default_params = {
        page: 1,
        limit: this.EC.limit,
        detailed: this.EC.detailed
      };
      return $.ajax({
        url: this.EC.api_url + query,
        dataType: 'json',
        data: $.extend({}, default_params, opts),
        success: function(response) {
          _this.results = response.emoji;
          _this.cur_page = response.meta.page;
          _this.count = response.meta.count;
          _this.EC.Emoji.combine(response.emoji);
          return typeof callback === "function" ? callback(response.emoji) : void 0;
        },
        error: function(response) {
          return _this.results = [];
        }
      });
    };

    EmojidexSearch.prototype.search = function(term, callback, opts) {
      var _this = this;
      this.next = function() {
        return this.search(term, callback, $.extend(opts, {
          page: opts.page + 1
        }));
      };
      if (!this.EC.closed_net) {
        opts = this._combine_opts(opts);
        opts = $.extend({}, {
          code_cont: this.EC.Util.escape_term(term)
        }, opts);
        return $.ajax({
          url: this.EC.api_url + 'search/emoji',
          dataType: 'json',
          data: opts,
          success: function(response) {
            return _this._succeed(response, callback);
          },
          error: function(response) {
            return _this.results = [];
          }
        });
      } else {
        return this.EC.Emoji.search(term, callback);
      }
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
      if (!this.EC.closed_net) {
        opts = this._combine_opts(opts);
        opts = $.extend({}, {
          code_sw: this.Util.escape_term(term)
        }, opts);
        return $.ajax({
          url: this.EC.api_url + 'search/emoji',
          dataType: 'json',
          data: opts,
          success: function(response) {
            return _this._succeed(response, callback);
          },
          error: function(response) {
            return _this.results = [];
          }
        });
      } else {
        return this.EC.Emoji.starting(term, callback);
      }
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
      if (!this.EC.closed_net) {
        opts = this._combine_opts(opts);
        opts = $.extend({}, {
          code_ew: this.Util.escape_term(term)
        }, opts);
        return $.ajax({
          url: this.EC.api_url + 'search/emoji',
          dataType: 'json',
          data: opts,
          success: function(response) {
            return _this._succeed(response, callback);
          },
          error: function(response) {
            return _this.results = [];
          }
        });
      } else {
        return this.EC.Emoji.ending(term, callback);
      }
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
      if (!this.EC.closed_net) {
        opts = this._combine_opts(opts);
        opts = $.extend({}, {
          "tags[]": this.Util.breakout(tags)
        }, opts);
        return $.ajax({
          url: this.EC.api_url + 'search/emoji',
          dataType: 'json',
          data: opts,
          success: function(response) {
            return _this._succeed(response, callback);
          },
          error: function(response) {
            return _this.results = [];
          }
        });
      } else {
        return this.EC.Emoji.tags(tags);
      }
    };

    EmojidexSearch.prototype.advanced = function(term, tags, categories, callback, opts) {
      var params,
        _this = this;
      this.next = function() {
        return this.advanced(term, tags, categories, callback, $.extend(opts, {
          page: opts.page + 1
        }));
      };
      if (!this.EC.closed_net) {
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
        opts = this._combine_opts(opts);
        opts = $.extend(params, opts);
        return $.ajax({
          url: this.EC.api_url + 'search/emoji',
          dataType: 'json',
          data: opts,
          success: function(response) {
            return _this._succeed(response, callback);
          },
          error: function(response) {
            return _this.results = [];
          }
        });
      } else {
        return this.EC.Emoji.advanced(term, tags, categories, callback);
      }
    };

    EmojidexSearch.prototype._combine_opts = function(opts) {
      return $.extend({}, {
        page: 1,
        limit: this.EC.limit,
        detailed: this.EC.detailed
      }, opts);
    };

    EmojidexSearch.prototype._succeed = function(response, callback) {
      this.results = response.emoji;
      this.cur_page = response.meta.page;
      this.count = response.meta.count;
      this.EC.Emoji.combine(response.emoji);
      if (callback != null) {
        return callback(response.emoji);
      }
    };

    return EmojidexSearch;

  })();

  EmojidexUser = (function() {
    function EmojidexUser(EC) {
      this.EC = EC;
      this.auth_info = this.EC.Data._def_auth_info;
      this.History = new EmojidexUserHistory(this.EC);
      this.Favorites = new EmojidexUserFavorites(this.EC);
      this._auto_login();
    }

    EmojidexUser.prototype._auto_login = function() {
      if (this.closed_net) {
        return;
      }
      this.auth_info = this.EC.Data.auth_info();
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
      return this.EC.Data.auth_info(this.EC.Data._def_auth_info);
    };

    EmojidexUser.prototype.plain_auth = function(username, password, callback) {
      var url,
        _this = this;
      if (callback == null) {
        callback = null;
      }
      url = this.EC.api_url + 'users/authenticate?' + $.param({
        username: username,
        password: password
      });
      return $.getJSON(url).error(function(response) {
        return _this.auth_info = _this.EC.Data.auth_info({
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

    EmojidexUser.prototype.set_auth = function(user, token) {
      this.auth_info = this.EC.Data.auth_info({
        status: 'verified',
        token: token,
        user: user
      });
      return this.sync_user_data();
    };

    EmojidexUser.prototype._set_auth_from_response = function(response) {
      this.auth_info = this.EC.Data.auth_info({
        status: response.auth_status,
        token: response.auth_token,
        user: response.auth_user
      });
      return this.sync_user_data();
    };

    EmojidexUser.prototype.sync_user_data = function() {
      this.History.token = this.Favorites.token = this.auth_info['token'];
      this.Favorites.sync();
      return this.History.sync();
    };

    return EmojidexUser;

  })();

  EmojidexUserFavorites = (function() {
    function EmojidexUserFavorites(EC, token) {
      this.EC = EC;
      if (token == null) {
        token = null;
      }
      this.token = token;
      this._favorites = this.EC.Data.favorites();
    }

    EmojidexUserFavorites.prototype.all = function() {
      return this._favorites;
    };

    EmojidexUserFavorites.prototype.get = function(callback) {
      var _this = this;
      if (this.token != null) {
        $.ajax({
          url: this.EC.api_url + 'users/favorites',
          dataType: 'json',
          data: {
            auth_token: this.token
          },
          success: function(response) {
            _this._favorites = _this.EC.Data.favorites(response);
            if (callback != null) {
              return callback(_this._favorites);
            }
          }
        });
        return true;
      }
      return false;
    };

    EmojidexUserFavorites.prototype.set = function(emoji_code) {
      var _this = this;
      if (this.token != null) {
        $.ajax({
          type: 'POST',
          url: this.EC.api_url + 'users/favorites',
          data: {
            auth_token: this.token,
            emoji_code: emoji_code
          },
          success: function(response) {
            _this._favorites.push(response);
            return _this.EC.Data.favorites(_this._favorites);
          }
        });
        return true;
      }
      return false;
    };

    EmojidexUserFavorites.prototype.unset = function(emoji_code) {
      var _this = this;
      if (this.token != null) {
        $.ajax({
          type: 'DELETE',
          url: this.EC.api_url + 'users/favorites',
          data: {
            auth_token: this.token,
            emoji_code: emoji_code
          },
          success: function(response) {
            return _this.sync();
          }
        });
        return true;
      }
      return false;
    };

    EmojidexUserFavorites.prototype.sync = function() {
      return this.get();
    };

    return EmojidexUserFavorites;

  })();

  EmojidexUserHistory = (function() {
    function EmojidexUserHistory(EC, token) {
      this.EC = EC;
      if (token == null) {
        token = null;
      }
      this.token = token;
      this._history = this.EC.Data.history();
    }

    EmojidexUserHistory.prototype.all = function() {
      return this._history;
    };

    EmojidexUserHistory.prototype.get = function(opts) {
      var _this = this;
      if (this.token != null) {
        $.getJSON(this.EC.api_url + 'users/history?' + $.param({
          auth_token: this.token
        })).success(function(response) {
          return _this._history = _this.EC.Data.history(response);
        });
        return true;
      }
      return false;
    };

    EmojidexUserHistory.prototype.set = function(emoji_code) {
      var _this = this;
      if (this.token != null) {
        $.ajax({
          type: 'POST',
          url: this.EC.api_url + 'users/history',
          data: {
            auth_token: this.token,
            emoji_code: emoji_code
          },
          success: function(response) {
            var entry, i, _i, _len, _ref;
            _ref = _this._history;
            for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
              entry = _ref[i];
              if (entry.emoji_code === response.emoji_code) {
                _this._history[i] = response;
                _this.EC.Data.history(_this._history);
                return response;
              }
            }
          }
        });
        return true;
      }
      return false;
    };

    EmojidexUserHistory.prototype.sync = function() {
      return this.get();
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
          code: this.escape_term(moji.code),
          img_url: "" + this.cdn_url + "/" + size_code + "/" + (this.escape_term(moji.code)) + ".png"
        });
      }
      return _results;
    };

    return EmojidexUtil;

  })();

}).call(this);
