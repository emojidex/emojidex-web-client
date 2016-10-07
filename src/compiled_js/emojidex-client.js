(function() {
  var EmojidexCategories, EmojidexEmoji, EmojidexSearch,
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
      if (this.EC.User.auth_info.token !== null) {
        $.extend(param, {
          auth_token: this.EC.User.auth_info.token
        });
      }
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
        var i, len, ref, results1;
        ref = this._emoji();
        results1 = [];
        for (i = 0, len = ref.length; i < len; i++) {
          moji = ref[i];
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
        var i, len, ref, results1;
        ref = this._emoji();
        results1 = [];
        for (i = 0, len = ref.length; i < len; i++) {
          moji = ref[i];
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
        var i, len, ref, results1;
        ref = this._emoji();
        results1 = [];
        for (i = 0, len = ref.length; i < len; i++) {
          moji = ref[i];
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
      var collect, i, len, moji, selection, tag;
      tags = this.EC.Util.breakout(tags);
      selection = (opts != null ? opts.selection : void 0) || this._emoji();
      collect = [];
      for (i = 0, len = tags.length; i < len; i++) {
        tag = tags[i];
        collect = collect.concat((function() {
          var j, len1, results1;
          results1 = [];
          for (j = 0, len1 = selection.length; j < len1; j++) {
            moji = selection[j];
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
      var category, collect, i, len, moji, source;
      categories = this.EC.Util.breakout(categories);
      source = (opts != null ? opts.selection : void 0) || this._emoji();
      collect = [];
      for (i = 0, len = categories.length; i < len; i++) {
        category = categories[i];
        collect = collect.concat((function() {
          var j, len1, results1;
          results1 = [];
          for (j = 0, len1 = source.length; j < len1; j++) {
            moji = source[j];
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
      if (this.EC.User.auth_info.token !== null) {
        $.extend(param, {
          auth_token: this.EC.User.auth_info.token
        });
      }
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
              if (response.status != null) {
                _this.results = [];
                _this.cur_page = 0;
                _this.count = 0;
                return typeof callback === "function" ? callback([]) : void 0;
              } else {
                _this.meta = response.meta;
                _this.results = response.emoji;
                _this.cur_page = response.meta.page;
                _this.count = response.meta.count;
                return _this.EC.Emoji.combine(response.emoji).then(function(data) {
                  return typeof callback === "function" ? callback(response.emoji) : void 0;
                });
              }
            };
          })(this),
          error: (function(_this) {
            return function(response) {
              _this.results = [];
              _this.cur_page = 0;
              _this.count = 0;
              return typeof callback === "function" ? callback([]) : void 0;
            };
          })(this)
        });
      } else {
        return typeof call_func.storage === "function" ? call_func.storage(search_data, callback) : void 0;
      }
    };

    EmojidexSearch.prototype.search = function(term, callback, opts) {
      opts = $.extend({
        code_cont: this.EC.Util.escapeTerm(term)
      }, opts);
      return this._searchAPI(term, callback, opts, {
        ajax: this.search,
        storage: this.EC.Emoji.search
      });
    };

    EmojidexSearch.prototype.starting = function(term, callback, opts) {
      opts = $.extend({
        code_sw: this.Util.escapeTerm(term)
      }, opts);
      return this._searchAPI(term, callback, opts, {
        ajax: this.starting,
        storage: this.EC.Emoji.starting
      });
    };

    EmojidexSearch.prototype.ending = function(term, callback, opts) {
      opts = $.extend({
        code_ew: this.Util.escapeTerm(term)
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
        code_cont: this.Util.escapeTerm(search_details.term),
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
      var emoji, emoji_cache, i, len, param;
      emoji_cache = this.EC.Data.emoji();
      for (i = 0, len = emoji_cache.length; i < len; i++) {
        emoji = emoji_cache[i];
        if (emoji.code === code) {
          if (typeof callback === "function") {
            callback(emoji);
          }
          return emoji;
        }
      }
      param = {
        detailed: this.EC.detailed
      };
      if (this.EC.User.auth_info.token !== null) {
        $.extend(param, {
          auth_token: this.EC.User.auth_info.token
        });
      }
      $.extend(param, opts);
      return $.ajax({
        url: this.EC.api_url + ("emoji/" + (this.EC.Util.makeURLSafe(code))),
        dataType: 'json',
        data: param,
        success: (function(_this) {
          return function(response) {
            _this.EC.Emoji.combine([response]);
            if (typeof callback === "function") {
              callback(response);
            }
            return response;
          };
        })(this),
        error: (function(_this) {
          return function(response) {
            if (typeof callback === "function") {
              callback(response);
            }
            return response;
          };
        })(this)
      });
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

}).call(this);
