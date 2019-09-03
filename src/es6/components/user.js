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

  // Checks for local saved login data, and if present sets the username and api_key
  async _autoLogin() {
    const status = await this.EC.Data.storage.get('emojidex.auth_info.status')
    if (status === 'verified') {
      await this.syncUserData()
      return this.authInfo
    }
  }

  // login
  // takes a hash with one of the following combinations:
  // 1. {authtype: 'plain', username: 'username', password: '****'}
  // 2. {authtype: 'token', username: 'username', auth_token: '****'}
  // 3. {authtype: 'basic', user: 'username-or-email', password: '****'}
  // 4. {authtype: 'session'} return auth_info in localstorage.
  // * if no hash is given auto login is attempted
  async login(params) {
    if (!params) {
      return this._autoLogin()
    }

    switch (params.authtype) {
      case 'plain':
        return this.plainAuth(params.username, params.password)
      case 'token':
        return this.tokenAuth(params.username, params.auth_token)
      case 'basic':
        return this.basicAuth(params.user, params.password)
      case 'session':
        return this._autoLogin()
      default:
        return this._autoLogin()
    }
  }

  // logout:
  // 'logs out' by clearing user data
  async logout() {
    this.authInfo = this.EC.Data.defaultAuthInfo
    await this.EC.Data.storage.update('emojidex', {
      history: [],
      favorites: [],
      auth_info: this.authInfo // eslint-disable-line camelcase
    })
  }

  async _authenticateAPI(params) {
    try {
      const response = await axios.get(`${this.EC.apiUrl}users/authenticate`, { params })
      await this._setAuthFromResponse(response.data)
      return this.authInfo
    } catch (error) {
      if (error.response.status !== 401) {
        console.error(error)
        return
      }

      this.authInfo = {
        status: error.response.data.auth_status,
        token: null,
        user: ''
      }
      return this.EC.Data.authInfo(this.authInfo)
    }
  }

  // regular login with username/email and password
  async plainAuth(username, password) {
    return this._authenticateAPI({
      username,
      password
    })
  }

  async tokenAuth(username, token) {
    return this._authenticateAPI({
      username,
      token
    })
  }

  // auth with HTTP basic auth
  async basicAuth(user, password) {
    return this._authenticateAPI({
      user,
      password
    })
  }

  // sets auth parameters from a successful auth request [login]
  async _setAuthFromResponse(response) {
    try {
      await this.EC.Data.authInfo({
        status: response.auth_status,
        token: response.auth_token,
        user: response.auth_user,
        r18: response.r18,
        premium: response.premium,
        premiumExp: response.premium_exp,
        pro: response.pro,
        proExp: response.pro_exp
      })
      return this.syncUserData()
    } catch (error) {
      console.error(error)
    }
  }

  async syncUserData() {
    this.authInfo = await this.EC.Data.authInfo()
    await this.Favorites.sync()
    await this.History.sync()
    await this.Follow.sync()
  }

  isSubscriber() {
    return this.authInfo.premium || this.authInfo.pro
  }
}
