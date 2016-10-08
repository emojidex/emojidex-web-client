class EmojidexSearch {
  constructor(EC) {
    this.EC = EC;
    this.Util = new EmojidexUtil();
    this.results = [];
    this.cur_page = 1;
    this.count = 0;
  }

  _searchAPI(search_data, callback, opts, call_func) {
    let param = {
      page: 1,
      limit: this.EC.limit,
      detailed: this.EC.detailed
    };
    if (this.EC.User.auth_info.token !== null) {
      $.extend(param, {auth_token: this.EC.User.auth_info.token});
    }
    $.extend(param, opts);

    // TODO -------
    // @searched_func = unless @EC.closed_net then funx.ajax else call_func.storage
    this.searched_func = call_func.ajax;
    this.searched = {
      data: search_data,
      callback,
      param
    };

    if (!this.EC.closed_net) {
      return $.ajax({
        url: this.EC.api_url + 'search/emoji',
        dataType: 'json',
        data: param,
        success: response => {
          if (response.status != null) {
            this.results = [];
            this.cur_page = 0;
            this.count = 0;
            return __guardFunc__(callback, f => f([]));
          } else {
            this.meta = response.meta;
            this.results = response.emoji;
            this.cur_page = response.meta.page;
            this.count = response.meta.count;
            return this.EC.Emoji.combine(response.emoji).then(data => __guardFunc__(callback, f1 => f1(response.emoji)));
          }
        },
        error: response => {
          this.results = [];
          this.cur_page = 0;
          this.count = 0;
          return __guardFunc__(callback, f => f([]));
        }});
    } else {
      return __guardFunc__(call_func.storage, f => f(search_data, callback));
    }
  }

  // Executes a general search (code_cont)
  search(term, callback, opts) {
    opts = $.extend({code_cont: this.EC.Util.escapeTerm(term)}, opts);
    return this._searchAPI(term, callback, opts, {ajax: this.search, storage: this.EC.Emoji.search});
  }

  // Executes a search starting with the given term
  starting(term, callback, opts) {
    opts = $.extend({code_sw: this.Util.escapeTerm(term)}, opts);
    return this._searchAPI(term, callback, opts, {ajax: this.starting, storage: this.EC.Emoji.starting});
  }

  // Executes a search ending with the given term
  ending(term, callback, opts) {
    opts = $.extend({code_ew: this.Util.escapeTerm(term)}, opts);
    return this._searchAPI(term, callback, opts, {ajax: this.ending, storage: this.EC.Emoji.ending});
  }

  // Searches by tags
  tags(tags, callback, opts) {
    opts = $.extend({"tags[]": this.Util.breakout(tags)}, opts);
    return this._searchAPI(tags, callback, opts, {ajax: this.tags, storage: this.EC.Emoji.tags});
  }

  // Searches using an array of keys and an array of tags
  advanced(search_details, callback, opts) {
    let param = {
      code_cont: this.Util.escapeTerm(search_details.term),
      "tags[]": this.Util.breakout(search_details.tags),
      "categories[]": this.Util.breakout(search_details.categories)
    };
    $.extend(param, opts);
    return this._searchAPI(search_details, callback, param, {ajax: this.advanced, storage: this.EC.Emoji.advanced});
  }

  // Not an actual search, just gets information on the given emoji
  find(code, callback, opts) {
    let emoji_cache = this.EC.Data.emoji();
    for (let i = 0; i < emoji_cache.length; i++) {
      let emoji = emoji_cache[i];
      if (emoji.code === code) {
        __guardFunc__(callback, f => f(emoji));
        return emoji;
      }
    }

    let param =
      {detailed: this.EC.detailed};
    if (this.EC.User.auth_info.token !== null) {
      $.extend(param, {auth_token: this.EC.User.auth_info.token});
    }
    $.extend(param, opts);

    return $.ajax({
      url: this.EC.api_url + `emoji/${this.EC.Util.makeURLSafe(code)}`,
      dataType: 'json',
      data: param,
      success: response => {
        this.EC.Emoji.combine([response]);
        __guardFunc__(callback, f1 => f1(response));
        return response;
      },
      error: response => {
        __guardFunc__(callback, f1 => f1(response));
        return response;
      }
    });
  }

  next() {
    if (this.count === this.searched.param.limit) { this.searched.param.page++; }
    return this.searched_func(this.searched.data, this.searched.callback, this.searched.param, {ajax: this.searched_func});
  }

  prev() {
    if (this.searched.param.page > 1) { this.searched.param.page--; }
    return this.searched_func(this.searched.data, this.searched.callback, this.searched.param, {ajax: this.searched_func});
  }
}

function __guardFunc__(func, transform) {
  return typeof func === 'function' ? transform(func) : undefined;
}