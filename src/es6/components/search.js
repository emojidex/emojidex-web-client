import axios from 'axios'
import _extend from 'lodash/extend'

export default class EmojidexSearch {
  constructor(EC) {
    this.EC = EC
    this.results = []
    this.curPage = 1
    this.count = 0
  }

  _searchAPI(searchData, callback, opts, callFunc) {
    const param = {
      page: 1,
      limit: this.EC.limit,
      detailed: this.EC.detailed
    }
    if (this.EC.User.authInfo.token !== null) {
      _extend(param, { auth_token: this.EC.User.authInfo.token }) // eslint-disable-line camelcase
    }

    _extend(param, opts)

    // TODO: @searchedFunc = unless @EC.closedNet then func.remote else callFunc.local
    this.searchedFunc = callFunc.remote
    this.searched = {
      data: searchData,
      callback,
      param
    }

    return axios.get(`${this.EC.apiUrl}search/emoji`, {
      params: param
    }).then(response => {
      if (response.data.emoji) {
        this.meta = response.data.meta
        this.results = response.data.emoji
        this.curPage = response.data.meta.page
        this.count = response.data.meta.count
        this.EC.Emoji.combine(response.data.emoji)
        if (typeof callback === 'function') {
          callback(response.data.emoji)
        } else {
          return response.data
        }
      } else {
        this.results = []
        this.curPage = 0
        this.count = 0
        if (typeof callback === 'function') {
          callback([])
        } else {
          return []
        }
      }
    }).catch(error => {
      this.results = []
      this.curPage = 0
      this.count = 0
      if (typeof callback === 'function') {
        callback([])
      } else {
        console.error(error)
        return []
      }
    })
  }

  // Executes a general search (code_cont)
  search(term, callback, opts) {
    opts = _extend({ code_cont: this.EC.Util.escapeTerm(term) }, opts) // eslint-disable-line camelcase
    return this._searchAPI(term, callback, opts, { remote: this.search, local: this.EC.Emoji.search })
  }

  // Executes a search starting with the given term
  starting(term, callback, opts) {
    opts = _extend({ code_sw: this.EC.Util.escapeTerm(term) }, opts) // eslint-disable-line camelcase
    return this._searchAPI(term, callback, opts, { remote: this.starting, local: this.EC.Emoji.starting })
  }

  // Executes a search ending with the given term
  ending(term, callback, opts) {
    opts = _extend({ code_ew: this.EC.Util.escapeTerm(term) }, opts) // eslint-disable-line camelcase
    return this._searchAPI(term, callback, opts, { remote: this.ending, local: this.EC.Emoji.ending })
  }

  // Searches by tags
  tags(tags, callback, opts) {
    opts = _extend({ tags: this.EC.Util.breakout(tags) }, opts)
    return this._searchAPI(tags, callback, opts, { remote: this.tags, local: this.EC.Emoji.tags })
  }

  // Searches using an array of keys and an array of tags
  advanced(searchDetails, callback, opts) {
    /* eslint-disable camelcase */
    const param = {
      code_cont: this.EC.Util.escapeTerm(searchDetails.term),
      tags: this.EC.Util.breakout(searchDetails.tags),
      categories: this.EC.Util.breakout(searchDetails.categories)
    }
    /* eslint-enable camelcase */

    _extend(param, opts)
    return this._searchAPI(searchDetails, callback, param, { remote: this.advanced, local: this.EC.Emoji.advanced })
  }

  // Not an actual search, just gets information on the given emoji
  find(code, callback = null, opts) {
    const emojiCache = this.EC.Data.emoji()
    code = this.EC.Util.deEscapeTerm(code)
    for (let i = 0; i < emojiCache.length; i++) {
      const emoji = emojiCache[i]
      if (emoji.code === code) {
        if (typeof callback === 'function') {
          callback(emoji)
        }

        return Promise.resolve(emoji)
      }
    }

    const param = { detailed: this.EC.detailed }
    if (this.EC.User.authInfo.token !== null) {
      _extend(param, { auth_token: this.EC.User.authInfo.token }) // eslint-disable-line camelcase
    }

    _extend(param, opts)

    return axios.get(`${this.EC.apiUrl}emoji/${this.EC.Util.makeURLSafe(code)}`, {
    }).then(response => {
      this.EC.Emoji.combine([response.data])
      if (typeof callback === 'function') {
        callback(response.data)
      }

      return response.data
    }).catch(error => {
      if (typeof callback === 'function') {
        callback(error.response)
      }

      return error.response
    })
  }

  next() {
    if (this.count === this.searched.param.limit) {
      this.searched.param.page++
    }

    return this.searchedFunc(this.searched.data, this.searched.callback, this.searched.param)
  }

  prev() {
    if (this.searched.param.page > 1) {
      this.searched.param.page--
    }

    return this.searchedFunc(this.searched.data, this.searched.callback, this.searched.param)
  }
}
