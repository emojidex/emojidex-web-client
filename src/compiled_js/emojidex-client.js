(function() {
  var EmojidexCategories, EmojidexData, EmojidexDataStorage, EmojidexEmoji, EmojidexIndexes, EmojidexSearch, EmojidexUser, EmojidexUserFavorites, EmojidexUserHistory, EmojidexUserNewest, EmojidexUserPopular, EmojidexUtil,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

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
      this.Data = new EmojidexData(this, this.options).then((function(_this) {
        return function(data) {
          _this.User = new EmojidexUser(_this);
          _this.Indexes = new EmojidexIndexes(_this);
          _this.Util = new EmojidexUtil(_this);
          _this.Search = new EmojidexSearch(_this);
          _this.Emoji = new EmojidexEmoji(_this);
          return _this.Categories = new EmojidexCategories(_this);
        };
      })(this)).then((function(_this) {
        return function() {
          var base;
          return typeof (base = _this.options).onReady === "function" ? base.onReady(_this) : void 0;
        };
      })(this));
    }

    return EmojidexClient;

  })();

  EmojidexCategories = (function() {
    function EmojidexCategories(EC) {
      this.EC = EC;
      this._categories = this.EC.Data.categories();
      return this.sync().then((function(_this) {
        return function() {
          return _this.EC.Categories = _this;
        };
      })(this));
    }

    EmojidexCategories.prototype._categoriesAPI = function(category_name, callback, opts, called_func) {
      var param;
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
        url: this.EC.api_url + "emoji",
        dataType: 'json',
        data: param,
        success: (function(_this) {
          return function(response) {
            _this.meta = response.meta;
            _this.results = response.emoji;
            _this.cur_page = response.meta.page;
            _this.count = response.meta.count;
            return _this.EC.Emoji.combine(response.emoji).then(function() {
              return typeof callback === "function" ? callback(response.emoji, {
                category_name: category_name,
                callback: callback,
                param: param
              }) : void 0;
            });
          };
        })(this)
      });
    };

    EmojidexCategories.prototype.getEmoji = function(category_name, callback, opts) {
      var param;
      param = {
        category: category_name
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
      var ref;
      if (((ref = this._categories) != null ? ref.length : void 0) != null) {
        return new Promise((function(_this) {
          return function(resolve, reject) {
            if (typeof callback === "function") {
              callback(_this._categories);
            }
            return resolve();
          };
        })(this));
      } else {
        if (locale == null) {
          locale = this.EC.locale;
        }
        return $.ajax({
          url: this.EC.api_url + 'categories',
          dataType: 'json',
          data: {
            locale: locale
          }
        }).then((function(_this) {
          return function(response) {
            _this._categories = response.categories;
            return _this.EC.Data.categories(response.categories).then(function() {
              return typeof callback === "function" ? callback(_this._categories) : void 0;
            });
          };
        })(this));
      }
    };

    EmojidexCategories.prototype.all = function(callback) {
      if (this._categories != null) {
        return typeof callback === "function" ? callback(this._categories) : void 0;
      } else {
        return setTimeout(((function(_this) {
          return function() {
            return _this.all(callback);
          };
        })(this)), 500);
      }
    };

    return EmojidexCategories;

  })();

  EmojidexData = (function() {
    function EmojidexData(EC, options1) {
      this.EC = EC;
      this.options = options1;
      this._def_auth_info = {
        status: 'none',
        user: '',
        token: null,
        r18: false,
        premium: false,
        premium_exp: null,
        pro: false,
        pro_exp: null
      };
      if (this.options.storageHubPath != null) {
        this.storage = new EmojidexDataStorage(this.options.storageHubPath);
      } else {
        this.storage = new EmojidexDataStorage();
      }
      return this.storage.hub.onReadyFrame().then((function(_this) {
        return function() {
          return _this.storage.hub.onConnect();
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.storage.hub.getKeys();
        };
      })(this)).then((function(_this) {
        return function(keys) {
          var ref, ref1, ref2, ref3, ref4;
          if (keys.indexOf('emojidex') !== -1) {
            return _this.storage.update_cache('emojidex');
          } else {
            _this.storage.hub_cache = {
              emojidex: {
                emoji: ((ref = _this.EC.options) != null ? ref.emoji : void 0) || [],
                history: ((ref1 = _this.EC.options) != null ? ref1.history : void 0) || [],
                favorites: ((ref2 = _this.EC.options) != null ? ref2.favorites : void 0) || [],
                categories: ((ref3 = _this.EC.options) != null ? ref3.categories : void 0) || [],
                auth_info: ((ref4 = _this.EC.options) != null ? ref4.auth_info : void 0) || _this._def_auth_info
              }
            };
            return _this.storage.update('emojidex', _this.storage.hub_cache.emojidex);
          }
        };
      })(this)).then((function(_this) {
        return function(data) {
          var ref, ref1;
          if (((ref = _this.storage.hub_cache) != null ? (ref1 = ref.emojidex) != null ? ref1.cdn_url : void 0 : void 0) != null) {
            return _this.EC.cdn_url = _this.storage.get('emojidex.cdn_url');
          } else {
            if (_this.EC.cdn_url === _this.EC.defaults.cdn_url && _this.EC.closed_net === false) {
              return $.ajax({
                url: _this.EC.api_url + "/env",
                dataType: 'json'
              }).then(function(response) {
                _this.EC.env = response;
                _this.EC.cdn_url = "https://" + _this.EC.env.s_cdn_addr + "/emoji/";
                return _this.storage.update('emojidex', {
                  cdn_url: _this.EC.cdn_url
                });
              });
            }
          }
        };
      })(this)).then((function(_this) {
        return function(data) {
          return _this.EC.Data = _this;
        };
      })(this));
    }

    EmojidexData.prototype.emoji = function(emoji_set) {
      var emoji, hub_emoji, j, k, len, len1, new_emoji, ref;
      if (emoji_set != null) {
        if (this.storage.hub_cache.emojidex.emoji.length > 0) {
          hub_emoji = this.storage.hub_cache.emojidex.emoji;
          for (j = 0, len = emoji_set.length; j < len; j++) {
            new_emoji = emoji_set[j];
            for (k = 0, len1 = hub_emoji.length; k < len1; k++) {
              emoji = hub_emoji[k];
              if (new_emoji.code === emoji.code) {
                hub_emoji.splice(hub_emoji.indexOf(emoji), 1, new_emoji);
                break;
              } else if (emoji === hub_emoji[hub_emoji.length - 1]) {
                hub_emoji.push(new_emoji);
              }
            }
          }
          return this.storage.update('emojidex', {
            emoji: hub_emoji
          });
        } else {
          return this.storage.update('emojidex', {
            emoji: emoji_set
          });
        }
      } else if (((ref = this.storage.hub_cache.emojidex) != null ? ref.emoji : void 0) != null) {
        return this.storage.hub_cache.emojidex.emoji;
      } else {
        return void 0;
      }
    };

    EmojidexData.prototype.favorites = function(favorites_set) {
      if (favorites_set != null) {
        return this.storage.update('emojidex', {
          favorites: favorites_set
        });
      }
      return this.storage.hub_cache.favorites;
    };

    EmojidexData.prototype.history = function(history_set) {
      if (history_set != null) {
        return this.storage.update('emojidex', {
          history: history_set
        });
      }
      return this.storage.hub_cache.history;
    };

    EmojidexData.prototype.categories = function(categories_set) {
      if (categories_set != null) {
        return this.storage.update('emojidex', {
          categories: categories_set
        });
      }
      return this.storage.hub_cache.categories;
    };

    EmojidexData.prototype.auth_info = function(auth_info_set) {
      if (auth_info_set != null) {
        return this.storage.update('emojidex', {
          auth_info: auth_info_set
        });
      }
    };

    return EmojidexData;

  })();

  EmojidexDataStorage = (function() {
    function EmojidexDataStorage(hub_path) {
      if (hub_path == null) {
        hub_path = 'https://www.emojidex.com/hub/0.8.2';
      }
      this.hub = new CrossStorageClient(hub_path, {
        frameId: 'emojidex-client-storage-hub'
      });
      this.hub_cache = {};
    }

    EmojidexDataStorage.prototype._get_chained_data = function(query, data_obj, wrap) {
      var chain_obj, chained;
      if (wrap == null) {
        wrap = true;
      }
      query = this._get_parsed_query(query);
      chain_obj = function(data, key) {
        if (query.array.length === 0) {
          data[key] = data_obj;
        } else {
          data[key] = {};
          chain_obj(data[key], query.array.shift());
        }
        return data;
      };
      chained = chain_obj({}, query.array.shift());
      if (wrap) {
        return chained;
      } else {
        return chained[query.first];
      }
    };

    EmojidexDataStorage.prototype._get_hub_data = function(query) {
      query = query.split('.');
      return this.hub.onConnect().then((function(_this) {
        return function() {
          return _this.hub.get(query.shift());
        };
      })(this)).then(function(hub_data) {
        var j, len, q;
        if (query.length) {
          for (j = 0, len = query.length; j < len; j++) {
            q = query[j];
            hub_data = hub_data[q];
          }
        }
        return hub_data;
      });
    };

    EmojidexDataStorage.prototype._get_parsed_query = function(query) {
      var parsed_query;
      parsed_query = query.split('.');
      return query = {
        code: query,
        array: parsed_query,
        first: parsed_query[0]
      };
    };

    EmojidexDataStorage.prototype.get = function(query) {
      var cache, j, len, q;
      query = query instanceof Array ? query : query.split('.');
      cache = this.hub_cache;
      if (query.length) {
        for (j = 0, len = query.length; j < len; j++) {
          q = query[j];
          cache = cache[q];
        }
      }
      return cache;
    };

    EmojidexDataStorage.prototype.set = function(query, data, update) {
      var first_query;
      first_query = query.split('.')[0];
      return this.hub.onConnect().then((function(_this) {
        return function() {
          var new_data;
          if (update) {
            new_data = {};
            new_data[first_query] = data;
            return _this.hub.set(first_query, new_data);
          } else {
            return _this.hub.set(first_query, _this._get_chained_data(query, data));
          }
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.update_cache(first_query);
        };
      })(this));
    };

    EmojidexDataStorage.prototype.update = function(query, data) {
      var merged;
      merged = $.extend(true, {}, this.get(query.split('.')[0]), this._get_chained_data(query, data, false));
      return this.set(query, merged, true);
    };

    EmojidexDataStorage.prototype.update_cache = function(key) {
      return this.hub.onConnect().then((function(_this) {
        return function() {
          if (key) {
            return key;
          } else {
            return _this.hub.getKeys();
          }
        };
      })(this)).then((function(_this) {
        return function(keys) {
          return _this.hub.get(keys);
        };
      })(this)).then((function(_this) {
        return function(hub_data) {
          if (key) {
            return _this.hub_cache[key] = hub_data[key];
          } else {
            return _this.hub_cache = hub_data;
          }
        };
      })(this));
    };

    EmojidexDataStorage.prototype._remove = function(query) {
      var i, scope, target;
      query = this._get_parsed_query(query);
      if (query.array.length === 1) {
        return this.hub.del(query.code);
      } else {
        target = scope = this.get(query.array.shift());
        i = 0;
        while (i < query.array.length - 1) {
          scope = scope[query.array[i]];
          i++;
        }
        delete scope[query.array[i]];
        return this.update(query.first, target);
      }
    };

    EmojidexDataStorage.prototype.clear = function() {
      return this.hub.onConnect().then((function(_this) {
        return function() {
          return _this.hub.clear();
        };
      })(this));
    };

    EmojidexDataStorage.prototype.keys = function(query) {
      var key, keys;
      if (query) {
        keys = [];
        for (key in this.get(query)) {
          keys.push(key);
        }
        return keys;
      } else {
        return this.hub.onConnect().then((function(_this) {
          return function() {
            return _this.hub.getKeys();
          };
        })(this));
      }
    };

    EmojidexDataStorage.prototype.isEmpty = function(query) {
      if (this.get(query)) {
        return false;
      } else {
        return true;
      }
    };

    EmojidexDataStorage.prototype.isSet = function(query) {
      if (this.get(query)) {
        return true;
      } else {
        return false;
      }
    };

    return EmojidexDataStorage;

  })();

  EmojidexEmoji = (function() {
    function EmojidexEmoji(EC) {
      this.EC = EC;
      this.combine = bind(this.combine, this);
      this._emoji_instance = [];
    }

    EmojidexEmoji.prototype._emoji = function() {
      if (this._emoji_instance != null) {
        return this._emoji_instance;
      }
      if (this.checkUpdate()) {
        this.EC.Data.storage.update('emojidex.seedUpdated', new Date().toString());
        return this.seed();
      } else {
        return this._emoji_instance = this.EC.Data.storage.get('emojidex.emoji');
      }
    };

    EmojidexEmoji.prototype.checkUpdate = function() {
      var current, updated;
      if (this.EC.Data.storage.isSet('emojidex.seedUpdated')) {
        current = new Date;
        updated = new Date(this.EC.Data.storage.get('emojidex.seedUpdated'));
        if (current - updated >= 3600000 * 48) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    };

    EmojidexEmoji.prototype.seed = function(callback) {
      return this.EC.Indexes["static"](['utf_emoji', 'extended_emoji'], null, callback);
    };

    EmojidexEmoji.prototype.all = function() {
      return this._emoji();
    };

    EmojidexEmoji.prototype.search = function(term, callback) {
      var moji, results;
      results = (function() {
        var j, len, ref, results1;
        ref = this._emoji();
        results1 = [];
        for (j = 0, len = ref.length; j < len; j++) {
          moji = ref[j];
          if (moji.code.match(term)) {
            results1.push(moji);
          }
        }
        return results1;
      }).call(this);
      if (typeof callback === "function") {
        callback(results);
      }
      return results;
    };

    EmojidexEmoji.prototype.starting = function(term, callback) {
      var moji, results;
      results = (function() {
        var j, len, ref, results1;
        ref = this._emoji();
        results1 = [];
        for (j = 0, len = ref.length; j < len; j++) {
          moji = ref[j];
          if (moji.code.match('^' + term)) {
            results1.push(moji);
          }
        }
        return results1;
      }).call(this);
      if (typeof callback === "function") {
        callback(results);
      }
      return results;
    };

    EmojidexEmoji.prototype.ending = function(term, callback) {
      var moji, results;
      results = (function() {
        var j, len, ref, results1;
        ref = this._emoji();
        results1 = [];
        for (j = 0, len = ref.length; j < len; j++) {
          moji = ref[j];
          if (moji.code.match(term + '$')) {
            results1.push(moji);
          }
        }
        return results1;
      }).call(this);
      if (typeof callback === "function") {
        callback(results);
      }
      return results;
    };

    EmojidexEmoji.prototype.tags = function(tags, opts) {
      var collect, j, len, moji, selection, tag;
      tags = this.EC.Util.breakout(tags);
      selection = (opts != null ? opts.selection : void 0) || this._emoji();
      collect = [];
      for (j = 0, len = tags.length; j < len; j++) {
        tag = tags[j];
        collect = collect.concat((function() {
          var k, len1, results1;
          results1 = [];
          for (k = 0, len1 = selection.length; k < len1; k++) {
            moji = selection[k];
            if ($.inArray(tag, moji.tags) >= 0) {
              results1.push(moji);
            }
          }
          return results1;
        })());
      }
      return collect;
    };

    EmojidexEmoji.prototype.categories = function(categories, opts) {
      var category, collect, j, len, moji, source;
      categories = this.EC.Util.breakout(categories);
      source = (opts != null ? opts.selection : void 0) || this._emoji();
      collect = [];
      for (j = 0, len = categories.length; j < len; j++) {
        category = categories[j];
        collect = collect.concat((function() {
          var k, len1, results1;
          results1 = [];
          for (k = 0, len1 = source.length; k < len1; k++) {
            moji = source[k];
            if (moji.category === category) {
              results1.push(moji);
            }
          }
          return results1;
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
      return this.EC.Data.emoji(emoji).then((function(_this) {
        return function(hub_data) {
          return _this._emoji_instance = hub_data.emoji;
        };
      })(this));
    };

    EmojidexEmoji.prototype.flush = function() {
      this._emoji_instance = [];
      return this.EC.Data.storage._remove('emojidex.emoji');
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
      var param;
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
        success: (function(_this) {
          return function(response) {
            _this.results = response.emoji;
            _this.cur_page = response.meta.page;
            _this.count = response.meta.count;
            return _this.EC.Emoji.combine(response.emoji).then(function(data) {
              return typeof callback === "function" ? callback(response.emoji) : void 0;
            });
          };
        })(this),
        error: (function(_this) {
          return function(response) {
            return _this.results = [];
          };
        })(this)
      });
    };

    EmojidexIndexes.prototype.index = function(callback, opts) {
      return this._indexesAPI('emoji', callback, opts, this.index);
    };

    EmojidexIndexes.prototype.user = function(username, callback, opts) {
      return this._indexesAPI("users/" + username + "/emoji", callback, opts);
    };

    EmojidexIndexes.prototype["static"] = function(static_type, language, callback) {
      var j, len, loadStatic, loaded_emoji, loaded_num, results1, type;
      loaded_num = 0;
      loaded_emoji = [];
      loadStatic = (function(_this) {
        return function(url_string) {
          return $.ajax({
            url: url_string,
            dataType: 'json',
            success: function(response) {
              loaded_emoji = loaded_emoji.concat(response);
              if (++loaded_num === static_type.length) {
                return _this.EC.Emoji.combine(loaded_emoji).then(function(data) {
                  return typeof callback === "function" ? callback(data) : void 0;
                });
              }
            }
          });
        };
      })(this);
      results1 = [];
      for (j = 0, len = static_type.length; j < len; j++) {
        type = static_type[j];
        if (language) {
          results1.push(loadStatic((this.EC.api_url + type) + "?locale=" + language));
        } else {
          results1.push(loadStatic("" + (this.EC.api_url + type)));
        }
      }
      return results1;
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
      var param;
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
          success: (function(_this) {
            return function(response) {
              _this.meta = response.meta;
              _this.results = response.emoji;
              _this.cur_page = response.meta.page;
              _this.count = response.meta.count;
              return _this.EC.Emoji.combine(response.emoji).then(function(data) {
                return typeof callback === "function" ? callback(response.emoji) : void 0;
              });
            };
          })(this),
          error: (function(_this) {
            return function(response) {
              return _this.results = [];
            };
          })(this)
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
      var param;
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
          success: (function(_this) {
            return function(response) {
              return _this.EC.Emoji.combine([response]).then(function(data) {
                return typeof callback === "function" ? callback(response) : void 0;
              });
            };
          })(this)
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
    }

    EmojidexUser.prototype._auto_login = function() {
      var ref;
      if (this.closed_net) {
        return;
      }
      this.auth_info = this.EC.Data.auth_info();
      if (((ref = this.auth_info) != null ? ref.token : void 0) != null) {
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
      var ajax_obj;
      ajax_obj = {
        url: this.EC.api_url + 'users/authenticate',
        dataType: 'json',
        success: (function(_this) {
          return function(response) {
            return _this._set_auth_from_response(response).then(function() {
              return typeof callback === "function" ? callback(_this.auth_info) : void 0;
            });
          };
        })(this),
        error: (function(_this) {
          return function(response) {
            var status;
            status = JSON.parse(response.responseText);
            _this.auth_info = {
              status: status.auth_status,
              token: null,
              user: ''
            };
            return _this.EC.Data.auth_info(_this.EC.Data.auth_info).then(function() {
              return typeof callback === "function" ? callback({
                auth_info: _this.auth_info,
                error_info: response
              }) : void 0;
            });
          };
        })(this)
      };
      return $.ajax($.extend(ajax_obj, options));
    };

    EmojidexUser.prototype.plain_auth = function(username, password, callback) {
      return this._authenticateAPI({
        data: {
          username: username,
          password: password
        }
      }, callback);
    };

    EmojidexUser.prototype.token_auth = function(username, token, callback) {
      return this._authenticateAPI({
        data: {
          username: username,
          token: token
        }
      }, callback);
    };

    EmojidexUser.prototype.basic_auth = function(user, password, callback) {
      return this._authenticateAPI({
        data: {
          user: user,
          password: password
        }
      }, callback);
    };

    EmojidexUser.prototype.google_auth = function(callback) {
      return false;
    };

    EmojidexUser.prototype.set_auth = function(user, token) {
      return this.EC.Data.auth_info({
        status: 'verified',
        user: user,
        token: token
      }).then((function(_this) {
        return function(data) {
          _this.auth_info = _this.EC.Data.storage.get('emojidex.auth_info');
          _this.sync_user_data();
          return data;
        };
      })(this));
    };

    EmojidexUser.prototype._set_auth_from_response = function(response) {
      return this.EC.Data.auth_info({
        status: response.auth_status,
        token: response.auth_token,
        user: response.auth_user
      }).then((function(_this) {
        return function(data) {
          _this.auth_info = _this.EC.Data.storage.get('emojidex.auth_info');
          _this.sync_user_data();
          return data;
        };
      })(this));
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
      var options;
      options = {
        data: {
          auth_token: this.token
        },
        success: (function(_this) {
          return function(response) {
            _this._favorites = response;
            _this.EC.Data.favorites(response);
            return typeof callback === "function" ? callback(_this._favorites) : void 0;
          };
        })(this)
      };
      return this._favoritesAPI(options);
    };

    EmojidexUserFavorites.prototype.set = function(emoji_code) {
      var options;
      options = {
        type: 'POST',
        data: {
          auth_token: this.token,
          emoji_code: emoji_code
        },
        success: (function(_this) {
          return function(response) {
            _this._favorites.push(response);
            return _this.EC.Data.favorites(_this._favorites);
          };
        })(this)
      };
      return this._favoritesAPI(options);
    };

    EmojidexUserFavorites.prototype.unset = function(emoji_code) {
      var options;
      options = {
        type: 'DELETE',
        data: {
          auth_token: this.token,
          emoji_code: emoji_code
        },
        success: (function(_this) {
          return function(response) {
            return _this.sync();
          };
        })(this)
      };
      return this._favoritesAPI(options);
    };

    EmojidexUserFavorites.prototype.sync = function() {
      return this.get();
    };

    EmojidexUserFavorites.prototype.all = function(callback) {
      if (this._favorites != null) {
        if (typeof callback === "function") {
          callback(this._favorites);
        }
      } else {
        setTimeout(((function(_this) {
          return function() {
            return _this.all(callback);
          };
        })(this)), 500);
      }
      return this._favorites;
    };

    return EmojidexUserFavorites;

  })();

  EmojidexUserHistory = (function() {
    function EmojidexUserHistory(EC, token) {
      this.EC = EC;
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
      var options;
      options = {
        data: {
          auth_token: this.token
        },
        success: (function(_this) {
          return function(response) {
            _this._history = response;
            _this.EC.Data.history(response);
            return typeof callback === "function" ? callback(_this._history) : void 0;
          };
        })(this)
      };
      return this._historyAPI(options);
    };

    EmojidexUserHistory.prototype.set = function(emoji_code) {
      var options;
      options = {
        type: 'POST',
        data: {
          auth_token: this.token,
          emoji_code: emoji_code
        },
        success: (function(_this) {
          return function(response) {
            var entry, i, j, len, ref;
            ref = _this._history;
            for (i = j = 0, len = ref.length; j < len; i = ++j) {
              entry = ref[i];
              if (entry.emoji_code === response.emoji_code) {
                _this._history[i] = response;
                _this.EC.Data.history(_this._history);
                return response;
              }
            }
          };
        })(this)
      };
      return this._historyAPI(options);
    };

    EmojidexUserHistory.prototype.sync = function() {
      return this.get();
    };

    EmojidexUserHistory.prototype.all = function(callback) {
      if (this._history != null) {
        if (typeof callback === "function") {
          callback(this._history);
        }
      } else {
        setTimeout(((function(_this) {
          return function() {
            return _this.all(callback);
          };
        })(this)), 500);
      }
      return this._history;
    };

    return EmojidexUserHistory;

  })();

  EmojidexUserNewest = (function() {
    function EmojidexUserNewest(EC, token) {
      this.EC = EC;
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
      var options;
      options = {
        data: {
          auth_token: this.token
        },
        success: (function(_this) {
          return function(response) {
            return typeof callback === "function" ? callback(response) : void 0;
          };
        })(this),
        error: (function(_this) {
          return function(response) {
            return typeof callback === "function" ? callback(response) : void 0;
          };
        })(this)
      };
      return this._newestAPI(options);
    };

    return EmojidexUserNewest;

  })();

  EmojidexUserPopular = (function() {
    function EmojidexUserPopular(EC, token) {
      this.EC = EC;
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
      var options;
      options = {
        data: {
          auth_token: this.token
        },
        success: (function(_this) {
          return function(response) {
            return typeof callback === "function" ? callback(response) : void 0;
          };
        })(this),
        error: (function(_this) {
          return function(response) {
            return typeof callback === "function" ? callback(response) : void 0;
          };
        })(this)
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
      var j, len, moji, results1;
      if (emoji == null) {
        emoji = this.results;
      }
      if (size_code == null) {
        size_code = this.EC.size_code;
      }
      results1 = [];
      for (j = 0, len = emoji.length; j < len; j++) {
        moji = emoji[j];
        results1.push({
          code: this.escape_term(moji.code),
          img_url: this.EC.cdn_url + "/" + size_code + "/" + (this.escape_term(moji.code)) + ".png"
        });
      }
      return results1;
    };

    return EmojidexUtil;

  })();

}).call(this);
