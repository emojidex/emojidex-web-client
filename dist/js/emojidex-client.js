/*
 * emojidex client - v0.6.10
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
 * --------------------------------
 * jQuery Storage API Plugin
 *
 * Copyright (c) 2013 Julien Maurel
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 * https://github.com/julien-maurel/jQuery-Storage-API
 *
 * Version: 1.8.1
 *
 * --------------------------------
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    // Prefix to use with cookie fallback
    var cookie_local_prefix = "ls_";
    var cookie_session_prefix = "ss_";

    // Get items from a storage
    function _get() {
        var storage = this._type, l = arguments.length, s = window[storage], a = arguments, a0 = a[0], vi, ret, tmp;
        if (l < 1) {
            throw new Error('Minimum 1 argument must be given');
        } else if ($.isArray(a0)) {
            // If second argument is an array, return an object with value of storage for each item in this array
            ret = {};
            for (var i in a0) {
                vi = a0[i];
                try {
                    ret[vi] = JSON.parse(s.getItem(vi));
                } catch (e) {
                    ret[vi] = s.getItem(vi);
                }
            }
            return ret;
        } else if (l == 1) {
            // If only 1 argument, return value directly
            try {
                return JSON.parse(s.getItem(a0));
            } catch (e) {
                return s.getItem(a0);
            }
        } else {
            // If more than 1 argument, parse storage to retrieve final value to return it
            // Get first level
            try {
                ret = JSON.parse(s.getItem(a0));
            } catch (e) {
                throw new ReferenceError(a0 + ' is not defined in this storage');
            }
            // Parse next levels
            for (var i = 1; i < l - 1; i++) {
                ret = ret[a[i]];
                if (ret === undefined) {
                    throw new ReferenceError([].slice.call(a, 1, i + 1).join('.') + ' is not defined in this storage');
                }
            }
            // If last argument is an array, return an object with value for each item in this array
            // Else return value normally
            if ($.isArray(a[i])) {
                tmp = ret;
                ret = {};
                for (var j in a[i]) {
                    ret[a[i][j]] = tmp[a[i][j]];
                }
                return ret;
            } else {
                return ret[a[i]];
            }
        }
    }

    // Set items of a storage
    function _set() {
        var storage = this._type, l = arguments.length, s = window[storage], a = arguments, a0 = a[0], a1 = a[1], vi, to_store = {}, tmp;
        if (l < 1 || !$.isPlainObject(a0) && l < 2) {
            throw new Error('Minimum 2 arguments must be given or first parameter must be an object');
        } else if ($.isPlainObject(a0)) {
            // If first argument is an object, set values of storage for each property of this object
            for (var i in a0) {
                vi = a0[i];
                if (!$.isPlainObject(vi) && !this.alwaysUseJson) {
                    s.setItem(i, vi);
                } else {
                    s.setItem(i, JSON.stringify(vi));
                }
            }
            return a0;
        } else if (l == 2) {
            // If only 2 arguments, set value of storage directly
            if (typeof a1 === 'object' || this.alwaysUseJson) {
                s.setItem(a0, JSON.stringify(a1));
            } else {
                s.setItem(a0, a1);
            }
            return a1;
        } else {
            // If more than 3 arguments, parse storage to retrieve final node and set value
            // Get first level
            try {
                tmp = s.getItem(a0);
                if (tmp != null) {
                    to_store = JSON.parse(tmp);
                }
            } catch (e) {
            }
            tmp = to_store;
            // Parse next levels and set value
            for (var i = 1; i < l - 2; i++) {
                vi = a[i];
                if (!tmp[vi] || !$.isPlainObject(tmp[vi])) {
                    tmp[vi] = {};
                }
                tmp = tmp[vi];
            }
            tmp[a[i]] = a[i + 1];
            s.setItem(a0, JSON.stringify(to_store));
            return to_store;
        }
    }

    // Remove items from a storage
    function _remove() {
        var storage = this._type, l = arguments.length, s = window[storage], a = arguments, a0 = a[0], to_store, tmp;
        if (l < 1) {
            throw new Error('Minimum 1 argument must be given');
        } else if ($.isArray(a0)) {
            // If first argument is an array, remove values from storage for each item of this array
            for (var i in a0) {
                s.removeItem(a0[i]);
            }
            return true;
        } else if (l == 1) {
            // If only 2 arguments, remove value from storage directly
            s.removeItem(a0);
            return true;
        } else {
            // If more than 2 arguments, parse storage to retrieve final node and remove value
            // Get first level
            try {
                to_store = tmp = JSON.parse(s.getItem(a0));
            } catch (e) {
                throw new ReferenceError(a0 + ' is not defined in this storage');
            }
            // Parse next levels and remove value
            for (var i = 1; i < l - 1; i++) {
                tmp = tmp[a[i]];
                if (tmp === undefined) {
                    throw new ReferenceError([].slice.call(a, 1, i).join('.') + ' is not defined in this storage');
                }
            }
            // If last argument is an array,remove value for each item in this array
            // Else remove value normally
            if ($.isArray(a[i])) {
                for (var j in a[i]) {
                    delete tmp[a[i][j]];
                }
            } else {
                delete tmp[a[i]];
            }
            s.setItem(a0, JSON.stringify(to_store));
            return true;
        }
    }

    // Remove all items from a storage
    function _removeAll(reinit_ns) {
        var keys = _keys.call(this);
        for (var i in keys) {
            _remove.call(this, keys[i]);
        }
        // Reinitialize all namespace storages
        if (reinit_ns) {
            for (var i in $.namespaceStorages) {
                _createNamespace(i);
            }
        }
    }

    // Check if items of a storage are empty
    function _isEmpty() {
        var l = arguments.length, a = arguments, a0 = a[0];
        if (l == 0) {
            // If no argument, test if storage is empty
            return (_keys.call(this).length == 0);
        } else if ($.isArray(a0)) {
            // If first argument is an array, test each item of this array and return true only if all items are empty
            for (var i = 0; i < a0.length; i++) {
                if (!_isEmpty.call(this, a0[i])) {
                    return false;
                }
            }
            return true;
        } else {
            // If at least 1 argument, try to get value and test it
            try {
                var v = _get.apply(this, arguments);
                // Convert result to an object (if last argument is an array, _get return already an object) and test each item
                if (!$.isArray(a[l - 1])) {
                    v = {'totest': v};
                }
                for (var i in v) {
                    if (!(
                            ($.isPlainObject(v[i]) && $.isEmptyObject(v[i])) ||
                            ($.isArray(v[i]) && !v[i].length) ||
                            (!v[i])
                        )) {
                        return false;
                    }
                }
                return true;
            } catch (e) {
                return true;
            }
        }
    }

    // Check if items of a storage exist
    function _isSet() {
        var l = arguments.length, a = arguments, a0 = a[0];
        if (l < 1) {
            throw new Error('Minimum 1 argument must be given');
        }
        if ($.isArray(a0)) {
            // If first argument is an array, test each item of this array and return true only if all items exist
            for (var i = 0; i < a0.length; i++) {
                if (!_isSet.call(this, a0[i])) {
                    return false;
                }
            }
            return true;
        } else {
            // For other case, try to get value and test it
            try {
                var v = _get.apply(this, arguments);
                // Convert result to an object (if last argument is an array, _get return already an object) and test each item
                if (!$.isArray(a[l - 1])) {
                    v = {'totest': v};
                }
                for (var i in v) {
                    if (!(v[i] !== undefined && v[i] !== null)) {
                        return false;
                    }
                }
                return true;
            } catch (e) {
                return false;
            }
        }
    }

    // Get keys of a storage or of an item of the storage
    function _keys() {
        var storage = this._type, l = arguments.length, s = window[storage], a = arguments, keys = [], o = {};
        // If at least 1 argument, get value from storage to retrieve keys
        // Else, use storage to retrieve keys
        if (l > 0) {
            o = _get.apply(this, a);
        } else {
            o = s;
        }
        if (o && o._cookie) {
            // If storage is a cookie, use $.cookie to retrieve keys
            for (var key in $.cookie()) {
                if (key != '') {
                    keys.push(key.replace(o._prefix, ''));
                }
            }
        } else {
            for (var i in o) {
                if (o.hasOwnProperty(i)) {
                    keys.push(i);
                }
            }
        }
        return keys;
    }

    // Create new namespace storage
    function _createNamespace(name) {
        if (!name || typeof name != "string") {
            throw new Error('First parameter must be a string');
        }
        if (storage_available) {
            if (!window.localStorage.getItem(name)) {
                window.localStorage.setItem(name, '{}');
            }
            if (!window.sessionStorage.getItem(name)) {
                window.sessionStorage.setItem(name, '{}');
            }
        } else {
            if (!window.localCookieStorage.getItem(name)) {
                window.localCookieStorage.setItem(name, '{}');
            }
            if (!window.sessionCookieStorage.getItem(name)) {
                window.sessionCookieStorage.setItem(name, '{}');
            }
        }
        var ns = {
            localStorage: $.extend({}, $.localStorage, {_ns: name}),
            sessionStorage: $.extend({}, $.sessionStorage, {_ns: name})
        };
        if ($.cookie) {
            if (!window.cookieStorage.getItem(name)) {
                window.cookieStorage.setItem(name, '{}');
            }
            ns.cookieStorage = $.extend({}, $.cookieStorage, {_ns: name});
        }
        $.namespaceStorages[name] = ns;
        return ns;
    }

    // Test if storage is natively available on browser
    function _testStorage(name) {
        var foo = 'jsapi';
        try {
            if (!window[name]) {
                return false;
            }
            window[name].setItem(foo, foo);
            window[name].removeItem(foo);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Check if storages are natively available on browser
    var storage_available = _testStorage('localStorage');

    // Namespace object
    var storage = {
        _type: '',
        _ns: '',
        _callMethod: function (f, a) {
            var p = [], a = Array.prototype.slice.call(a), a0 = a[0];

            if (this._ns) {
                p.push(this._ns);
            }
            if (typeof a0 === 'string' && a0.indexOf('.') !== -1) {
                a.shift();
                [].unshift.apply(a, a0.split('.'));
            }
            [].push.apply(p, a);
            return f.apply(this, p);
        },
        // Define if plugin always use JSON to store values (even to store simple values like string, int...) or not
        alwaysUseJson: false,
        // Get items. If no parameters and storage have a namespace, return all namespace
        get: function () {
            return this._callMethod(_get, arguments);
        },
        // Set items
        set: function () {
            var l = arguments.length, a = arguments, a0 = a[0];
            if (l < 1 || !$.isPlainObject(a0) && l < 2) {
                throw new Error('Minimum 2 arguments must be given or first parameter must be an object');
            }
            // If first argument is an object and storage is a namespace storage, set values individually
            if ($.isPlainObject(a0) && this._ns) {
                for (var i in a0) {
                    this._callMethod(_set, [i, a0[i]]);
                }
                return a0;
            } else {
                var r = this._callMethod(_set, a);
                if (this._ns) {
                    return r[a0.split('.')[0]];
                } else {
                    return r;
                }
            }
        },
        // Delete items
        remove: function () {
            if (arguments.length < 1) {
                throw new Error('Minimum 1 argument must be given');
            }
            return this._callMethod(_remove, arguments);
        },
        // Delete all items
        removeAll: function (reinit_ns) {
            if (this._ns) {
                this._callMethod(_set, [{}]);
                return true;
            } else {
                return this._callMethod(_removeAll, [reinit_ns]);
            }
        },
        // Items empty
        isEmpty: function () {
            return this._callMethod(_isEmpty, arguments);
        },
        // Items exists
        isSet: function () {
            if (arguments.length < 1) {
                throw new Error('Minimum 1 argument must be given');
            }
            return this._callMethod(_isSet, arguments);
        },
        // Get keys of items
        keys: function () {
            return this._callMethod(_keys, arguments);
        }
    };

    // Use jquery.cookie for compatibility with old browsers and give access to cookieStorage
    if ($.cookie) {
        // sessionStorage is valid for one window/tab. To simulate that with cookie, we set a name for the window and use it for the name of the cookie
        if (!window.name) {
            window.name = Math.floor(Math.random() * 100000000);
        }
        var cookie_storage = {
            _cookie: true,
            _prefix: '',
            _expires: null,
            _path: null,
            _domain: null,
            setItem: function (n, v) {
                $.cookie(this._prefix + n, v, {expires: this._expires, path: this._path, domain: this._domain});
            },
            getItem: function (n) {
                return $.cookie(this._prefix + n);
            },
            removeItem: function (n) {
                return $.removeCookie(this._prefix + n);
            },
            clear: function () {
                for (var key in $.cookie()) {
                    if (key != '') {
                        if (!this._prefix && key.indexOf(cookie_local_prefix) === -1 && key.indexOf(cookie_session_prefix) === -1 || this._prefix && key.indexOf(this._prefix) === 0) {
                            $.removeCookie(key);
                        }
                    }
                }
            },
            setExpires: function (e) {
                this._expires = e;
                return this;
            },
            setPath: function (p) {
                this._path = p;
                return this;
            },
            setDomain: function (d) {
                this._domain = d;
                return this;
            },
            setConf: function (c) {
                if (c.path) {
                    this._path = c.path;
                }
                if (c.domain) {
                    this._domain = c.domain;
                }
                if (c.expires) {
                    this._expires = c.expires;
                }
                return this;
            },
            setDefaultConf: function () {
                this._path = this._domain = this._expires = null;
            }
        };
        if (!storage_available) {
            window.localCookieStorage = $.extend({}, cookie_storage, {
                _prefix: cookie_local_prefix,
                _expires: 365 * 10
            });
            window.sessionCookieStorage = $.extend({}, cookie_storage, {_prefix: cookie_session_prefix + window.name + '_'});
        }
        window.cookieStorage = $.extend({}, cookie_storage);
        // cookieStorage API
        $.cookie.raw = false;
        $.cookieStorage = $.extend({}, storage, {
            _type: 'cookieStorage',
            setExpires: function (e) {
                window.cookieStorage.setExpires(e);
                return this;
            },
            setPath: function (p) {
                window.cookieStorage.setPath(p);
                return this;
            },
            setDomain: function (d) {
                window.cookieStorage.setDomain(d);
                return this;
            },
            setConf: function (c) {
                window.cookieStorage.setConf(c);
                return this;
            },
            setDefaultConf: function () {
                window.cookieStorage.setDefaultConf();
                return this;
            }
        });
    }

    // Get a new API on a namespace
    $.initNamespaceStorage = function (ns) {
        return _createNamespace(ns);
    };
    if (storage_available) {
        // About alwaysUseJson
        // By default, all values are string on html storages and the plugin don't use json to store simple values (strings, int, float...)
        // So by default, if you do storage.setItem('test',2), value in storage will be "2", not 2
        // If you set this property to true, all values set with the plugin will be stored as json to have typed values in any cases

        // localStorage API
        $.localStorage = $.extend({}, storage, {_type: 'localStorage'});
        // sessionStorage API
        $.sessionStorage = $.extend({}, storage, {_type: 'sessionStorage'});
    } else {
        // localStorage API
        $.localStorage = $.extend({}, storage, {_type: 'localCookieStorage'});
        // sessionStorage API
        $.sessionStorage = $.extend({}, storage, {_type: 'sessionCookieStorage'});
    }
    // List of all namespace storage
    $.namespaceStorages = {};
    // Remove all items in all storages
    $.removeAllStorages = function (reinit_ns) {
        $.localStorage.removeAll(reinit_ns);
        $.sessionStorage.removeAll(reinit_ns);
        if ($.cookieStorage) {
            $.cookieStorage.removeAll(reinit_ns);
        }
        if (!reinit_ns) {
            $.namespaceStorages = {};
        }
    }
    $.alwaysUseJsonInStorage = function (value) {
        storage.alwaysUseJson = value;
        $.localStorage.alwaysUseJson = value;
        $.sessionStorage.alwaysUseJson = value;
        if ($.cookieStorage) {
            $.cookieStorage.alwaysUseJson = value;
        }
    }
}));

!function(e){function t(e,r){r=r||{},this._id=t._generateUUID(),this._promise=r.promise||Promise,this._frameId=r.frameId||"CrossStorageClient-"+this._id,this._origin=t._getOrigin(e),this._requests={},this._connected=!1,this._closed=!1,this._count=0,this._timeout=r.timeout||5e3,this._listener=null,this._installListener();var o;r.frameId&&(o=document.getElementById(r.frameId)),o&&this._poll(),o=o||this._createFrame(e),this._hub=o.contentWindow}t.frameStyle={display:"none",position:"absolute",top:"-999px",left:"-999px"},t._getOrigin=function(e){var t,r,o;return t=document.createElement("a"),t.href=e,t.host||(t=window.location),r=t.protocol&&":"!==t.protocol?t.protocol:window.location.protocol,o=r+"//"+t.host,o=o.replace(/:80$|:443$/,"")},t._generateUUID=function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){var t=16*Math.random()|0,r="x"==e?t:3&t|8;return r.toString(16)})},t.prototype.onConnect=function(){var e=this;return this._connected?this._promise.resolve():this._closed?this._promise.reject(new Error("CrossStorageClient has closed")):(this._requests.connect||(this._requests.connect=[]),new this._promise(function(t,r){var o=setTimeout(function(){r(new Error("CrossStorageClient could not connect"))},e._timeout);e._requests.connect.push(function(e){return clearTimeout(o),e?r(e):(t(),void 0)})}))},t.prototype.set=function(e,t,r){return this._request("set",{key:e,value:t,ttl:r})},t.prototype.get=function(){var e=Array.prototype.slice.call(arguments);return this._request("get",{keys:e})},t.prototype.del=function(){var e=Array.prototype.slice.call(arguments);return this._request("del",{keys:e})},t.prototype.clear=function(){return this._request("clear")},t.prototype.getKeys=function(){return this._request("getKeys")},t.prototype.close=function(){var e=document.getElementById(this._frameId);e&&e.parentNode.removeChild(e),window.removeEventListener?window.removeEventListener("message",this._listener,!1):window.detachEvent("onmessage",this._listener),this._connected=!1,this._closed=!0},t.prototype._installListener=function(){var e=this;this._listener=function(t){var r,o,n,s;if(!e._closed&&t.data&&"string"==typeof t.data&&(o="null"===t.origin?"file://":t.origin,o===e._origin))if("cross-storage:unavailable"!==t.data){if(-1!==t.data.indexOf("cross-storage:")&&!e._connected){if(e._connected=!0,!e._requests.connect)return;for(r=0;r<e._requests.connect.length;r++)e._requests.connect[r](n);delete e._requests.connect}if("cross-storage:ready"!==t.data){try{s=JSON.parse(t.data)}catch(i){return}s.id&&e._requests[s.id]&&e._requests[s.id](s.error,s.result)}}else{if(e._closed||e.close(),!e._requests.connect)return;for(n=new Error("Closing client. Could not access localStorage in hub."),r=0;r<e._requests.connect.length;r++)e._requests.connect[r](n)}},window.addEventListener?window.addEventListener("message",this._listener,!1):window.attachEvent("onmessage",this._listener)},t.prototype._poll=function(){var e,t,r;e=this,r="file://"===e._origin?"*":e._origin,t=setInterval(function(){return e._connected?clearInterval(t):(e._hub&&e._hub.postMessage("cross-storage:poll",r),void 0)},1e3)},t.prototype._createFrame=function(e){var r,o;r=window.document.createElement("iframe"),r.id=this._frameId;for(o in t.frameStyle)t.frameStyle.hasOwnProperty(o)&&(r.style[o]=t.frameStyle[o]);return window.document.body.appendChild(r),r.src=e,r},t.prototype._request=function(e,t){var r,o;return this._closed?this._promise.reject(new Error("CrossStorageClient has closed")):(o=this,o._count++,r={id:this._id+":"+o._count,method:"cross-storage:"+e,params:t},new this._promise(function(e,t){var n,s,i;n=setTimeout(function(){o._requests[r.id]&&(delete o._requests[r.id],t(new Error("Timeout: could not perform "+r.method)))},o._timeout),o._requests[r.id]=function(r,o){return clearTimeout(n),r?t(new Error(r)):(e(o),void 0)},Array.prototype.toJSON&&(s=Array.prototype.toJSON,Array.prototype.toJSON=null),i="file://"===o._origin?"*":o._origin,o._hub.postMessage(JSON.stringify(r),i),s&&(Array.prototype.toJSON=s)}))},"undefined"!=typeof module&&module.exports?module.exports=t:"undefined"!=typeof exports?exports.CrossStorageClient=t:"function"==typeof define&&define.amd?define([],function(){return t}):e.CrossStorageClient=t}(this);
(function() {
  var EmojidexCategories, EmojidexData, EmojidexDataStorage, EmojidexEmoji, EmojidexIndexes, EmojidexSearch, EmojidexUser, EmojidexUserFavorites, EmojidexUserHistory, EmojidexUserNewest, EmojidexUserPopular, EmojidexUtil,
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
      this.Emoji = new EmojidexEmoji(this);
    }

    return EmojidexClient;

  })();

  EmojidexCategories = (function() {
    function EmojidexCategories(EC) {
      this.EC = EC;
      this._categories = this.EC.Data.categories();
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
          _this._categories = _this.EC.Data.categories(response.categories);
          return typeof callback === "function" ? callback(_this._categories) : void 0;
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
      this.storage = new EmojidexDataStorage(this, 'http://localhost:8001/build/hub.html');
      this.storage.hub.onConnect().then(function() {
        return _this.storage.hub.getKeys();
      }).then(function(keys) {
        var _ref, _ref1, _ref2, _ref3, _ref4;
        if (keys.indexOf('emojidex') !== -1) {
          return _this.storage.update_emojidex_data();
        } else {
          _this.emojidex_data = {
            emoji: ((_ref = _this.EC.options) != null ? _ref.emoji : void 0) || [],
            history: ((_ref1 = _this.EC.options) != null ? _ref1.history : void 0) || [],
            favorites: ((_ref2 = _this.EC.options) != null ? _ref2.favorites : void 0) || [],
            categories: ((_ref3 = _this.EC.options) != null ? _ref3.categories : void 0) || [],
            auth_info: ((_ref4 = _this.EC.options) != null ? _ref4.auth_info : void 0) || _this._def_auth_info
          };
          return _this.storage.update('emojidex', _this.emojidex_data);
        }
      }).then(function() {
        var _ref;
        if (((_ref = _this.emojidex_data) != null ? _ref.cdn_url : void 0) != null) {
          return _this.EC.cdn_url = _this.emojidex_data.cdn_url;
        } else {
          if (_this.EC.cdn_url === _this.EC.defaults.cdn_url && _this.EC.closed_net === false) {
            return $.ajax({
              url: _this.EC.api_url + "/env",
              dataType: 'json',
              success: function(response) {
                _this.EC.env = response;
                _this.EC.cdn_url = "https://" + _this.EC.env.s_cdn_addr + "/emoji/";
                return _this.storage.update('emojidex', {
                  cdn_url: _this.EC.cdn_url
                });
              }
            });
          }
        }
      });
    }

    EmojidexData.prototype.emoji = function(emoji_set) {
      var emoji, ls_emoji, new_emoji, _i, _j, _len, _len1;
      if (emoji_set != null) {
        if (this.emojidex_data.emoji != null) {
          this.storage.update('emojidex', {
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
          this.storage.update('emojidex', {
            emoji: ls_emoji
          });
        }
      }
      return this.emojidex_data.emoji;
    };

    EmojidexData.prototype.favorites = function(favorites_set) {
      if (favorites_set != null) {
        this.storage.update('emojidex', {
          favorites: favorites_set
        });
      }
      return this.emojidex_data.favorites;
    };

    EmojidexData.prototype.history = function(history_set) {
      if (history_set != null) {
        this.storage.update('emojidex', {
          history: history_set
        });
      }
      return this.emojidex_data.history;
    };

    EmojidexData.prototype.categories = function(categories_set) {
      if (categories_set != null) {
        this.storage.update('emojidex', {
          categories: categories_set
        });
      }
      return this.emojidex_data.categories;
    };

    EmojidexData.prototype.auth_info = function(auth_info_set) {
      var promise;
      if (auth_info_set != null) {
        promise = this.storage.update('emojidex', {
          auth_info: auth_info_set
        });
        if (auth_info_set.get_auth_info) {
          return this.emojidex_data.auth_info;
        } else {
          return promise;
        }
      }
    };

    return EmojidexData;

  })();

  EmojidexDataStorage = (function() {
    function EmojidexDataStorage(ed, hub_path) {
      this.ed = ed;
      hub_path = hub_path != null ? hub_path : 'https://www.emojidex.com/hub';
      this.hub = new CrossStorageClient(hub_path);
    }

    EmojidexDataStorage.prototype._get_query_data = function(query, data_obj) {
      var chain_obj;
      chain_obj = function(data, key) {
        if (query.length === 0) {
          data[key] = data_obj;
        } else {
          data[key] = {};
          chain_obj(data[key], query.shift());
        }
        return data;
      };
      query = query.split('.');
      if (query.length === 1) {
        return data_obj;
      } else {
        query.shift();
        return chain_obj({}, query.shift());
      }
    };

    EmojidexDataStorage.prototype.get = function(query) {
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

    EmojidexDataStorage.prototype.set = function(query, data) {
      var _this = this;
      return this.hub.onConnect().then(function() {
        _this.hub.set(query.split('.')[0], _this._get_query_data(query, data));
        return _this.update_emojidex_data();
      });
    };

    EmojidexDataStorage.prototype.update = function(query, data) {
      var _this = this;
      return this.get(query).then(function(hub_data) {
        var merged;
        merged = $.extend(true, {}, hub_data, _this._get_query_data(query, data));
        return _this.set(query, merged);
      });
    };

    EmojidexDataStorage.prototype.update_emojidex_data = function() {
      var _this = this;
      return this.get('emojidex').then(function(hub_data) {
        return _this.ed.emojidex_data = hub_data;
      });
    };

    EmojidexDataStorage.prototype.clear = function() {
      var _this = this;
      return this.hub.onConnect().then(function() {
        return _this.hub.clear();
      });
    };

    EmojidexDataStorage.prototype.keys = function(query) {
      var _this = this;
      if (query) {
        return this.get(query).then(function(hub_data) {
          var data, keys;
          keys = [];
          for (data in hub_data) {
            keys.push(data);
          }
          return keys;
        });
      } else {
        return this.hub.onConnect().then(function() {
          return _this.hub.getKeys();
        });
      }
    };

    EmojidexDataStorage.prototype.isEmpty = function(query, callback) {
      return this.get(query).then(function(data) {
        if (data) {
          return false;
        } else {
          return true;
        }
      });
    };

    return EmojidexDataStorage;

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
      return this._emoji_instance = this.EC.Data.emoji(emoji);
    };

    EmojidexEmoji.prototype.flush = function() {
      this.EC.Data.storage.remove('emojidex.emoji');
      return this._emoji_instance = [];
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
        _this.auth_info = _this.EC.Data.emojidex_data.auth_info;
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
        _this.auth_info = _this.EC.Data.emojidex_data.auth_info;
        _this.sync_user_data();
        return retrun(data);
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
