export default class EmojidexUserHistory {
  constructor(EC) {
    this.EC = EC;
    this._history = this.EC.Data.history();
    this.cur_page = 1;
    this.max_page = undefined;
  }

  _historyAPI(options) {
    if (this.EC.User.auth_info.token != null) {
      let ajax_obj = {
        url: this.EC.api_url + 'users/history',
        dataType: 'json'
      };
      return $.ajax($.extend(ajax_obj, options));
    }
  }

  get(callback, page = 1) {
    let options = {
      data: {
        page: page,
        limit: this.EC.limit,
        detailed: this.EC.detailed,
        auth_token: this.EC.User.auth_info.token
      },
      success: response => {
        this._history = response.history
        this.meta = response.meta;
        this.cur_page = response.meta.page;
        this.max_page = Math.ceil(response.total_count / this.EC.limit);
        this.EC.Data.history(response.history).then(data => {
          if (typeof callback === 'function') { callback(this._history); }
        });
      }
    };
    return this._historyAPI(options);
  }

  set(emoji_code) {
    let options = {
      type: 'POST',
      data: {
        auth_token: this.EC.User.auth_info.token,
        emoji_code
      },
      success: response => {
        for (let i = 0; i < this._history.length; i++) {
          let entry = this._history[i];
          if (entry.emoji_code === response.emoji_code) {
            this._history[i] = response;
            this.EC.Data.history(this._history);
            return response;
          }
        }
      }
    };
    return this._historyAPI(options);
  }

  sync() {
    return this.get();
  }

  all(callback) {
    return this.EC.Data.history().then(data => {
      if (typeof callback === 'function') {
        callback(data);
      } else {
        return data;
      }
    });
  }

  next(callback) {
    if (this.max_page === this.cur_page) return;
    return this.get(callback, this.cur_page + 1);
  }

  prev(callback) {
    if (this.cur_page === 1) return;
    return this.get(callback, this.cur_page - 1);
  }
}
