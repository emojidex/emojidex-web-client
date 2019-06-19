import axios from 'axios'
import _extend from 'lodash/extend'

export default class EmojidexSearch {
  constructor(EC) {
    this.EC = EC;
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
    if (this.EC.User.auth_info.token !== null) { _extend(param, { auth_token: this.EC.User.auth_info.token }); }
    _extend(param, opts);

    // TODO -------
    // @searched_func = unless @EC.closed_net then funx.ajax else call_func.storage
    this.searched_func = call_func.ajax;
    this.searched = {
      data: search_data,
      callback,
      param
    };

    return axios.get(`${this.EC.api_url}search/emoji`, {
      params: param
    }).then(response => {
      if (response.data.status != null) {
        this.results = [];
        this.cur_page = 0;
        this.count = 0;
        if (typeof callback === 'function') { callback([]); }
      } else {
        this.meta = response.data.meta;
        this.results = response.data.emoji;
        this.cur_page = response.data.meta.page;
        this.count = response.data.meta.count;
        this.EC.Emoji.combine(response.data.emoji)
        if (typeof callback === 'function') { callback(response.data.emoji); }
      }
    }).catch(response => {
      this.results = [];
      this.cur_page = 0;
      this.count = 0;
      if (typeof callback === 'function') { callback([]); }
    });
  }

  // Executes a general search (code_cont)
  search(term, callback, opts) {
    opts = _extend({ code_cont: this.EC.Util.escapeTerm(term) }, opts);
    return this._searchAPI(term, callback, opts, {ajax: this.search, storage: this.EC.Emoji.search});
  }

  // Executes a search starting with the given term
  starting(term, callback, opts) {
    opts = _extend({ code_sw: this.EC.Util.escapeTerm(term) }, opts);
    return this._searchAPI(term, callback, opts, {ajax: this.starting, storage: this.EC.Emoji.starting});
  }

  // Executes a search ending with the given term
  ending(term, callback, opts) {
    opts = _extend({ code_ew: this.EC.Util.escapeTerm(term) }, opts);
    return this._searchAPI(term, callback, opts, {ajax: this.ending, storage: this.EC.Emoji.ending});
  }

  // Searches by tags
  tags(tags, callback, opts) {
    opts = _extend({ 'tags': this.EC.Util.breakout(tags) }, opts);
    return this._searchAPI(tags, callback, opts, {ajax: this.tags, storage: this.EC.Emoji.tags});
  }

  // Searches using an array of keys and an array of tags
  advanced(search_details, callback, opts) {
    let param = {
      code_cont: this.EC.Util.escapeTerm(search_details.term),
      "tags": this.EC.Util.breakout(search_details.tags),
      "categories": this.EC.Util.breakout(search_details.categories)
    };
    _extend(param, opts);
    return this._searchAPI(search_details, callback, param, { ajax: this.advanced, storage: this.EC.Emoji.advanced });
  }

  // Not an actual search, just gets information on the given emoji
  find(code, callback = null, opts) {
    let emoji_cache = this.EC.Data.emoji();
    code = this.EC.Util.deEscapeTerm(code);
    for (let i = 0; i < emoji_cache.length; i++) {
      let emoji = emoji_cache[i];
      if (emoji.code === code) {
        if (typeof callback === 'function') { callback(emoji); }
        return Promise.resolve(emoji);
      }
    }

    let param = { detailed: this.EC.detailed };
    if (this.EC.User.auth_info.token !== null) { _extend(param, { auth_token: this.EC.User.auth_info.token }); }
    _extend(param, opts);

    return axios.get(`${this.EC.api_url}emoji/${this.EC.Util.makeURLSafe(code)}`, {
    }).then(response => {
      this.EC.Emoji.combine([response.data]);
      if (typeof callback === 'function') { callback(response.data); }
      return response.data;
    }).catch(response => {
      if (typeof callback === 'function') { callback(response.response); }
      return response.response;
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
