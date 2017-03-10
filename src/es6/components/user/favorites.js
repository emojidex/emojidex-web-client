export default class EmojidexUserFavorites {
  constructor(EC, token) {
    this.EC = EC;
    this.token = token;
    this._favorites = this.EC.Data.favorites();
  }

  _favoritesAPI(options) {
    if (this.token != null) {
      let ajax_obj = {
        url: this.EC.api_url + 'users/favorites',
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
        this._favorites = response;
        this.EC.Data.favorites(response);
        return __guardFunc__(callback, f => f(this._favorites));
      }
    };
    return this._favoritesAPI(options);
  }

  set(emoji_code) {
    let options = {
      type: 'POST',
      data: {
        auth_token: this.token,
        emoji_code
      },
      success: response => {
        this._favorites.push(response);
        return this.EC.Data.favorites(this._favorites);
      }
    };
    return this._favoritesAPI(options);
  }

  unset(emoji_code) {
    let options = {
      type: 'DELETE',
      data: {
        auth_token: this.token,
        emoji_code
      },
      success: response => {
        return this.sync();
      }
    };
    return this._favoritesAPI(options);
  }

  sync() {
    return this.get(); // persistant favorites currently require an account
  }

  all(callback) {
    if (this._favorites != null) {
      __guardFunc__(callback, f => f(this._favorites));
    } else {
      setTimeout((() => {
        return this.all(callback);
      }
      ), 500);
    }
    return this._favorites;
  }
}

function __guardFunc__(func, transform) {
  return typeof func === 'function' ? transform(func) : undefined;
}
