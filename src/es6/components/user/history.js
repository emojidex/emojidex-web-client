class EmojidexUserHistory {
  constructor(EC, token) {
    this.EC = EC;
    this.token = token;
    this._history = this.EC.Data.history();
  }

  _historyAPI(options) {
    if (this.token != null) {
      let ajax_obj = {
        url: this.EC.api_url + 'users/history',
        dataType: 'json'
      };
      return $.ajax($.extend(ajax_obj, options));
    }
  }

  get(callback) {
    let options = {
      data: {
        auth_token: this.token
      },
      success: response => {
        this._history = response;
        this.EC.Data.history(response);
        return __guardFunc__(callback, f => f(this._history));
      }
    };
    return this._historyAPI(options);
  }

  set(emoji_code) {
    let options = {
      type: 'POST',
      data: {
        auth_token: this.token,
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
    if (this._history != null) {
      __guardFunc__(callback, f => f(this._history));
    } else {
      setTimeout((() => {
        return this.all(callback);
      }
      ), 500);
    }
    return this._history;
  }
}

function __guardFunc__(func, transform) {
  return typeof func === 'function' ? transform(func) : undefined;
}