/*
 * emojidex client - v0.7.2
 * * Provides search, index caching and combining and asset URI resolution
 * https://github.com/emojidex/emojidex-web-client
 *
 * =LICENSE=
 * Licensed under the emojidex Open License
 * https://www.emojidex.com/emojidex/emojidex_open_license
 *
 * Copyright 2013 Genshin Souzou Kabushiki Kaisha
 *
 *
 * Includes:
 * --------------------------------*
 * cross-storage - Cross domain local storage
 *
 * @version   0.8.1
 * @link      https://github.com/zendesk/cross-storage
 * @author    Daniel St. Jules <danielst.jules@gmail.com>
 * @copyright Zendesk
 * @license   Apache-2.0
 * --------------------------------
 */
!function(e){function t(e,o){o=o||{},this._id=t._generateUUID(),this._promise=o.promise||Promise,this._frameId=o.frameId||"CrossStorageClient-"+this._id,this._origin=t._getOrigin(e),this._requests={},this._connected=!1,this._closed=!1,this._count=0,this._timeout=o.timeout||5e3,this._listener=null,this._installListener();var r;o.frameId&&(r=document.getElementById(o.frameId)),r&&this._poll(),r?this._hub=r.contentWindow:this._createFrame(e)}t.frameStyle={display:"none",position:"absolute",top:"-999px",left:"-999px"},t._getOrigin=function(e){var t,o,r;return t=document.createElement("a"),t.href=e,t.host||(t=window.location),o=t.protocol&&":"!==t.protocol?t.protocol:window.location.protocol,r=o+"//"+t.host,r=r.replace(/:80$|:443$/,"")},t._generateUUID=function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){var t=16*Math.random()|0,o="x"==e?t:3&t|8;return o.toString(16)})},t.prototype.onReadyFrame=function(){var e=this;return this._hub?this._promise.resolve():this._closed?this._promise.reject(new Error("CrossStorageClient has closed")):new this._promise(function(t,o){var r=setTimeout(function(){o(new Error("CrossStorageClient could not ready frame"))},e._timeout),n=setInterval(function(){e._hub&&(clearTimeout(r),clearInterval(n),t())},100)})},t.prototype.onConnect=function(){var e=this;return this._connected?this._promise.resolve():this._closed?this._promise.reject(new Error("CrossStorageClient has closed")):(this._requests.connect||(this._requests.connect=[]),new this._promise(function(t,o){var r=setTimeout(function(){o(new Error("CrossStorageClient could not connect"))},e._timeout);e._requests.connect.push(function(e){return clearTimeout(r),e?o(e):(t(),void 0)})}))},t.prototype.set=function(e,t,o){return this._request("set",{key:e,value:t,ttl:o})},t.prototype.get=function(){var e=Array.prototype.slice.call(arguments);return this._request("get",{keys:e})},t.prototype.del=function(){var e=Array.prototype.slice.call(arguments);return this._request("del",{keys:e})},t.prototype.clear=function(){return this._request("clear")},t.prototype.getKeys=function(){return this._request("getKeys")},t.prototype.close=function(){var e=document.getElementById(this._frameId);e&&e.parentNode.removeChild(e),window.removeEventListener?window.removeEventListener("message",this._listener,!1):window.detachEvent("onmessage",this._listener),this._connected=!1,this._closed=!0},t.prototype._installListener=function(){var e=this;this._listener=function(t){var o,r,n,s;if(!e._closed&&t.data&&"string"==typeof t.data&&(r="null"===t.origin?"file://":t.origin,r===e._origin))if("cross-storage:unavailable"!==t.data){if(-1!==t.data.indexOf("cross-storage:")&&!e._connected){if(e._connected=!0,!e._requests.connect)return;for(o=0;o<e._requests.connect.length;o++)e._requests.connect[o](n);delete e._requests.connect}if("cross-storage:ready"!==t.data){try{s=JSON.parse(t.data)}catch(i){return}s.id&&e._requests[s.id]&&e._requests[s.id](s.error,s.result)}}else{if(e._closed||e.close(),!e._requests.connect)return;for(n=new Error("Closing client. Could not access localStorage in hub."),o=0;o<e._requests.connect.length;o++)e._requests.connect[o](n)}},window.addEventListener?window.addEventListener("message",this._listener,!1):window.attachEvent("onmessage",this._listener)},t.prototype._poll=function(){var e,t,o;e=this,o="file://"===e._origin?"*":e._origin,t=setInterval(function(){return e._connected?clearInterval(t):(e._hub&&e._hub.postMessage("cross-storage:poll",o),void 0)},1e3)},t.prototype._createFrame=function(e){var o,r,n=this;o=window.document.createElement("iframe"),o.id=this._frameId;for(r in t.frameStyle)t.frameStyle.hasOwnProperty(r)&&(o.style[r]=t.frameStyle[r]);window.document.body.appendChild(o),o.onload=function(){n._hub=o.contentWindow},o.src=e},t.prototype._request=function(e,t){var o,r;return this._closed?this._promise.reject(new Error("CrossStorageClient has closed")):(r=this,r._count++,o={id:this._id+":"+r._count,method:"cross-storage:"+e,params:t},new this._promise(function(e,t){var n,s,i;n=setTimeout(function(){r._requests[o.id]&&(delete r._requests[o.id],t(new Error("Timeout: could not perform "+o.method)))},r._timeout),r._requests[o.id]=function(o,r){return clearTimeout(n),o?t(new Error(o)):(e(r),void 0)},Array.prototype.toJSON&&(s=Array.prototype.toJSON,Array.prototype.toJSON=null),i="file://"===r._origin?"*":r._origin,r._hub.postMessage(JSON.stringify(o),i),s&&(Array.prototype.toJSON=s)}))},"undefined"!=typeof module&&module.exports?module.exports=t:"undefined"!=typeof exports?exports.CrossStorageClient=t:"function"==typeof define&&define.amd?define([],function(){return t}):e.CrossStorageClient=t}(this);
(function() {
  var EmojidexCategories, EmojidexData, EmojidexDataStorage, EmojidexEmoji, EmojidexIndexes, EmojidexSearch, EmojidexUser, EmojidexUserFavorites, EmojidexUserHistory, EmojidexUserNewest, EmojidexUserPopular, EmojidexUtil,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.EmojidexClient = (function() {
    function EmojidexClient(options) {
      var _this = this;
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
      this.Data = new EmojidexData(this, this.options).then(function(data) {
        _this.User = new EmojidexUser(_this);
        _this.Indexes = new EmojidexIndexes(_this);
        _this.Util = new EmojidexUtil(_this);
        _this.Search = new EmojidexSearch(_this);
        _this.Emoji = new EmojidexEmoji(_this);
        return _this.Categories = new EmojidexCategories(_this);
      }).then(function() {
        var _base;
        return typeof (_base = _this.options).onReady === "function" ? _base.onReady(_this) : void 0;
      });
    }

    return EmojidexClient;

  })();

  EmojidexCategories = (function() {
    function EmojidexCategories(EC) {
      var _this = this;
      this.EC = EC;
      this._categories = this.EC.Data.categories();
      return this.sync().then(function() {
        return _this.EC.Categories = _this;
      });
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
        url: "" + this.EC.api_url + "emoji",
        dataType: 'json',
        data: param,
        success: function(response) {
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
        }
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
      var _ref,
        _this = this;
      if (((_ref = this._categories) != null ? _ref.length : void 0) != null) {
        return new Promise(function() {
          return typeof callback === "function" ? callback(_this._categories) : void 0;
        });
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
        }).then(function(response) {
          _this._categories = response.categories;
          return _this.EC.Data.categories(response.categories).then(function() {
            return typeof callback === "function" ? callback(_this._categories) : void 0;
          });
        });
      }
    };

    EmojidexCategories.prototype.all = function(callback) {
      var _this = this;
      if (this._categories != null) {
        return typeof callback === "function" ? callback(this._categories) : void 0;
      } else {
        return setTimeout((function() {
          return _this.all(callback);
        }), 500);
      }
    };

    return EmojidexCategories;

  })();

  EmojidexData = (function() {
    function EmojidexData(EC, options) {
      var _this = this;
      this.EC = EC;
      this.options = options;
      this._def_auth_info = {
        status: 'none',
        user: '',
        token: null
      };
      if (this.options.storageHubPath != null) {
        this.storage = new EmojidexDataStorage(this.options.storageHubPath);
      } else {
        this.storage = new EmojidexDataStorage();
      }
      return this.storage.hub.onReadyFrame().then(function() {
        return _this.storage.hub.onConnect();
      }).then(function() {
        return _this.storage.hub.getKeys();
      }).then(function(keys) {
        var _ref, _ref1, _ref2, _ref3, _ref4;
        if (keys.indexOf('emojidex') !== -1) {
          return _this.storage.update_cache('emojidex');
        } else {
          _this.storage.hub_cache = {
            emojidex: {
              emoji: ((_ref = _this.EC.options) != null ? _ref.emoji : void 0) || [],
              history: ((_ref1 = _this.EC.options) != null ? _ref1.history : void 0) || [],
              favorites: ((_ref2 = _this.EC.options) != null ? _ref2.favorites : void 0) || [],
              categories: ((_ref3 = _this.EC.options) != null ? _ref3.categories : void 0) || [],
              auth_info: ((_ref4 = _this.EC.options) != null ? _ref4.auth_info : void 0) || _this._def_auth_info
            }
          };
          return _this.storage.update('emojidex', _this.storage.hub_cache.emojidex);
        }
      }).then(function(data) {
        var _ref, _ref1;
        if (((_ref = _this.storage.hub_cache) != null ? (_ref1 = _ref.emojidex) != null ? _ref1.cdn_url : void 0 : void 0) != null) {
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
      }).then(function(data) {
        return _this.EC.Data = _this;
      });
    }

    EmojidexData.prototype.emoji = function(emoji_set) {
      var emoji, hub_emoji, new_emoji, _i, _j, _len, _len1, _ref;
      if (emoji_set != null) {
        if (this.storage.hub_cache.emojidex.emoji.length > 0) {
          hub_emoji = this.storage.hub_cache.emojidex.emoji;
          for (_i = 0, _len = emoji_set.length; _i < _len; _i++) {
            new_emoji = emoji_set[_i];
            for (_j = 0, _len1 = hub_emoji.length; _j < _len1; _j++) {
              emoji = hub_emoji[_j];
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
      } else if (((_ref = this.storage.hub_cache.emojidex) != null ? _ref.emoji : void 0) != null) {
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
        hub_path = 'https://www.emojidex.com/hub';
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
      var _this = this;
      query = query.split('.');
      return this.hub.onConnect().then(function() {
        return _this.hub.get(query.shift());
      }).then(function(hub_data) {
        var q, _i, _len;
        if (query.length) {
          for (_i = 0, _len = query.length; _i < _len; _i++) {
            q = query[_i];
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
      var cache, q, _i, _len;
      query = query instanceof Array ? query : query.split('.');
      cache = this.hub_cache;
      if (query.length) {
        for (_i = 0, _len = query.length; _i < _len; _i++) {
          q = query[_i];
          cache = cache[q];
        }
      }
      return cache;
    };

    EmojidexDataStorage.prototype.set = function(query, data, update) {
      var first_query,
        _this = this;
      first_query = query.split('.')[0];
      return this.hub.onConnect().then(function() {
        var new_data;
        if (update) {
          new_data = {};
          new_data[first_query] = data;
          return _this.hub.set(first_query, new_data);
        } else {
          return _this.hub.set(first_query, _this._get_chained_data(query, data));
        }
      }).then(function() {
        return _this.update_cache(first_query);
      });
    };

    EmojidexDataStorage.prototype.update = function(query, data) {
      var merged;
      merged = $.extend(true, {}, this.get(query.split('.')[0]), this._get_chained_data(query, data, false));
      return this.set(query, merged, true);
    };

    EmojidexDataStorage.prototype.update_cache = function(key) {
      var _this = this;
      return this.hub.onConnect().then(function() {
        if (key) {
          return key;
        } else {
          return _this.hub.getKeys();
        }
      }).then(function(keys) {
        return _this.hub.get(keys);
      }).then(function(hub_data) {
        if (key) {
          return _this.hub_cache[key] = hub_data[key];
        } else {
          return _this.hub_cache = hub_data;
        }
      });
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
      var _this = this;
      return this.hub.onConnect().then(function() {
        return _this.hub.clear();
      });
    };

    EmojidexDataStorage.prototype.keys = function(query) {
      var key, keys,
        _this = this;
      if (query) {
        keys = [];
        for (key in this.get(query)) {
          keys.push(key);
        }
        return keys;
      } else {
        return this.hub.onConnect().then(function() {
          return _this.hub.getKeys();
        });
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
      this.combine = __bind(this.combine, this);
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
      tags = this.EC.Util.breakout(tags);
      selection = (opts != null ? opts.selection : void 0) || this._emoji();
      collect = [];
      for (_i = 0, _len = tags.length; _i < _len; _i++) {
        tag = tags[_i];
        collect = collect.concat((function() {
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
      var _this = this;
      return this.EC.Data.emoji(emoji).then(function(hub_data) {
        return _this._emoji_instance = hub_data.emoji;
      });
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
          return _this.EC.Emoji.combine(response.emoji).then(function(data) {
            return typeof callback === "function" ? callback(response.emoji) : void 0;
          });
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
            if (++loaded_num === static_type.length) {
              return _this.EC.Emoji.combine(loaded_emoji).then(function(data) {
                return typeof callback === "function" ? callback(data) : void 0;
              });
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
            return _this.EC.Emoji.combine(response.emoji).then(function(data) {
              return typeof callback === "function" ? callback(response.emoji) : void 0;
            });
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
            return _this.EC.Emoji.combine([response]).then(function(data) {
              return typeof callback === "function" ? callback(response) : void 0;
            });
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
          return _this._set_auth_from_response(response).then(function() {
            return typeof callback === "function" ? callback(_this.auth_info) : void 0;
          });
        },
        error: function(response) {
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
        }
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
      var _this = this;
      return this.EC.Data.auth_info({
        status: 'verified',
        user: user,
        token: token
      }).then(function(data) {
        _this.auth_info = _this.EC.Data.storage.get('emojidex.auth_info');
        _this.sync_user_data();
        return data;
      });
    };

    EmojidexUser.prototype._set_auth_from_response = function(response) {
      var _this = this;
      return this.EC.Data.auth_info({
        status: response.auth_status,
        token: response.auth_token,
        user: response.auth_user
      }).then(function(data) {
        _this.auth_info = _this.EC.Data.storage.get('emojidex.auth_info');
        _this.sync_user_data();
        return data;
      });
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
      var options,
        _this = this;
      options = {
        data: {
          auth_token: this.token
        },
        success: function(response) {
          _this._favorites = response;
          _this.EC.Data.favorites(response);
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

    EmojidexUserFavorites.prototype.all = function(callback) {
      var _this = this;
      if (this._favorites != null) {
        return typeof callback === "function" ? callback(this._favorites) : void 0;
      } else {
        return setTimeout((function() {
          return _this.all(callback);
        }), 500);
      }
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
      var options,
        _this = this;
      options = {
        data: {
          auth_token: this.token
        },
        success: function(response) {
          _this._history = response;
          _this.EC.Data.history(response);
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

    EmojidexUserHistory.prototype.all = function(callback) {
      var _this = this;
      if (this._history != null) {
        return typeof callback === "function" ? callback(this._history) : void 0;
      } else {
        return setTimeout((function() {
          return _this.all(callback);
        }), 500);
      }
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
