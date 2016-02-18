(function() {
  var EmojidexCategories, EmojidexData, EmojidexEmoji, EmojidexIndexes, EmojidexSearch, EmojidexUser, EmojidexUserFavorites, EmojidexUserHistory, EmojidexUserNewest, EmojidexUserPopular, EmojidexUtil,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.EmojidexClient = (function() {
    function EmojidexClient(options) {
      this.env = {
        api_ver: 1,
        cdn_addr: 'cdn.emojidex.com',
        s_cdn_addr: '',
        asset_addr: 'assets.emojidex.com',
        s_asset_addr: ''
      };
      this.defaults = {
        locale: 'en',
        api_url: 'https://www.emojidex.com/api/v1/',
        cdn_url: "http://" + this.env.cdn_addr + "/emoji/",
        closed_net: false,
        min_query_len: 4,
        size_code: 'px32',
        detailed: false,
        limit: 32
      };
      this.options = $.extend({}, this.defaults, options);
      this.closed_net = this.options.closed_net;
      this.api_url = this.options.api_url;
      this.cdn_url = this.options.cdn_url;
      this.size_code = this.options.size_code;
      this.detailed = this.options.detailed;
      this.limit = this.options.limit;
      this.locale = this.options.locale;
      this.Data = new EmojidexData(this);
      this.Categories = new EmojidexCategories(this);
      this.User = new EmojidexUser(this);
      this.Indexes = new EmojidexIndexes(this);
      this.Util = new EmojidexUtil(this);
      this.Search = new EmojidexSearch(this);
      this.Emoji = new EmojidexEmoji(this);
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

    EmojidexCategories.prototype._categoriesAPI = function(category_name, callback, opts, called_func) {
      var param,
        _this = this;
      param = {
        page: 1,
        limit: this.EC.limit,
        detailed: this.EC.detailed
      };
      $.extend(param, opts);
      this.called_func = called_func;
      this.called_data = {
        category_name: category_name,
        callback: callback,
        param: param
      };
      return $.ajax({
        url: "" + this.EC.api_url + "categories/" + category_name + "/" + param.type,
        dataType: 'json',
        data: param,
        success: function(response) {
          _this.meta = response.meta;
          _this.results = response.emoji;
          _this.cur_page = response.meta.page;
          _this.count = response.meta.count;
          _this.EC.Emoji.combine(response.emoji);
          return typeof callback === "function" ? callback(response.emoji) : void 0;
        }
      });
    };

    EmojidexCategories.prototype.getEmoji = function(category_name, callback, opts) {
      var param;
      param = {
        type: 'emoji'
      };
      $.extend(param, opts);
      return this._categoriesAPI(category_name, callback, param, this.getEmoji);
    };

    EmojidexCategories.prototype.next = function() {
      if (this.count === this.called_data.param.limit) {
        this.called_data.param.page++;
      }
      return this.called_func(this.called_data.category_name, this.called_data.callback, this.called_data.param, {
        ajax: this.called_func
      });
    };

    EmojidexCategories.prototype.prev = function() {
      if (this.called_data.param.page > 1) {
        this.called_data.param.page--;
      }
      return this.called_func(this.called_data.category_name, this.called_data.callback, this.called_data.param, {
        ajax: this.called_func
      });
    };

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
      var _this = this;
      this.EC = EC;
      this._def_auth_info = {
        status: 'none',
        user: '',
        token: null
      };
      this.emojidex_data = {};
      this.storage = new CrossStorageClient('http://localhost:8001/build/hub.html');
      this.storage.onConnect().then(function() {
        return _this.storage.getKeys();
      }).then(function(keys) {
        if (keys.indexOf('emojidex') !== -1) {
          return _this.get_hub_emojidex();
        } else {
          _this.emojidex_data = {
            emoji: _this.EC.options.emoji || [],
            history: _this.EC.options.history || [],
            favorites: _this.EC.options.favorites || [],
            categories: _this.EC.options.categories || [],
            auth_info: _this.EC.options.auth_info || _this._def_auth_info
          };
          return _this.storage.set('emojidex', _this.emojidex_data);
        }
      }).then(function() {
        if (_this.emojidex_data.cdn_url != null) {
          return _this.EC.cdn_url = _this.emojidex_data.cdn_url;
        } else {
          if (_this.EC.cdn_url === _this.EC.defaults.cdn_url && _this.EC.closed_net === false) {
            return $.ajax({
              url: _this.EC.api_url + "/env",
              dataType: 'json',
              success: function(response) {
                _this.EC.env = response;
                _this.EC.cdn_url = "https://" + _this.EC.env.s_cdn_addr + "/emoji/";
                return _this.EC.Data.update_hub_data({
                  cdn_url: _this.EC.cdn_url
                });
              }
            });
          }
        }
      });
    }

    EmojidexData.prototype.update_hub_data = function(data) {
      $.extend(this.emojidex_data, data);
      return this.storage.set('emojidex', this.emojidex_data);
    };

    EmojidexData.prototype.get_hub_emojidex = function() {
      var _this = this;
      return this.storage.get('emojidex').then(function(data) {
        return _this.emojidex_data = data;
      });
    };

    EmojidexData.prototype.emoji = function(emoji_set) {
      var emoji, ls_emoji, new_emoji, _i, _j, _len, _len1;
      if (emoji_set != null) {
        if (this.emojidex_data.emoji != null) {
          this.update_hub_data({
            emoji: emoji_set
          });
        } else {
          ls_emoji = this.emojidex_data.emoji;
          for (_i = 0, _len = emoji_set.length; _i < _len; _i++) {
            new_emoji = emoji_set[_i];
            for (_j = 0, _len1 = ls_emoji.length; _j < _len1; _j++) {
              emoji = ls_emoji[_j];
              if (new_emoji.code === emoji.code) {
                ls_emoji.splice(ls_emoji.indexOf(emoji), 1, new_emoji);
                break;
              } else if (emoji === ls_emoji[ls_emoji.length - 1]) {
                ls_emoji.push(new_emoji);
              }
            }
          }
          this.update_hub_data({
            emoji: ls_emoji
          });
        }
      }
      return this.emojidex_data.emoji;
    };

    EmojidexData.prototype.favorites = function(favorites_set) {
      if (favorites_set != null) {
        this.update_hub_data({
          favorites: favorites_set
        });
      }
      return this.emojidex_data.favorites;
    };

    EmojidexData.prototype.history = function(history_set) {
      if (history_set != null) {
        this.update_hub_data({
          history: history_set
        });
      }
      return this.emojidex_data.history;
    };

    EmojidexData.prototype.categories = function(categories_set) {
      if (categories_set != null) {
        this.update_hub_data({
          categories: categories_set
        });
      }
      return this.emojidex_data.categories;
    };

    EmojidexData.prototype.auth_info = function(auth_info_set) {
      if (auth_info_set != null) {
        this.update_hub_data({
          auth_info: auth_info_set
        });
      }
      return this.emojidex_data.auth_info;
    };

    return EmojidexData;

  })();

  EmojidexEmoji = (function() {
    function EmojidexEmoji(EC) {
      this.EC = EC;
      this.combine = __bind(this.combine, this);
      this._emoji_instance = null;
    }

    EmojidexEmoji.prototype._emoji = function() {
      if (this._emoji_instance != null) {
        return this._emoji_instance;
      }
      if (this.checkUpdate()) {
        return this._emoji_instance = this.EC.Data.storage.get('emojidex.emoji');
      } else {
        this.EC.Data.storage.set('emojidex.seedUpdated', new Date().toString());
        return this.seed();
      }
    };

    EmojidexEmoji.prototype.checkUpdate = function() {
      var current, updated;
      if (this.EC.Data.storage.isSet('emojidex.seedUpdated')) {
        current = new Date;
        updated = new Date(this.EC.Data.storage.get('emojidex.seedUpdated'));
        if (current - updated <= 3600000 * 48) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    };

    EmojidexEmoji.prototype.seed = function(callback) {
      var lang;
      lang = navigator.language || navigator.userLanguage;
      return this.EC.Indexes["static"](['utf_emoji', 'extended_emoji'], lang, callback);
    };

    EmojidexEmoji.prototype.all = function() {
      return this._emoji();
    };

    EmojidexEmoji.prototype.search = function(term, callback) {
      var moji, results;
      results = (function() {
        var _i, _len, _ref, _results;
        _ref = this._emoji();
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
        _ref = this._emoji();
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
        _ref = this._emoji();
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
      if (opts == null) {
        opts = null;
      }
      tags = this.EC.Util.breakout(tags);
      selection = (opts != null ? opts.selection : void 0) || this._emoji();
      collect = [];
      for (_i = 0, _len = tags.length; _i < _len; _i++) {
        tag = tags[_i];
        collect.concat((function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = selection.length; _j < _len1; _j++) {
            moji = selection[_j];
            if ($.inArray(tag, moji.tags) >= 0) {
              _results.push(moji);
            }
          }
          return _results;
        })());
      }
      return collect;
    };

    EmojidexEmoji.prototype.categories = function(categories, opts) {
      var category, collect, moji, source, _i, _len;
      if (opts == null) {
        opts = null;
      }
      categories = this.EC.Util.breakout(categories);
      source = (opts != null ? opts.selection : void 0) || this._emoji();
      collect = [];
      for (_i = 0, _len = categories.length; _i < _len; _i++) {
        category = categories[_i];
        collect = collect.concat((function() {
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

    EmojidexEmoji.prototype.advanced = function(searchs) {
      return this.categories(searchs.categories, {
        selection: this.tags(searchs.tags, {
          selection: this.search(searchs.term)
        })
      });
    };

    EmojidexEmoji.prototype.combine = function(emoji) {
      return this._emoji_instance = this.EC.Data.emoji(emoji);
    };

    EmojidexEmoji.prototype.flush = function() {
      return this._emoji_instance = this.EC.Data.emoji([]);
    };

    return EmojidexEmoji;

  })();

  EmojidexIndexes = (function() {
    function EmojidexIndexes(EC) {
      this.EC = EC;
      this.results = [];
      this.cur_page = 1;
      this.count = 0;
    }

    EmojidexIndexes.prototype._indexesAPI = function(query, callback, opts, func) {
      var param,
        _this = this;
      param = {
        page: 1,
        limit: this.EC.limit,
        detailed: this.EC.detailed
      };
      $.extend(param, opts);
      if (func != null) {
        this.indexed_func = func;
        this.indexed = {
          query: query,
          callback: callback,
          param: param
        };
      }
      return $.ajax({
        url: this.EC.api_url + query,
        dataType: 'json',
        data: param,
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
      return this._indexesAPI('emoji', callback, opts, this.index);
    };

    EmojidexIndexes.prototype.user = function(username, callback, opts) {
      return this._indexesAPI("users/" + username + "/emoji", callback, opts);
    };

    EmojidexIndexes.prototype["static"] = function(static_type, language, callback) {
      var loadStatic, loaded_emoji, loaded_num, type, _i, _len, _results,
        _this = this;
      loaded_num = 0;
      loaded_emoji = [];
      loadStatic = function(url_string) {
        return $.ajax({
          url: url_string,
          dataType: 'json',
          success: function(response) {
            loaded_emoji = loaded_emoji.concat(response);
            _this.EC.Emoji.combine(response);
            if (++loaded_num === static_type.length) {
              return callback(loaded_emoji);
            }
          }
        });
      };
      _results = [];
      for (_i = 0, _len = static_type.length; _i < _len; _i++) {
        type = static_type[_i];
        if (language) {
          _results.push(loadStatic("" + (this.EC.api_url + type) + "?locale=" + language));
        } else {
          _results.push(loadStatic("" + (this.EC.api_url + type)));
        }
      }
      return _results;
    };

    EmojidexIndexes.prototype.select = function(code, callback, opts) {
      return this.EC.Search.find(code, callback, opts);
    };

    EmojidexIndexes.prototype.next = function() {
      if (this.count === this.indexed.param.limit) {
        this.indexed.param.page++;
      }
      return this.indexed_func(this.indexed.callback, this.indexed.param, this.indexed_func);
    };

    EmojidexIndexes.prototype.prev = function() {
      if (this.indexed.param.page > 1) {
        this.indexed.param.page--;
      }
      return this.indexed_func(this.indexed.callback, this.indexed.param, this.indexed_func);
    };

    return EmojidexIndexes;

  })();

  EmojidexSearch = (function() {
    function EmojidexSearch(EC) {
      this.EC = EC;
      this.Util = new EmojidexUtil;
      this.results = [];
      this.cur_page = 1;
      this.count = 0;
    }

    EmojidexSearch.prototype._searchAPI = function(search_data, callback, opts, call_func) {
      var param,
        _this = this;
      param = {
        page: 1,
        limit: this.EC.limit,
        detailed: this.EC.detailed
      };
      $.extend(param, opts);
      this.searched_func = call_func.ajax;
      this.searched = {
        data: search_data,
        callback: callback,
        param: param
      };
      if (!this.EC.closed_net) {
        return $.ajax({
          url: this.EC.api_url + 'search/emoji',
          dataType: 'json',
          data: param,
          success: function(response) {
            _this.meta = response.meta;
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
      } else {
        return typeof call_func.storage === "function" ? call_func.storage(search_data, callback) : void 0;
      }
    };

    EmojidexSearch.prototype.search = function(term, callback, opts) {
      opts = $.extend({
        code_cont: this.EC.Util.escape_term(term)
      }, opts);
      return this._searchAPI(term, callback, opts, {
        ajax: this.search,
        storage: this.EC.Emoji.search
      });
    };

    EmojidexSearch.prototype.starting = function(term, callback, opts) {
      opts = $.extend({
        code_sw: this.Util.escape_term(term)
      }, opts);
      return this._searchAPI(term, callback, opts, {
        ajax: this.starting,
        storage: this.EC.Emoji.starting
      });
    };

    EmojidexSearch.prototype.ending = function(term, callback, opts) {
      opts = $.extend({
        code_ew: this.Util.escape_term(term)
      }, opts);
      return this._searchAPI(term, callback, opts, {
        ajax: this.ending,
        storage: this.EC.Emoji.ending
      });
    };

    EmojidexSearch.prototype.tags = function(tags, callback, opts) {
      opts = $.extend({
        "tags[]": this.Util.breakout(tags)
      }, opts);
      return this._searchAPI(tags, callback, opts, {
        ajax: this.tags,
        storage: this.EC.Emoji.tags
      });
    };

    EmojidexSearch.prototype.advanced = function(search_details, callback, opts) {
      var param;
      param = {
        code_cont: this.Util.escape_term(search_details.term),
        "tags[]": this.Util.breakout(search_details.tags),
        "categories[]": this.Util.breakout(search_details.categories)
      };
      $.extend(param, opts);
      return this._searchAPI(search_details, callback, param, {
        ajax: this.advanced,
        storage: this.EC.Emoji.advanced
      });
    };

    EmojidexSearch.prototype.find = function(code, callback, opts) {
      var param,
        _this = this;
      param = {
        detailed: this.EC.detailed
      };
      $.extend(param, opts);
      if (this.EC.closed_net) {

      } else {
        return $.ajax({
          url: this.EC.api_url + ("/emoji/" + code),
          dataType: 'json',
          data: param,
          success: function(response) {
            _this.EC.Emoji.combine([response]);
            return typeof callback === "function" ? callback(response) : void 0;
          }
        });
      }
    };

    EmojidexSearch.prototype.next = function() {
      if (this.count === this.searched.param.limit) {
        this.searched.param.page++;
      }
      return this.searched_func(this.searched.data, this.searched.callback, this.searched.param, {
        ajax: this.searched_func
      });
    };

    EmojidexSearch.prototype.prev = function() {
      if (this.searched.param.page > 1) {
        this.searched.param.page--;
      }
      return this.searched_func(this.searched.data, this.searched.callback, this.searched.param, {
        ajax: this.searched_func
      });
    };

    return EmojidexSearch;

  })();

  EmojidexUser = (function() {
    function EmojidexUser(EC) {
      this.EC = EC;
      this.auth_info = this.EC.Data._def_auth_info;
      this.History = new EmojidexUserHistory(this.EC);
      this.Favorites = new EmojidexUserFavorites(this.EC);
      this.Newest = new EmojidexUserNewest(this.EC);
      this.Popular = new EmojidexUserPopular(this.EC);
      this._auto_login();
    }

    EmojidexUser.prototype._auto_login = function() {
      var _ref;
      if (this.closed_net) {
        return;
      }
      this.auth_info = this.EC.Data.auth_info();
      if (((_ref = this.auth_info) != null ? _ref.token : void 0) != null) {
        return this.sync_user_data();
      } else {
        return this.logout();
      }
    };

    EmojidexUser.prototype.login = function(params) {
      switch (params.authtype) {
        case 'plain':
          return this.plain_auth(params.username, params.password, params.callback);
        case 'token':
          return this.token_auth(params.username, params.auth_token, params.callback);
        case 'basic':
          return this.basic_auth(params.user, params.password, params.callback);
        case 'google':
          return this.google_auth(params.callback);
        default:
          return this._auto_login();
      }
    };

    EmojidexUser.prototype.logout = function() {
      return this.EC.Data.auth_info(this.EC.Data._def_auth_info);
    };

    EmojidexUser.prototype._authenticateAPI = function(options, callback) {
      var ajax_obj,
        _this = this;
      ajax_obj = {
        url: this.EC.api_url + 'users/authenticate',
        dataType: 'json',
        success: function(response) {
          _this._set_auth_from_response(response);
          return typeof callback === "function" ? callback(_this.auth_info) : void 0;
        },
        error: function(response) {
          var status;
          status = JSON.parse(response.responseText);
          _this.auth_info = _this.EC.Data.auth_info({
            status: status.auth_status,
            token: null,
            user: ''
          });
          return typeof callback === "function" ? callback({
            auth_info: _this.auth_info,
            error_info: response
          }) : void 0;
        }
      };
      return $.ajax($.extend(ajax_obj, options));
    };

    EmojidexUser.prototype.plain_auth = function(username, password, callback) {
      if (callback == null) {
        callback = null;
      }
      return this._authenticateAPI({
        data: {
          username: username,
          password: password
        }
      }, callback);
    };

    EmojidexUser.prototype.token_auth = function(username, token, callback) {
      if (callback == null) {
        callback = null;
      }
      return this._authenticateAPI({
        data: {
          username: username,
          token: token
        }
      }, callback);
    };

    EmojidexUser.prototype.basic_auth = function(user, password, callback) {
      if (callback == null) {
        callback = null;
      }
      return this._authenticateAPI({
        data: {
          user: user,
          password: password
        }
      }, callback);
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
      this.History.token = this.Favorites.token = this.Newest.token = this.Popular.token = this.auth_info.token;
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

    EmojidexUserFavorites.prototype._favoritesAPI = function(options) {
      var ajax_obj;
      if (this.token != null) {
        ajax_obj = {
          url: this.EC.api_url + 'users/favorites',
          dataType: 'json'
        };
        return $.ajax($.extend(ajax_obj, options));
      }
    };

    EmojidexUserFavorites.prototype.get = function(callback) {
      var options,
        _this = this;
      options = {
        data: {
          auth_token: this.token
        },
        success: function(response) {
          _this._favorites = _this.EC.Data.favorites(response);
          return typeof callback === "function" ? callback(_this._favorites) : void 0;
        }
      };
      return this._favoritesAPI(options);
    };

    EmojidexUserFavorites.prototype.set = function(emoji_code) {
      var options,
        _this = this;
      options = {
        type: 'POST',
        data: {
          auth_token: this.token,
          emoji_code: emoji_code
        },
        success: function(response) {
          _this._favorites.push(response);
          return _this.EC.Data.favorites(_this._favorites);
        }
      };
      return this._favoritesAPI(options);
    };

    EmojidexUserFavorites.prototype.unset = function(emoji_code) {
      var options,
        _this = this;
      options = {
        type: 'DELETE',
        data: {
          auth_token: this.token,
          emoji_code: emoji_code
        },
        success: function(response) {
          return _this.sync();
        }
      };
      return this._favoritesAPI(options);
    };

    EmojidexUserFavorites.prototype.sync = function() {
      return this.get();
    };

    EmojidexUserFavorites.prototype.all = function() {
      return this._favorites;
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

    EmojidexUserHistory.prototype._historyAPI = function(options) {
      var ajax_obj;
      if (this.token != null) {
        ajax_obj = {
          url: this.EC.api_url + 'users/history',
          dataType: 'json'
        };
        return $.ajax($.extend(ajax_obj, options));
      }
    };

    EmojidexUserHistory.prototype.get = function(callback) {
      var options,
        _this = this;
      options = {
        data: {
          auth_token: this.token
        },
        success: function(response) {
          _this._history = _this.EC.Data.history(response);
          return typeof callback === "function" ? callback(_this._history) : void 0;
        }
      };
      return this._historyAPI(options);
    };

    EmojidexUserHistory.prototype.set = function(emoji_code) {
      var options,
        _this = this;
      options = {
        type: 'POST',
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
      };
      return this._historyAPI(options);
    };

    EmojidexUserHistory.prototype.sync = function() {
      return this.get();
    };

    EmojidexUserHistory.prototype.all = function() {
      return this._history;
    };

    return EmojidexUserHistory;

  })();

  EmojidexUserNewest = (function() {
    function EmojidexUserNewest(EC, token) {
      this.EC = EC;
      if (token == null) {
        token = null;
      }
      this.token = token;
    }

    EmojidexUserNewest.prototype._newestAPI = function(options) {
      var ajax_obj;
      if (this.token != null) {
        ajax_obj = {
          url: this.EC.api_url + 'newest',
          dataType: 'json'
        };
        return $.ajax($.extend(ajax_obj, options));
      }
    };

    EmojidexUserNewest.prototype.get = function(callback) {
      var options,
        _this = this;
      options = {
        data: {
          auth_token: this.token
        },
        success: function(response) {
          return typeof callback === "function" ? callback(response) : void 0;
        },
        error: function(response) {
          return typeof callback === "function" ? callback(response) : void 0;
        }
      };
      return this._newestAPI(options);
    };

    return EmojidexUserNewest;

  })();

  EmojidexUserPopular = (function() {
    function EmojidexUserPopular(EC, token) {
      this.EC = EC;
      if (token == null) {
        token = null;
      }
      this.token = token;
    }

    EmojidexUserPopular.prototype._popularAPI = function(options) {
      var ajax_obj;
      if (this.token != null) {
        ajax_obj = {
          url: this.EC.api_url + 'popular',
          dataType: 'json'
        };
        return $.ajax($.extend(ajax_obj, options));
      }
    };

    EmojidexUserPopular.prototype.get = function(callback) {
      var options,
        _this = this;
      options = {
        data: {
          auth_token: this.token
        },
        success: function(response) {
          return typeof callback === "function" ? callback(response) : void 0;
        },
        error: function(response) {
          return typeof callback === "function" ? callback(response) : void 0;
        }
      };
      return this._popularAPI(options);
    };

    return EmojidexUserPopular;

  })();

  EmojidexUtil = (function() {
    function EmojidexUtil(EC) {
      this.EC = EC;
    }

    EmojidexUtil.prototype.escape_term = function(term) {
      return term.replace(/\s/g, '_').replace(/(\(|\))/g, '\\$1');
    };

    EmojidexUtil.prototype.de_escape_term = function(term) {
      return term.replace(/_/g, ' ');
    };

    EmojidexUtil.prototype.breakout = function(items) {
      if (items != null) {
        if (items instanceof Array) {
          return items;
        } else {
          return [items];
        }
      } else {
        return [];
      }
    };

    EmojidexUtil.prototype.simplify = function(emoji, size_code) {
      var moji, _i, _len, _results;
      if (emoji == null) {
        emoji = this.results;
      }
      if (size_code == null) {
        size_code = this.EC.size_code;
      }
      _results = [];
      for (_i = 0, _len = emoji.length; _i < _len; _i++) {
        moji = emoji[_i];
        _results.push({
          code: this.escape_term(moji.code),
          img_url: "" + this.EC.cdn_url + "/" + size_code + "/" + (this.escape_term(moji.code)) + ".png"
        });
      }
      return _results;
    };

    return EmojidexUtil;

  })();

}).call(this);
