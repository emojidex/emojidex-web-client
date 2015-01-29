/*
 * emojidex client - v0.2.0
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
 * Version: 1.7.3
 * --------------------------------
 */
(function (factory) {
  if(typeof define==='function' && define.amd){
    // AMD
    define(['jquery'],factory);
  }else if(typeof exports==='object') {
    // CommonJS
    factory(require('jquery'));
  }else {
    // Browser globals
    factory(jQuery);
  }
}(function($){
  // Prefix to use with cookie fallback
  var cookie_local_prefix="ls_";
  var cookie_session_prefix="ss_";

  // Get items from a storage
  function _get(storage){
    var l=arguments.length,s=window[storage],a=arguments,a1=a[1],vi,ret,tmp;
    if(l<2) throw new Error('Minimum 2 arguments must be given');
    else if($.isArray(a1)){
      // If second argument is an array, return an object with value of storage for each item in this array
      ret={};
      for(var i in a1){
        vi=a1[i];
        try{
          ret[vi]=JSON.parse(s.getItem(vi));
        }catch(e){
          ret[vi]=s.getItem(vi);
        }
      }
      return ret;
    }else if(l==2){
      // If only 2 arguments, return value directly
      try{
        return JSON.parse(s.getItem(a1));
      }catch(e){
        return s.getItem(a1);
      }
    }else{
      // If more than 2 arguments, parse storage to retrieve final value to return it
      // Get first level
      try{
        ret=JSON.parse(s.getItem(a1));
      }catch(e){
        throw new ReferenceError(a1+' is not defined in this storage');
      }
      // Parse next levels
      for(var i=2;i<l-1;i++){
        ret=ret[a[i]];
        if(ret===undefined) throw new ReferenceError([].slice.call(a,1,i+1).join('.')+' is not defined in this storage');
      }
      // If last argument is an array, return an object with value for each item in this array
      // Else return value normally
      if($.isArray(a[i])){
        tmp=ret;
        ret={};
        for(var j in a[i]){
          ret[a[i][j]]=tmp[a[i][j]];
        }
        return ret;
      }else{
        return ret[a[i]];
      }
    }
  }

  // Set items of a storage
  function _set(storage){
    var l=arguments.length,s=window[storage],a=arguments,a1=a[1],a2=a[2],vi,to_store={},tmp;
    if(l<2 || !$.isPlainObject(a1) && l<3) throw new Error('Minimum 3 arguments must be given or second parameter must be an object');
    else if($.isPlainObject(a1)){
      // If first argument is an object, set values of storage for each property of this object
      for(var i in a1){
        vi=a1[i];
        if(!$.isPlainObject(vi)) s.setItem(i,vi);
        else s.setItem(i,JSON.stringify(vi));
      }
      return a1;
    }else if(l==3){
      // If only 3 arguments, set value of storage directly
      if(typeof a2==='object') s.setItem(a1,JSON.stringify(a2));
      else s.setItem(a1,a2);
      return a2;
    }else{
      // If more than 3 arguments, parse storage to retrieve final node and set value
      // Get first level
      try{
        tmp=s.getItem(a1);
        if(tmp!=null) {
          to_store=JSON.parse(tmp);
        }
      }catch(e){
      }
      tmp=to_store;
      // Parse next levels and set value
      for(var i=2;i<l-2;i++){
        vi=a[i];
        if(!tmp[vi] || !$.isPlainObject(tmp[vi])) tmp[vi]={};
        tmp=tmp[vi];
      }
      tmp[a[i]]=a[i+1];
      s.setItem(a1,JSON.stringify(to_store));
      return to_store;
    }
  }

  // Remove items from a storage
  function _remove(storage){
    var l=arguments.length,s=window[storage],a=arguments,a1=a[1],to_store,tmp;
    if(l<2) throw new Error('Minimum 2 arguments must be given');
    else if($.isArray(a1)){
      // If first argument is an array, remove values from storage for each item of this array
      for(var i in a1){
        s.removeItem(a1[i]);
      }
      return true;
    }else if(l==2){
      // If only 2 arguments, remove value from storage directly
      s.removeItem(a1);
      return true;
    }else{
      // If more than 2 arguments, parse storage to retrieve final node and remove value
      // Get first level
      try{
        to_store=tmp=JSON.parse(s.getItem(a1));
      }catch(e){
        throw new ReferenceError(a1+' is not defined in this storage');
      }
      // Parse next levels and remove value
      for(var i=2;i<l-1;i++){
        tmp=tmp[a[i]];
        if(tmp===undefined) throw new ReferenceError([].slice.call(a,1,i).join('.')+' is not defined in this storage');
      }
      // If last argument is an array,remove value for each item in this array
      // Else remove value normally
      if($.isArray(a[i])){
        for(var j in a[i]){
          delete tmp[a[i][j]];
        }
      }else{
        delete tmp[a[i]];
      }
      s.setItem(a1,JSON.stringify(to_store));
      return true;
    }
  }

  // Remove all items from a storage
  function _removeAll(storage, reinit_ns){
    var keys=_keys(storage);
    for(var i in keys){
      _remove(storage,keys[i]);
    }
    // Reinitialize all namespace storages
    if(reinit_ns){
      for(var i in $.namespaceStorages){
        _createNamespace(i);
      }
    }
  }

  // Check if items of a storage are empty
  function _isEmpty(storage){
    var l=arguments.length,a=arguments,s=window[storage],a1=a[1];
    if(l==1){
      // If only one argument, test if storage is empty
      return (_keys(storage).length==0);
    }else if($.isArray(a1)){
      // If first argument is an array, test each item of this array and return true only if all items are empty
      for(var i=0; i<a1.length;i++){
        if(!_isEmpty(storage,a1[i])) return false;
      }
      return true;
    }else{
      // If more than 1 argument, try to get value and test it
      try{
        var v=_get.apply(this, arguments);
        // Convert result to an object (if last argument is an array, _get return already an object) and test each item
        if(!$.isArray(a[l-1])) v={'totest':v};
        for(var i in v){
          if(!(
            ($.isPlainObject(v[i]) && $.isEmptyObject(v[i])) ||
            ($.isArray(v[i]) && !v[i].length) ||
            (!v[i])
          )) return false;
        }
        return true;
      }catch(e){
        return true;
      }
    }
  }

  // Check if items of a storage exist
  function _isSet(storage){
    var l=arguments.length,a=arguments,s=window[storage],a1=a[1];
    if(l<2) throw new Error('Minimum 2 arguments must be given');
    if($.isArray(a1)){
      // If first argument is an array, test each item of this array and return true only if all items exist
      for(var i=0; i<a1.length;i++){
        if(!_isSet(storage,a1[i])) return false;
      }
      return true;
    }else{
      // For other case, try to get value and test it
      try{
        var v=_get.apply(this, arguments);
        // Convert result to an object (if last argument is an array, _get return already an object) and test each item
        if(!$.isArray(a[l-1])) v={'totest':v};
        for(var i in v){
          if(!(v[i]!==undefined && v[i]!==null)) return false;
        }
        return true;
      }catch(e){
        return false;
      }
    }
  }

  // Get keys of a storage or of an item of the storage
  function _keys(storage){
    var l=arguments.length,s=window[storage],a=arguments,a1=a[1],keys=[],o={};
    // If more than 1 argument, get value from storage to retrieve keys
    // Else, use storage to retrieve keys
    if(l>1){
      o=_get.apply(this,a);
    }else{
      o=s;
    }
    if(o._cookie){
      // If storage is a cookie, use $.cookie to retrieve keys
      for(var key in $.cookie()){
        if(key!='') {
          keys.push(key.replace(o._prefix,''));
        }
      }
    }else{
      for(var i in o){
        keys.push(i);
      }
    }
    return keys;
  }

  // Create new namespace storage
  function _createNamespace(name){
    if(!name || typeof name!="string") throw new Error('First parameter must be a string');
    if(storage_available){
      if(!window.localStorage.getItem(name)) window.localStorage.setItem(name,'{}');
      if(!window.sessionStorage.getItem(name)) window.sessionStorage.setItem(name,'{}');
    }else{
      if(!window.localCookieStorage.getItem(name)) window.localCookieStorage.setItem(name,'{}');
      if(!window.sessionCookieStorage.getItem(name)) window.sessionCookieStorage.setItem(name,'{}');
    }
    var ns={
      localStorage:$.extend({},$.localStorage,{_ns:name}),
      sessionStorage:$.extend({},$.sessionStorage,{_ns:name})
    };
    if($.cookie){
      if(!window.cookieStorage.getItem(name)) window.cookieStorage.setItem(name,'{}');
      ns.cookieStorage=$.extend({},$.cookieStorage,{_ns:name});
    }
    $.namespaceStorages[name]=ns;
    return ns;
  }

  // Test if storage is natively available on browser
  function _testStorage(name){
    if(!window[name]) return false;
    var foo='jsapi';
    try{
      window[name].setItem(foo,foo);
      window[name].removeItem(foo);
      return true;
    }catch(e){
      return false;
    }
  }
  
  // Check if storages are natively available on browser
  var storage_available=_testStorage('localStorage');
  
  // Namespace object
  var storage={
    _type:'',
    _ns:'',
    _callMethod:function(f,a){
      var p=[this._type],a=Array.prototype.slice.call(a),a0=a[0];
      if(this._ns) p.push(this._ns);
      if(typeof a0==='string' && a0.indexOf('.')!==-1){
        a.shift();
        [].unshift.apply(a,a0.split('.'));
      }
      [].push.apply(p,a);
      return f.apply(this,p);
    },
    // Get items. If no parameters and storage have a namespace, return all namespace
    get:function(){
      return this._callMethod(_get,arguments);
    },
    // Set items
    set:function(){
      var l=arguments.length,a=arguments,a0=a[0];
      if(l<1 || !$.isPlainObject(a0) && l<2) throw new Error('Minimum 2 arguments must be given or first parameter must be an object');
      // If first argument is an object and storage is a namespace storage, set values individually
      if($.isPlainObject(a0) && this._ns){
        for(var i in a0){
          _set(this._type,this._ns,i,a0[i]);
        }
        return a0;
      }else{
        var r=this._callMethod(_set,a);
        if(this._ns) return r[a0.split('.')[0]];
        else return r;
      }
    },
    // Delete items
    remove:function(){
      if(arguments.length<1) throw new Error('Minimum 1 argument must be given');
      return this._callMethod(_remove,arguments);
    },
    // Delete all items
    removeAll:function(reinit_ns){
      if(this._ns){
        _set(this._type,this._ns,{});
        return true;
      }else{
        return _removeAll(this._type, reinit_ns);
      }
    },
    // Items empty
    isEmpty:function(){
      return this._callMethod(_isEmpty,arguments);
    },
    // Items exists
    isSet:function(){
      if(arguments.length<1) throw new Error('Minimum 1 argument must be given');
      return this._callMethod(_isSet,arguments);
    },
    // Get keys of items
    keys:function(){
      return this._callMethod(_keys,arguments);
    }
  };

  // Use jquery.cookie for compatibility with old browsers and give access to cookieStorage
  if($.cookie){
    // sessionStorage is valid for one window/tab. To simulate that with cookie, we set a name for the window and use it for the name of the cookie
    if(!window.name) window.name=Math.floor(Math.random()*100000000);
    var cookie_storage={
      _cookie:true,
      _prefix:'',
      _expires:null,
      _path:null,
      _domain:null,
      setItem:function(n,v){
        $.cookie(this._prefix+n,v,{expires:this._expires,path:this._path,domain:this._domain});
      },
      getItem:function(n){
        return $.cookie(this._prefix+n);
      },
      removeItem:function(n){
        return $.removeCookie(this._prefix+n);
      },
      clear:function(){
        for(var key in $.cookie()){
          if(key!=''){
            if(!this._prefix && key.indexOf(cookie_local_prefix)===-1 && key.indexOf(cookie_session_prefix)===-1 || this._prefix && key.indexOf(this._prefix)===0) {
              $.removeCookie(key);
            }
          }
        }
      },
      setExpires:function(e){
        this._expires=e;
        return this;
      },
      setPath:function(p){
        this._path=p;
        return this;
      },
      setDomain:function(d){
        this._domain=d;
        return this;
      },
      setConf:function(c){
        if(c.path) this._path=c.path;
        if(c.domain) this._domain=c.domain;
        if(c.expires) this._expires=c.expires;
        return this;
      },
      setDefaultConf:function(){
        this._path=this._domain=this._expires=null;
      }
    };
    if(!storage_available){
      window.localCookieStorage=$.extend({},cookie_storage,{_prefix:cookie_local_prefix,_expires:365*10});
      window.sessionCookieStorage=$.extend({},cookie_storage,{_prefix:cookie_session_prefix+window.name+'_'});
    }
    window.cookieStorage=$.extend({},cookie_storage);
    // cookieStorage API
    $.cookieStorage=$.extend({},storage,{
      _type:'cookieStorage',
      setExpires:function(e){window.cookieStorage.setExpires(e); return this;},
      setPath:function(p){window.cookieStorage.setPath(p); return this;},
      setDomain:function(d){window.cookieStorage.setDomain(d); return this;},
      setConf:function(c){window.cookieStorage.setConf(c); return this;},
      setDefaultConf:function(){window.cookieStorage.setDefaultConf(); return this;}
    });
  }

  // Get a new API on a namespace
  $.initNamespaceStorage=function(ns){ return _createNamespace(ns); };
  if(storage_available) {
    // localStorage API
    $.localStorage=$.extend({},storage,{_type:'localStorage'});
    // sessionStorage API
    $.sessionStorage=$.extend({},storage,{_type:'sessionStorage'});
  }else{
    // localStorage API
    $.localStorage=$.extend({},storage,{_type:'localCookieStorage'});
    // sessionStorage API
    $.sessionStorage=$.extend({},storage,{_type:'sessionCookieStorage'});
  }
  // List of all namespace storage
  $.namespaceStorages={};
  // Remove all items in all storages
  $.removeAllStorages=function(reinit_ns){
    $.localStorage.removeAll(reinit_ns);
    $.sessionStorage.removeAll(reinit_ns);
    if($.cookieStorage) $.cookieStorage.removeAll(reinit_ns);
    if(!reinit_ns){
      $.namespaceStorages={};
    }
  }
}));

(function() {
  var EmojidexCategories, EmojidexData, EmojidexEmoji, EmojidexIndexes, EmojidexSearch, EmojidexShared, EmojidexUser, EmojidexUserFavorites, EmojidexUserHistory, EmojidexUtil,
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
      this.util = new EmojidexUtil;
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

    EmojidexEmoji.prototype.search = function(term, callback, opts) {
      var moji, results;
      if (callback == null) {
        callback = null;
      }
      if (opts == null) {
        opts = {};
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

    EmojidexEmoji.prototype.starting = function(term, callback, opts) {
      var moji, results;
      if (callback == null) {
        callback = null;
      }
      if (opts == null) {
        opts = {};
      }
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
      if (callback) {
        callback(results);
      }
      return results;
    };

    EmojidexEmoji.prototype.ending = function(term, callback, opts) {
      var moji, results;
      if (callback == null) {
        callback = null;
      }
      if (opts == null) {
        opts = {};
      }
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
      if (callback) {
        callback(results);
      }
      return results;
    };

    EmojidexEmoji.prototype.tags = function(tags, callback, opts) {
      var collect, moji, selection, tag, _i, _len;
      if (callback == null) {
        callback = null;
      }
      if (opts == null) {
        opts = {};
      }
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

    EmojidexEmoji.prototype.categories = function(categories, callback, opts) {
      var category, collect, moji, source, _i, _len;
      if (callback == null) {
        callback = null;
      }
      if (opts == null) {
        opts = {};
      }
      categories = this.util.breakout(categories);
      source = opts.selection || this._emoji;
      collect = [];
      for (_i = 0, _len = categories.length; _i < _len; _i++) {
        category = categories[_i];
        $.extend(collect, (function() {
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

    EmojidexEmoji.prototype.advanced = function(term, tags, categories, callback, opts) {
      if (tags == null) {
        tags = [];
      }
      if (categories == null) {
        categories = [];
      }
      if (callback == null) {
        callback = null;
      }
      if (opts == null) {
        opts = {};
      }
      return this.categories(categories, null, {
        selection: this.tags(tags, null, {
          selection: this.search(term)
        })
      });
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
      if (!this.S.closed_net) {
        opts = this._combine_opts(opts);
        $.getJSON(this.S.api_url + 'search/emoji?' + $.param($.extend({}, {
          code_ew: this.Util.escape_term(term)
        }, opts))).error(function(response) {
          return _this.results = [];
        }).success(function(response) {
          return _this._succeed(response, callback);
        });
      } else {
        this.S.Emoji.ending(term, callback);
      }
      return this.S.Emoji.ending(term);
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
      if (!this.S.closed_net) {
        opts = this._combine_opts(opts);
        $.getJSON(this.S.api_url + 'search/emoji?' + $.param($.extend({}, {
          "tags[]": this.Util.breakout(tags)
        }, opts))).error(function(response) {
          return _this.results = [];
        }).success(function(response) {
          return _this._succeed(response, callback);
        });
      } else {
        this.S.Emoji.tags(tags, callback);
      }
      return this.S.Emoji.tags(tags);
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
      if (!this.S.closed_net) {
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
        $.getJSON(this.S.api_url + 'search/emoji?' + $.param($.extend(params, opts))).error(function(response) {
          return _this.results = [];
        }).success(function(response) {
          return _this._succeed(response, callback);
        });
      } else {
        this.S.Emoji.advanced(term, tags, categories, callback);
      }
      return this.S.Emoji.advanced(term, tags, categories);
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
    function EmojidexUserFavorites(shared, token) {
      if (shared == null) {
        shared = null;
      }
      if (token == null) {
        token = null;
      }
      this.S = shared || new EmojidexShared;
      this.token = token;
      this._favorites = this.S.Data.favorites();
    }

    EmojidexUserFavorites.prototype.all = function() {
      return this._favorites;
    };

    EmojidexUserFavorites.prototype.get = function() {
      var _this = this;
      if (this.token != null) {
        $.getJSON(this.S.api_url + 'users/favorites?' + $.param({
          auth_token: this.token
        })).success(function(response) {
          return _this._favorites = _this.S.Data.favorites(response);
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
          url: this.S.api_url + 'users/favorites',
          data: {
            auth_token: this.token,
            emoji_code: emoji_code
          },
          success: function(response) {
            _this._favorites.push(response);
            return _this.S.Data.favorites(_this._favorites);
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
          url: this.S.api_url + 'users/favorites',
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
    function EmojidexUserHistory(shared, token) {
      if (shared == null) {
        shared = null;
      }
      if (token == null) {
        token = null;
      }
      this.S = shared || new EmojidexShared;
      this.token = token;
      this._history = this.S.Data.history();
    }

    EmojidexUserHistory.prototype.all = function() {
      return this._history;
    };

    EmojidexUserHistory.prototype.get = function(opts) {
      var _this = this;
      if (this.token != null) {
        $.getJSON(this.S.api_url + 'users/history?' + $.param({
          auth_token: this.token
        })).success(function(response) {
          return _this._history = _this.S.Data.history(response);
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
          url: this.S.api_url + 'users/history',
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
                _this.S.Data.history(_this._history);
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
          code: this.Util.escape_term(moji.code),
          img_url: "" + this.cdn_url + "/" + size_code + "/" + (this.Util.escape_term(moji.code)) + ".png"
        });
      }
      return _results;
    };

    return EmojidexUtil;

  })();

}).call(this);
