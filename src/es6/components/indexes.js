import axios from 'axios'

export default class EmojidexIndexes {
  constructor(EC) {
    this.EC = EC;
    this.results = [];
    this.cur_page = 1;
    this.count = 0;
  }

  _indexesAPI(query, callback, opts, func) {
    let param = {
      page: 1,
      limit: this.EC.limit,
      detailed: this.EC.detailed
    };
    if (this.EC.User.auth_info.token !== null) {
      $.extend(param, {auth_token: this.EC.User.auth_info.token});
    }
    $.extend(param, opts);

    if (func != null) {
      this.indexed_func = func;
      this.indexed = {
        query,
        callback,
        param
      };
    }

    return axios.get(`${this.EC.api_url}${query}`, {
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
        return this.EC.Emoji.combine(response.data.emoji).then(data => {
          if (typeof callback === 'function') { callback(response.data.emoji); }
        });
      }
    }).catch(response => {
      this.results = [];
      this.cur_page = 0;
      this.count = 0;
      if (typeof callback === 'function') { callback([]); }
    });
  }

  index(callback, opts) {
    return this._indexesAPI('emoji', callback, opts, this.index);
  }

  newest(callback, opts) {
    return this._indexesAPI('newest', callback, opts, this.newest);
  }

  popular(callback, opts) {
    return this._indexesAPI('popular', callback, opts, this.popular);
  }

  user(username, callback, opts) {
    return this._indexesAPI(`users/${username}/emoji`, callback, opts);
  }

  static(static_type, language, callback) {
    let loaded_num = 0;
    let loaded_emoji = [];

    let loadStatic = url_string => {
      return axios.get(url_string).then(response => {
        loaded_emoji = loaded_emoji.concat(response.data);
        if (++loaded_num === static_type.length) {
          return this.EC.Emoji.combine(loaded_emoji).then(data => {
            if (typeof callback === 'function') { callback(data); }
          });
        }
      });
    };

    return static_type.map((type) =>
      language ?
        loadStatic(`${this.EC.api_url + type}?locale=${language}`)
      :
        loadStatic(`${this.EC.api_url + type}`));
  }

  select(code, callback, opts) {
    return this.EC.Search.find(code, callback, opts);
  }

  next() {
    if (this.count === this.indexed.param.limit) { this.indexed.param.page++; }
    return this.indexed_func(this.indexed.callback, this.indexed.param, this.indexed_func);
  }

  prev() {
    if (this.indexed.param.page > 1) { this.indexed.param.page--; }
    return this.indexed_func(this.indexed.callback, this.indexed.param, this.indexed_func);
  }
}
