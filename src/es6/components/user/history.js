import axios from 'axios'

export default class EmojidexUserHistory {
  constructor(EC) {
    this.EC = EC
    this._history = this.EC.Data.history()
    this.curPage = 1
    this.maxPage = undefined
  }

  _historyAPI(options) {
    if (this.EC.User.authInfo.token === null || this.EC.User.authInfo.token === undefined) {
      return Promise.reject(new Error('Require auth token.'))
    }

    return axios({
      method: options.type,
      url: options.url ? options.url : `${this.EC.apiUrl}users/history`,
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
      },
      url: this.EC.apiUrl + 'users/history/emoji'
    }
    return this._historyAPI(options).then(response => {
      this._history = response.emoji
      this.meta = response.meta
      this.curPage = response.meta.page
      this.maxPage = Math.ceil(response.meta.total_count / this.EC.limit)

      return this.EC.Data.history(this._history)
    }).then(() => {
      if (typeof callback === 'function') {
        callback(this._history)
      } else {
        return this._history
      }
    }).catch(error => {
      console.error(error)
    })
  }

  getHistoryInfoOnly(callback, page = 1) {
    const options = {
      params: {
        page,
        limit: this.EC.limit,
        detailed: this.EC.detailed,
        auth_token: this.EC.User.authInfo.token // eslint-disable-line camelcase
      }
    }
    return this._historyAPI(options).then(response => {
      this._historyInfo = response.history
      this.historyInfoMeta = response.meta
      this.historyInfoCurPage = response.meta.page
      this.historyInfoMaxPage = Math.ceil(response.meta.total_count / this.EC.limit)

      if (typeof callback === 'function') {
        callback(this._historyInfo)
      } else {
        return this._historyInfo
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
    return this._historyAPI(options).then(response => {
      for (let i = 0; i < this._history.length; i++) {
        const entry = this._history[i]
        if (entry.emoji_code === response.emoji_code) {
          this._history[i] = response
          this.EC.Data.history(this._history)
          return
        }
      }

      return response
    }).catch(error => {
      console.error(error)
    })
  }

  sync() {
    return this.get()
  }

  all(callback) {
    return this.EC.Data.history().then(data => {
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
