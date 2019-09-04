import axios from 'axios'

export default class EmojidexUserHistory {
  constructor(EC) {
    this.EC = EC
    this.EC.Data.history().then(history => {
      this._history = history
    })
    this.curPage = 1
    this.maxPage = undefined
  }

  async _historyAPI(options) {
    if (!this.EC.User.authInfo.token) {
      return Promise.reject(new Error('Require auth token.'))
    }

    try {
      const response = await axios({
        method: options.type,
        url: options.url ? options.url : `${this.EC.apiUrl}users/history`,
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
      },
      url: this.EC.apiUrl + 'users/history/emoji'
    }

    try {
      const response = await this._historyAPI(options)
      this._history = response.emoji
      this.meta = response.meta
      this.curPage = response.meta.page
      this.maxPage = Math.ceil(response.meta.total_count / this.EC.limit)
      await this.EC.Data.history(this._history)
      return this._history
    } catch (error) {
      console.error(error)
    }
  }

  async getHistoryInfoOnly(page = 1) {
    const options = {
      params: {
        page,
        limit: this.EC.limit,
        detailed: this.EC.detailed,
        auth_token: this.EC.User.authInfo.token // eslint-disable-line camelcase
      }
    }

    try {
      const response = await this._historyAPI(options)
      this._historyInfo = response.history
      this.historyInfoMeta = response.meta
      this.historyInfoCurPage = response.meta.page
      this.historyInfoMaxPage = Math.ceil(response.meta.total_count / this.EC.limit)
      if (this.historyInfoMeta.total_count % this.EC.limit > 0) {
        this.historyInfoMaxPage++
      }

      return this._historyInfo
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
      const response = await this._historyAPI(options)
      this._history = await this.EC.Data.history(response)
      return this._history
    } catch (error) {
      console.error(error)
    }
  }

  sync() {
    return this.get()
  }

  all() {
    try {
      return this.EC.Data.history()
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
