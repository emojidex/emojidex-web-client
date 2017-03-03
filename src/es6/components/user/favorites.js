export default class EmojidexUserFavorites {
  constructor(EC, token) {
    this.EC = EC;
    this.token = token;
    this._favorites = this.EC.Data.favorites();
    this.cur_page = 1;
    this.max_page = undefined;
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

  get(callback, page = 1) {
    let options = {
      data: {
        page: page,
        limit: this.EC.limit,
        detailed: this.EC.detailed,
        auth_token: this.token
      },
      success: response => {
        this._favorites = response;
        this.cur_page = response.meta.page;
        this.max_page = Math.ceil(response.total_count / this.EC.limit);
        this.EC.Data.favorites(response);
        // TODO: favorites.combine
        if (typeof callback === 'function') { callback(this._favorites); }
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
      if (typeof callback === 'function') { callback(this._favorites); }
    } else {
      setTimeout((() => {
        return this.all(callback);
      }
      ), 500);
    }
    return this._favorites;
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
