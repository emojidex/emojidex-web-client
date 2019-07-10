import axios from 'axios'

export default class EmojidexUserFavorites {
  constructor(EC) {
    this.EC = EC
    this._favorites = this.EC.Data.favorites()
    this.curPage = 1
    this.maxPage = undefined
  }

  _favoritesAPI(options) {
    if (this.EC.User.authInfo.token === null || this.EC.User.authInfo.token === undefined) {
      return Promise.reject(new Error('Require auth token.'))
    }

    return axios({
      method: options.type,
      url: `${this.EC.apiUrl}users/favorites`,
      params: options.params
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
        auth_token: this.EC.User.authInfo.token // eslint-disable-line camelcase
      }
    }
    return this._favoritesAPI(options).then(response => {
      this._favorites = response.emoji
      this.meta = response.meta
      this.curPage = response.meta.page
      this.maxPage = Math.ceil(response.total_count / this.EC.limit)

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

  set(emojiCode) {
    const options = {
      type: 'POST',
      params: { auth_token: this.EC.User.authInfo.token, emoji_code: emojiCode } // eslint-disable-line camelcase
    }
    return this._favoritesAPI(options).then(response => {
      this._favorites.push(response)
      return this.EC.Data.favorites(this._favorites)
    }).catch(error => {
      console.error(error)
    })
  }

  unset(emojiCode) {
    const options = {
      type: 'DELETE',
      params: { auth_token: this.EC.User.authInfo.token, emoji_code: emojiCode } // eslint-disable-line camelcase
    }
    return this._favoritesAPI(options).then(() => {
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
    if (this.maxPage === this.curPage) {
      return
    }

    return this.get(callback, this.curPage + 1)
  }

  prev(callback) {
    if (this.curPage === 1) {
      return
    }

    return this.get(callback, this.curPage - 1)
  }
}
