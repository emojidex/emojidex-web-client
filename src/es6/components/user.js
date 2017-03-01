import EmojidexUserFavorites from './user/favorites'
import EmojidexUserHistory from './user/history'

export default class EmojidexUser {
  constructor(EC) {
    this.EC = EC;
    this.auth_info = this.EC.Data._def_auth_info;
    this.History = new EmojidexUserHistory(this.EC);
    this.Favorites = new EmojidexUserFavorites(this.EC);
  }
    // @_auto_login()

  // Checks for local saved login data, and if present sets the username and api_key
  _autoLogin() {
    if (typeof this.EC.Data.storage.hub_cache !== 'undefined' &&
        typeof this.EC.Data.storage.hub_cache.emojidex !== 'undefined' &&
        typeof this.EC.Data.storage.hub_cache.emojidex.auth_info !== 'undefined' &&
        this.EC.Data.storage.hub_cache.emojidex.auth_info.status === 'verified') {
      this.auth_info = this.EC.Data.storage.hub_cache.emojidex.auth_info;
      return this.syncUserData();
    }
  }

  // login
  // takes a hash with one of the following combinations:
  // 1. {authtype: 'plain', username: 'username', password: '****'}
  // 2. {authtype: 'token', username: 'username', auth_token: '****'}
  // 3. {authtype: 'basic', user: 'username-or-email', password: '****'}
  // * if no hash is given auto login is attempted
  login(params) {
    switch (params.authtype) {
      case 'plain':
        return this.plainAuth(params.username, params.password, params.callback);
      case 'token':
        return this.tokenAuth(params.username, params.auth_token, params.callback);
      case 'basic':
        return this.basicAuth(params.user, params.password, params.callback);
      case 'session':
      if (typeof this.EC.Data.storage.hub_cache !== 'undefined' &&
          typeof this.EC.Data.storage.hub_cache.emojidex !== 'undefined' &&
          typeof this.EC.Data.storage.hub_cache.emojidex.auth_info !== 'undefined' &&
          this.EC.Data.storage.hub_cache.emojidex.auth_info.status === 'verified') {
          return this.auth_info = this.EC.Data.storage.hub_cache.emojidex.auth_info;
        }
      default:
        return this._autoLogin();
    }
  }

  // logout:
  // 'logs out' by clearing user data
  logout() {
    return this.EC.Data.auth_info(this.EC.Data._def_auth_info);
  }

  _authenticateAPI(options, callback) {
    let ajax_obj = {
      url: this.EC.api_url + 'users/authenticate',
      dataType: 'json',
      success: response => {
        return this._setAuthFromResponse(response).then(() => {
          if (typeof callback === 'function') { callback(this.auth_info); }
        });
      },
      error: response => {
        let status = JSON.parse(response.responseText);
        this.auth_info = {
          status: status.auth_status,
          token: null,
          user: ''
        };
        return this.EC.Data.auth_info(this.EC.Data.auth_info).then(() => {
          if (typeof callback === 'function') {
            callback({
              auth_info: this.auth_info,
              error_info: response
            });
          }
        });
      }
    };

    return $.ajax($.extend(ajax_obj, options));
  }

  // regular login with username/email and password
  plainAuth(username, password, callback) {
    return this._authenticateAPI({
      data: {
        username,
        password,
      }
    },
      callback);
  }

  tokenAuth(username, token, callback) {
    return this._authenticateAPI({
      data: {
        username,
        token,
      }
    },
      callback);
  }

  // auth with HTTP basic auth
  basicAuth(user, password, callback) {
    return this._authenticateAPI({
      data: {
        user,
        password,
      }
    },
      callback);
  }

  // directly set auth credentials
  setAuth(user, token, r18 = false, premium = false, premium_exp = null, pro = false, pro_exp = null) {
    return this.EC.Data.auth_info({
      status: 'verified',
      user,
      token,
      r18,
      premium,
      premium_exp,
      pro,
      pro_exp
    }).then(data => {
      this.auth_info = this.EC.Data.storage.get('emojidex.auth_info');
      this.syncUserData();
      return data;
    });
  }

  // sets auth parameters from a successful auth request [login]
  _setAuthFromResponse(response) {
    return this.EC.Data.auth_info({
      status: response.auth_status,
      token: response.auth_token,
      user: response.auth_user,
      r18: response.r18,
      premium: response.premium,
      premium_exp: response.premium_exp,
      pro: response.pro,
      pro_exp: response.pro_exp
    }).then(data=> {
      this.auth_info = this.EC.Data.storage.get('emojidex.auth_info');
      this.syncUserData();
      return data;
    });
  }

  syncUserData() {
    this.History.token = this.Favorites.token = this.auth_info.token;
    this.Favorites.sync();
    this.History.sync();
  }
}
