import axios from 'axios'

export default class EmojidexUserFavorites {
  constructor(EC) {
    this.EC = EC
    this._favorites = this.EC.Data.favorites()
    this.cur_page = 1
    this.max_page = undefined
  }

  _favoritesAPI(options) {
    if (this.EC.User.authInfo.token === null || this.EC.User.authInfo.token === undefined) {
      return Promise.reject(new Error('Require auth token.'))
    }

    return axios({
      method: options.type,
      url: `${this.EC.apiUrl}users/favorites`,
      params: options.params,
      data: options.data
    }).then(response => {
      return response.data
    }).catch(error => {
      return error.response
    })
  }

  get(callback, page = 1) {
    const options = {
      params: {
        page,
        limit: this.EC.limit,
        detailed: this.EC.detailed,
        auth_token: this.EC.User.authInfo.token
      }
    }
    return this._favoritesAPI(options).then(response => {
      this._favorites = response.emoji
      this.meta = response.meta
      this.cur_page = response.meta.page
      this.max_page = Math.ceil(response.total_count / this.EC.limit)

      return this.EC.Data.favorites(this._favorites)
    }).then(() => {
      if (typeof callback === 'function') {
        callback(this._favorites)
      } else {
        return this._favorites
      }
    }).catch(error => {
      console.error(error)
    })
  }

  set(emoji_code) {
    const options = {
      type: 'POST',
      params: { auth_token: this.EC.User.authInfo.token },
      data: { emoji_code }
    }
    return this._favoritesAPI(options).then(response => {
      this._favorites.push(response)
      return this.EC.Data.favorites(this._favorites)
    }).catch(error => {
      console.error(error)
    })
  }

  unset(emoji_code) {
    const options = {
      type: 'DELETE',
      params: { auth_token: this.EC.User.authInfo.token },
      data: { emoji_code }
    }
    return this._favoritesAPI(options).then(response => {
      return this.sync()
    }).catch(error => {
      console.error(error)
    })
  }

  sync() {
    return this.get() // persistant favorites currently require an account
  }

  all(callback) {
    return this.EC.Data.favorites().then(data => {
      if (typeof callback === 'function') {
        callback(data)
      } else {
        return data
      }
    }).catch(error => {
      console.error(error)
    })
  }

  next(callback) {
    if (this.max_page === this.cur_page) {
      return
    }

    return this.get(callback, this.cur_page + 1)
  }

  prev(callback) {
    if (this.cur_page === 1) {
      return
    }

    return this.get(callback, this.cur_page - 1)
  }
}
