import EmojidexUserFavorites from './user/favorites'
import EmojidexUserHistory from './user/history'
import EmojidexUserFollow from './user/follow'
import axios from 'axios'

export default class EmojidexUser {
  constructor(EC) {
    this.EC = EC
    this.authInfo = this.EC.Data.defaultAuthInfo
    this.History = new EmojidexUserHistory(this.EC)
    this.Favorites = new EmojidexUserFavorites(this.EC)
    this.Follow = new EmojidexUserFollow(this.EC)
  }
  // @_auto_login()

  // Checks for local saved login data, and if present sets the username and api_key
  _autoLogin() {
    if (typeof this.EC.Data.storage.hubCache !== 'undefined' &&
        typeof this.EC.Data.storage.hubCache.emojidex !== 'undefined' &&
        typeof this.EC.Data.storage.hubCache.emojidex.auth_info !== 'undefined' &&
        this.EC.Data.storage.hubCache.emojidex.auth_info.status === 'verified') {
      return this.syncUserData()
    }
  }

  // login
  // takes a hash with one of the following combinations:
  // 1. {authtype: 'plain', username: 'username', password: '****'}
  // 2. {authtype: 'token', username: 'username', auth_token: '****'}
  // 3. {authtype: 'basic', user: 'username-or-email', password: '****'}
  // 4. {authtype: 'session'} return auth_info in localstorage.
  // * if no hash is given auto login is attempted
  login(params) {
    if (!params) {
      return this._autoLogin()
    }

    switch (params.authtype) {
      case 'plain':
        return this.plainAuth(params.username, params.password, params.callback)
      case 'token':
        return this.tokenAuth(params.username, params.auth_token, params.callback)
      case 'basic':
        return this.basicAuth(params.user, params.password, params.callback)
      case 'session':
        if (typeof this.EC.Data.storage.hubCache !== 'undefined' &&
            typeof this.EC.Data.storage.hubCache.emojidex !== 'undefined' &&
            typeof this.EC.Data.storage.hubCache.emojidex.auth_info !== 'undefined' &&
            this.EC.Data.storage.hubCache.emojidex.auth_info.status === 'verified') {
          this.authInfo = this.EC.Data.storage.hubCache.emojidex.auth_info
          return this.authInfo
        }

        break
      default:
        return this._autoLogin()
    }
  }

  // logout:
  // 'logs out' by clearing user data
  logout() {
    return this.EC.Data.authInfo(this.EC.Data.defaultAuthInfo)
  }

  _authenticateAPI(params, callback) {
    return axios.get(`${this.EC.apiUrl}users/authenticate`, {
      params
    }).then(response => {
      return this._setAuthFromResponse(response.data).then(() => {
        if (typeof callback === 'function') {
          callback(this.authInfo)
        } else {
          return this.authInfo
        }
      })
    }).catch(error => {
      this.authInfo = {
        status: error.response.data.auth_status,
        token: null,
        user: ''
      }
      return this.EC.Data.authInfo(this.EC.Data.authInfo).then(() => {
        if (typeof callback === 'function') {
          callback({
            authInfo: this.authInfo,
            errorInfo: error.response
          })
        } else {
          return {
            authInfo: this.authInfo,
            errorInfo: error.response
          }
        }
      })
    })
  }

  // regular login with username/email and password
  plainAuth(username, password, callback) {
    return this._authenticateAPI({
      username,
      password
    },
    callback)
  }

  tokenAuth(username, token, callback) {
    return this._authenticateAPI({
      username,
      token
    },
    callback)
  }

  // auth with HTTP basic auth
  basicAuth(user, password, callback) {
    return this._authenticateAPI({
      user,
      password
    },
    callback)
  }

  // sets auth parameters from a successful auth request [login]
  _setAuthFromResponse(response) {
    return this.EC.Data.authInfo({
      status: response.auth_status,
      token: response.auth_token,
      user: response.auth_user,
      r18: response.r18,
      premium: response.premium,
      premiumExp: response.premium_exp,
      pro: response.pro,
      proExp: response.pro_exp
    }).then(data => {
      this.syncUserData()
      return data
    }).catch(error => {
      console.error(error)
    })
  }

  syncUserData() {
    this.authInfo = this.EC.Data.storage.get('emojidex.auth_info')
    this.Favorites.sync()
    this.History.sync()
    this.Follow.sync()
  }
}
