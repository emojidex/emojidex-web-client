import axios from 'axios'
import _extend from 'lodash/extend'

export default class EmojidexSearch {
  constructor(EC) {
    this.EC = EC
    this.results = []
    this.curPage = 1
    this.count = 0
    this.maxPage = 0
  }

  async _searchAPI(searchString, opts, callFunc) {
    const onFalsyProcess = () => {
      this.results = []
      this.curPage = 0
      this.count = 0
      this.maxPage = 0
      return []
    }

    // process for nothing search string, exclude advanced function
    if (!searchString) {
      return onFalsyProcess()
    }

    const param = {
      page: 1,
      limit: this.EC.limit,
      detailed: this.EC.detailed
    }
    if (this.EC.User.authInfo.token) {
      _extend(param, { auth_token: this.EC.User.authInfo.token }) // eslint-disable-line camelcase
    }

    _extend(param, opts)

    // TODO: @searchedFunc = unless @EC.closedNet then func.remote else callFunc.local
    this.searchedFunc = callFunc.remote
    this.searched = {
      data: searchString,
      param
    }

    try {
      const response = await axios.get(`${this.EC.apiUrl}search/emoji`, { params: param })
      if (!response.data.emoji) {
        return onFalsyProcess()
      }

      this.meta = response.data.meta
      this.results = response.data.emoji
      this.curPage = response.data.meta.page
      this.count = response.data.meta.count
      this.maxPage = Math.floor(this.meta.total_count / this.searched.param.limit)
      if (this.meta.total_count % this.searched.param.limit > 0) {
        this.maxPage++
      }

      await this.EC.Emoji.combine(response.data.emoji)
      return response.data.emoji
    } catch (error) {
      console.error(error)
      return onFalsyProcess()
    }
  }

  // Executes a general search (code_cont)
  search(term, opts) {
    opts = _extend({ code_cont: this.EC.Util.escapeTerm(term) }, opts) // eslint-disable-line camelcase
    return this._searchAPI(term, opts, { remote: this.search, local: this.EC.Emoji.search })
  }

  // Executes a search starting with the given term
  starting(term, opts) {
    opts = _extend({ code_sw: this.EC.Util.escapeTerm(term) }, opts) // eslint-disable-line camelcase
    return this._searchAPI(term, opts, { remote: this.starting, local: this.EC.Emoji.starting })
  }

  // Executes a search ending with the given term
  ending(term, opts) {
    opts = _extend({ code_ew: this.EC.Util.escapeTerm(term) }, opts) // eslint-disable-line camelcase
    return this._searchAPI(term, opts, { remote: this.ending, local: this.EC.Emoji.ending })
  }

  // Searches by tags
  tags(tags, opts) {
    opts = _extend({ tags: this.EC.Util.breakout(tags) }, opts)
    return this._searchAPI(tags, opts, { remote: this.tags, local: this.EC.Emoji.tags })
  }

  // Searches using an array of keys and an array of tags
  advanced(searchDetails, opts) {
    const param = {
      code_cont: this.EC.Util.escapeTerm(searchDetails.term), // eslint-disable-line camelcase
      tags: this.EC.Util.breakout(searchDetails.tags),
      categories: this.EC.Util.breakout(searchDetails.categories)
    }

    _extend(param, opts)
    return this._searchAPI(searchDetails, param, { remote: this.advanced, local: this.EC.Emoji.advanced })
  }

  // Not an actual search, just gets information on the given emoji
  async find(code, opts) {
    const emojiCache = this.EC.Data.emoji()
    code = this.EC.Util.deEscapeTerm(code)
    for (let i = 0; i < emojiCache.length; i++) {
      const emoji = emojiCache[i]
      if (emoji.code === code) {
        return emoji
      }
    }

    const param = { detailed: this.EC.detailed }
    if (this.EC.User.authInfo.token) {
      _extend(param, { auth_token: this.EC.User.authInfo.token }) // eslint-disable-line camelcase
    }

    _extend(param, opts)

    try {
      const response = await axios.get(`${this.EC.apiUrl}emoji/${this.EC.Util.makeURLSafe(code)}`)
      await this.EC.Emoji.combine([response.data])
      return response.data
    } catch (error) {
      return error.response
    }
  }

  next() {
    if (this.maxPage === this.curPage) {
      return
    }

    this.searched.param.page++
    return this.searchedFunc(this.searched.data, this.searched.param)
  }

  prev() {
    if (this.curPage === 1) {
      return
    }

    this.searched.param.page--
    return this.searchedFunc(this.searched.data, this.searched.param)
  }
}
