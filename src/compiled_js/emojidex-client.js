(function() {
  var Test;

  this.EmojidexClient = (function() {
    function EmojidexClient(opts) {
      if (opts == null) {
        opts = {};
      }
      this._init_base_opts(opts);
      this._auto_login();
      this.next = function() {
        return null;
      };
    }

    EmojidexClient.prototype._init_base_opts = function(opts) {
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
      opts = $.extend({}, this.defaults, opts);
      this.closed_net = opts.closed_net;
      this.api_url = opts.api_url;
      this.cdn_url = opts.cdn_url;
      this.size_code = opts.size_code;
      this.detailed = opts.detailed;
      this.limit = opts.limit;
      this._init_storages(opts);
      this.results = opts.results || [];
      this.cur_page = opts.page || 1;
      this.cur_limit = this.limit;
      return this.count = opts.count || 0;
    };

    EmojidexClient.prototype._init_storages = function(opts) {
      this.storage = $.localStorage;
      if (!this.storage.isSet("emojidex")) {
        this.storage.set("emojidex", {});
      }
      if (!this.storage.isSet("emojidex.emoji")) {
        this.storage.set("emojidex.emoji", opts.emoji || []);
      }
      this.emoji = this.storage.get("emojidex.emoji");
      if (!this.storage.isSet("emojidex.history")) {
        this.storage.set("emojidex.history", opts.history || []);
      }
      this.history = this.storage.get("emojidex.history");
      if (!this.storage.isSet("emojidex.favorites")) {
        this.storage.set("emojidex.favorites", opts.favorites || []);
      }
      this.favorites = this.storage.get("emojidex.favorites");
      if (!this.storage.isSet("emojidex.categories")) {
        this.storage.set("emojidex.categories", opts.categories || []);
      }
      this.categories = this.storage.get("emojidex.categories");
      return this._pre_cache(opts);
    };

    EmojidexClient.prototype._pre_cache = function(opts) {
      if (this.emoji.length === 0) {
        switch (opts.locale) {
          case 'en':
            this.user_emoji('emoji');
            this.user_emoji('emojidex');
            break;
          case 'ja':
            this.user_emoji('絵文字');
            this.user_emoji('絵文字デックス');
        }
      }
      if (this.categories.length === 0) {
        return this.get_categories(null, {
          locale: opts.locale
        });
      }
    };

    EmojidexClient.prototype._auto_login = function() {
      if (this.closed_net) {
        return;
      }
      if (this.storage.get("emojidex.auth_token") != null) {
        this.auth_status = this.storage.get("emojidex.auth_status");
        this.auth_token = this.storage.get("emojidex.auth_token");
        this.user = this.storage.get("emojidex.user");
        return this.get_user_data();
      } else {
        return this.logout();
      }
    };

    EmojidexClient.prototype.search = function(term, callback, opts) {
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
      if (term.length >= this.defaults.min_query_len && !this.closed_net) {
        $.getJSON(this.api_url + 'search/emoji?' + $.param($.extend({}, {
          code_cont: this._escape_term(term)
        }, opts))).error(function(response) {
          return _this.results = [];
        }).success(function(response) {
          return _this._succeed(response, callback);
        });
      } else {
        this.local_search(term, callback);
      }
      return this.local_search(term);
    };

    EmojidexClient.prototype.local_search = function(term, callback) {
      var moji, res;
      if (callback == null) {
        callback = null;
      }
      res = (function() {
        var _i, _len, _ref, _results;
        _ref = this.emoji;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          moji = _ref[_i];
          if (this.emoji.code.match('.*' + term + '.*/i')) {
            _results.push(moji);
          }
        }
        return _results;
      }).call(this);
      if (callback) {
        return callback(res);
      }
    };

    EmojidexClient.prototype.search_sw = function(term, callback, opts) {
      var _this = this;
      if (callback == null) {
        callback = null;
      }
      this.next = function() {
        return this.search_sw(term, callback, $.extend(opts, {
          page: opts.page + 1
        }));
      };
      opts = this._combine_opts(opts);
      return $.getJSON(this.api_url + 'search/emoji?' + $.param($.extend({}, {
        code_sw: this._escape_term(term)
      }, opts))).error(function(response) {
        return _this.results = [];
      }).success(function(response) {
        return _this._succeed(response, callback);
      });
    };

    EmojidexClient.prototype.search_ew = function(term, callback, opts) {
      var _this = this;
      if (callback == null) {
        callback = null;
      }
      this.next = function() {
        return this.search_ew(term, callback, $.extend(opts, {
          page: opts.page + 1
        }));
      };
      opts = this._combine_opts(opts);
      return $.getJSON(this.api_url + 'search/emoji?' + $.param($.extend({}, {
        code_ew: this._escape_term(term)
      }, opts))).error(function(response) {
        return _this.results = [];
      }).success(function(response) {
        return _this._succeed(response, callback);
      });
    };

    EmojidexClient.prototype.tag_search = function(tags, callback, opts) {
      var _this = this;
      if (callback == null) {
        callback = null;
      }
      this.next = function() {
        return this.tag_search(term, callback, $.extend(opts, {
          page: opts.page + 1
        }));
      };
      opts = this._combine_opts(opts);
      return $.getJSON(this.api_url + 'search/emoji?' + $.param($.extend({}, {
        "tags[]": this._breakout(tags)
      }, opts))).error(function(response) {
        return _this.results = [];
      }).success(function(response) {
        return _this._succeed(response, callback);
      });
    };

    EmojidexClient.prototype.advanced_search = function(term, tags, categories, callback, opts) {
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
        return this.advanced_search(term, tags, categories, callback, $.extend(opts, {
          page: opts.page + 1
        }));
      };
      opts = this._combine_opts(opts);
      params = {
        code_cont: this._escape_term(term)
      };
      if (tags.length > 0) {
        params = $.extend(params, {
          "tags[]": this._breakout(tags)
        });
      }
      if (categories.length > 0) {
        params = $.extend(params, {
          "categories[]": this._breakout(categories)
        });
      }
      return $.getJSON(this.api_url + 'search/emoji?' + $.param($.extend(params, opts))).error(function(response) {
        return _this.results = [];
      }).success(function(response) {
        return _this._succeed(response, callback);
      });
    };

    EmojidexClient.prototype.user_emoji = function(username, callback, opts) {
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

    EmojidexClient.prototype.get_index = function(callback, opts) {
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
      return $.getJSON(this.api_url + '/emoji?' + $.param(opts)).error(function(response) {
        return _this.results = [];
      }).success(function(response) {
        return _this._succeed(response, callback);
      });
    };

    EmojidexClient.prototype.get_newest = function(callback, opts) {
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
      return $.getJSON(this.api_url + '/newest?' + $.param(opts)).error(function(response) {
        return _this.results = [];
      }).success(function(response) {
        return _this._succeed(response, callback);
      });
    };

    EmojidexClient.prototype.get_popular = function(callback, opts) {
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
      return $.getJSON(this.api_url + '/popular?' + $.param(opts)).error(function(response) {
        return _this.results = [];
      }).success(function(response) {
        return _this._succeed(response, callback);
      });
    };

    EmojidexClient.prototype.get_categories = function(callback, opts) {
      var _this = this;
      if (callback == null) {
        callback = null;
      }
      opts = this._combine_opts(opts);
      return $.getJSON(this.api_url + 'categories?' + $.param(opts)).error(function(response) {
        _this.categories = [];
        return _this.storage.set("emojidex.categories", _this.categories);
      }).success(function(response) {
        _this.categories = response.categories;
        _this.storage.set("emojidex.categories", _this.categories);
        if (callback) {
          return callback(response.categories);
        }
      });
    };

    EmojidexClient.prototype.login = function(params) {
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

    EmojidexClient.prototype.logout = function() {
      this.auth_status = 'none';
      this.storage.set("emojidex.auth_status", this.auth_status);
      this.user = '';
      this.storage.set("emojidex.user", this.user);
      this.auth_token = null;
      return this.storage.set("emojidex.auth_token", this.auth_token);
    };

    EmojidexClient.prototype.plain_auth = function(username, password, callback) {
      var url,
        _this = this;
      if (callback == null) {
        callback = null;
      }
      url = this.api_url + 'users/authenticate?' + $.param({
        username: username,
        password: password
      });
      return $.getJSON(url).error(function(response) {
        _this.auth_status = response.auth_status;
        _this.auth_token = null;
        return _this.user = '';
      }).success(function(response) {
        _this._set_auth_from_response(response);
        if (callback) {
          return callback(response.auth_token);
        }
      });
    };

    EmojidexClient.prototype.basic_auth = function(user, pass, callback) {
      if (callback == null) {
        callback = null;
      }
      return false;
    };

    EmojidexClient.prototype.google_auth = function(callback) {
      if (callback == null) {
        callback = null;
      }
      return false;
    };

    EmojidexClient.prototype._set_auth_from_response = function(response) {
      this.auth_status = response.auth_status;
      this.storage.set("emojidex.auth_status", this.auth_status);
      this.auth_token = response.auth_token;
      this.storage.set("emojidex.auth_token", this.auth_token);
      this.user = response.auth_user;
      this.storage.set("emojidex.user", this.user);
      return this.get_user_data();
    };

    EmojidexClient.prototype.get_user_data = function() {
      this.get_favorites();
      return this.get_history();
    };

    EmojidexClient.prototype.get_history = function(opts) {
      var _this = this;
      if (this.auth_token != null) {
        return $.getJSON(this.api_url + 'users/history?' + $.param({
          auth_token: this.auth_token
        })).error(function(response) {
          return _this.history = [];
        }).success(function(response) {
          return _this.history = response;
        });
      }
    };

    EmojidexClient.prototype.set_history = function(emoji_code) {
      if (this.auth_token != null) {
        return $.post(this.api_url + 'users/history?' + $.param({
          auth_token: this.auth_token,
          emoji_code: emoji_code
        }));
      }
    };

    EmojidexClient.prototype.get_favorites = function() {
      if (this.auth_token != null) {
        return $.ajax({
          url: this.api_url + 'users/favorites',
          data: {
            auth_token: this.auth_token
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

    EmojidexClient.prototype.set_favorites = function(emoji_code) {
      if (this.auth_token != null) {
        return $.ajax({
          type: 'POST',
          url: this.api_url + 'users/favorites',
          data: {
            auth_token: this.auth_token,
            emoji_code: emoji_code
          },
          success: function(response) {}
        });
      }
    };

    EmojidexClient.prototype.unset_favorites = function(emoji_code) {
      if (this.auth_token != null) {
        return $.ajax({
          type: 'DELETE',
          url: this.api_url + 'users/favorites',
          data: {
            auth_token: this.auth_token,
            emoji_code: emoji_code
          },
          success: function(response) {}
        });
      }
    };

    EmojidexClient.prototype.combine_emoji = function(emoji) {
      return $.extend(this.emoji, emoji);
    };

    EmojidexClient.prototype.simplify = function(emoji, size_code) {
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
          code: this._escape_term(moji.code),
          img_url: "" + this.cdn_url + "/" + size_code + "/" + (this._escape_term(moji.code)) + ".png"
        });
      }
      return _results;
    };

    EmojidexClient.prototype._combine_opts = function(opts) {
      return $.extend({}, {
        page: 1,
        limit: this.limit,
        detailed: this.detailed
      }, opts);
    };

    EmojidexClient.prototype._succeed = function(response, callback) {
      this.results = response.emoji;
      this.cur_page = response.meta.page;
      this.count = response.meta.count;
      this.combine_emoji(response.emoji);
      if (callback) {
        return callback(response.emoji);
      }
    };

    EmojidexClient.prototype._breakout = function(items) {
      if (items === null) {
        return [];
      }
      if (!(items instanceof Array)) {
        items = [items];
      }
      return items;
    };

    EmojidexClient.prototype._escape_term = function(term) {
      return term.split(' ').join('_');
    };

    EmojidexClient.prototype._de_escape_term = function(term) {
      return term.split('_').join(' ');
    };

    return EmojidexClient;

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

}).call(this);
