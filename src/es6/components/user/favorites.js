import axios from 'axios'

export default class EmojidexUserFavorites {
  constructor(EC) {
    this.EC = EC
    this.EC.Data.favorites().then(favorites => {
      this._favorites = favorites
    })
    this.curPage = 1
    this.maxPage = undefined
  }

  async _favoritesAPI(options) {
    if (!this.EC.User.authInfo.token) {
      return Promise.reject(new Error('Require auth token.'))
    }

    try {
      const response = await axios({
        method: options.type,
        url: `${this.EC.apiUrl}users/favorites`,
        params: options.params
      })
      return response.data
    } catch (error) {
      return error.response
    }
  }

  async get(page = 1) {
    const options = {
      params: {
        page,
        limit: this.EC.limit,
        detailed: this.EC.detailed,
        auth_token: this.EC.User.authInfo.token // eslint-disable-line camelcase
      }
    }

    try {
      const response = await this._favoritesAPI(options)
      this._favorites = response.emoji
      this.meta = response.meta
      this.curPage = response.meta.page
      this.maxPage = Math.ceil(response.meta.total_count / this.EC.limit)
      if (this.meta.total_count % this.EC.limit > 0) {
        this.maxPage++
      }

      return this.EC.Data.favorites(this._favorites)
    } catch (error) {
      console.error(error)
    }
  }

  async set(emojiCode) {
    const options = {
      type: 'POST',
      params: { auth_token: this.EC.User.authInfo.token, emoji_code: emojiCode } // eslint-disable-line camelcase
    }

    try {
      const response = await this._favoritesAPI(options)
      this._favorite = await this.EC.Data.favorites(response)
      return this._favorite
    } catch (error) {
      console.error(error)
    }
  }

  async unset(emojiCode) {
    const options = {
      type: 'DELETE',
      params: { auth_token: this.EC.User.authInfo.token, emoji_code: emojiCode } // eslint-disable-line camelcase
    }

    try {
      await this._favoritesAPI(options)
      return this.sync()
    } catch (error) {
      console.error(error)
    }
  }

  sync() {
    return this.get() // persistant favorites currently require an account
  }

  all() {
    try {
      return this.EC.Data.favorites()
    } catch (error) {
      console.error(error)
    }
  }

  next() {
    if (this.maxPage === this.curPage) {
      return
    }

    return this.get(this.curPage + 1)
  }

  prev() {
    if (this.curPage === 1) {
      return
    }

    return this.get(this.curPage - 1)
  }
}
