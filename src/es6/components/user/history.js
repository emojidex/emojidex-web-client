import axios from 'axios'

export default class EmojidexUserHistory {
  constructor(EC) {
    this.EC = EC
    this._history = this.EC.Data.history()
    this.cur_page = 1
    this.max_page = undefined
  }

  _historyAPI(options) {
    if (this.EC.User.auth_info.token === null || this.EC.User.auth_info.token === undefined) {
      return Promise.reject(new Error('Require auth token.'))
    }

    return axios({
      method: options.type,
      url: options.url ? options.url : `${this.EC.apiUrl}users/history`,
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
        auth_token: this.EC.User.auth_info.token
      },
      url: this.EC.apiUrl + 'users/history/emoji'
    }
    return this._historyAPI(options).then(response => {
      this._history = response.emoji
      this.meta = response.meta
      this.cur_page = response.meta.page
      this.max_page = Math.ceil(response.total_count / this.EC.limit)

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
        auth_token: this.EC.User.auth_info.token
      }
    }
    return this._historyAPI(options).then(response => {
      this._history_info = response.history
      this.history_info_meta = response.meta
      this.history_info_cur_page = response.meta.page
      this.history_info_max_page = Math.ceil(response.total_count / this.EC.limit)

      if (typeof callback === 'function') {
        callback(this._history_info)
      } else {
        return this._history_info
      }
    }).catch(error => {
      console.error(error)
    })
  }

  set(emoji_code) {
    const options = {
      type: 'POST',
      params: { auth_token: this.EC.User.auth_info.token },
      data: { emoji_code }
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
