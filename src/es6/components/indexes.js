import axios from 'axios'
import _extend from 'lodash/extend'

export default class EmojidexIndexes {
  constructor(EC) {
    this.EC = EC
    this.results = []
    this.curPage = 1
    this.count = 0
  }

  _indexesAPI(query, callback, opts, func) {
    const param = {
      page: 1,
      limit: this.EC.limit,
      detailed: this.EC.detailed
    }
    if (this.EC.User.authInfo.token !== null) {
      _extend(param, { auth_token: this.EC.User.authInfo.token }) // eslint-disable-line camelcase
    }

    _extend(param, opts)

    if (func) {
      this.indexedFunc = func
      this.indexed = {
        query,
        callback,
        param
      }
    }

    return axios.get(`${this.EC.apiUrl}${query}`, {
      params: param
    }).then(response => {
      if (response.data.emoji) {
        this.meta = response.data.meta
        this.results = response.data.emoji
        this.curPage = response.data.meta.page
        this.count = response.data.meta.count
        return this.EC.Emoji.combine(response.data.emoji).then(() => {
          if (typeof callback === 'function') {
            callback(response.data.emoji)
          }
        })
      }

      this.results = []
      this.curPage = 0
      this.count = 0
      if (typeof callback === 'function') {
        callback([])
      }
    }).catch(error => {
      this.results = []
      this.curPage = 0
      this.count = 0
      if (typeof callback === 'function') {
        callback([])
      } else {
        console.error(error)
      }
    })
  }

  index(callback, opts) {
    return this._indexesAPI('emoji', callback, opts, this.index)
  }

  newest(callback, opts) {
    return this._indexesAPI('newest', callback, opts, this.newest)
  }

  popular(callback, opts) {
    return this._indexesAPI('popular', callback, opts, this.popular)
  }

  user(username, callback, opts) {
    return this._indexesAPI(`users/${username}/emoji`, callback, opts)
  }

  static(staticType, language, callback) {
    let loadedNum = 0
    let loadedEmoji = []

    const loadStatic = urlString => {
      return axios.get(urlString).then(response => {
        loadedEmoji = loadedEmoji.concat(response.data)
        if (++loadedNum === staticType.length) {
          return this.EC.Emoji.combine(loadedEmoji).then(data => {
            if (typeof callback === 'function') {
              callback(data)
            }
          })
        }
      }).catch(error => {
        console.error(error)
      })
    }

    return staticType.map(type =>
      language ?
        loadStatic(`${this.EC.apiUrl + type}?locale=${language}`) :
        loadStatic(`${this.EC.apiUrl + type}`))
  }

  select(code, callback, opts) {
    return this.EC.Search.find(code, callback, opts)
  }

  next() {
    if (this.count === this.indexed.param.limit) {
      this.indexed.param.page++
    }

    return this.indexedFunc(this.indexed.callback, this.indexed.param, this.indexedFunc)
  }

  prev() {
    if (this.indexed.param.page > 1) {
      this.indexed.param.page--
    }

    return this.indexedFunc(this.indexed.callback, this.indexed.param, this.indexedFunc)
  }
}
