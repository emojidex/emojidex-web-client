import axios from 'axios'
import _extend from 'lodash/extend'

export default class EmojidexIndexes {
  constructor(EC) {
    this.EC = EC
    this.results = []
    this.curPage = 1
    this.count = 0
    this.maxPage = 0
  }

  async _indexesAPI(query, opts, func) {
    const onFalsyProcess = () => {
      this.results = []
      this.curPage = 0
      this.count = 0
      return []
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

    this.indexedFunc = func
    this.indexedParam = param

    try {
      const response = await axios.get(`${this.EC.apiUrl}${query}`, { params: param })
      if (!response.data.emoji) {
        return onFalsyProcess()
      }

      this.meta = response.data.meta
      this.results = response.data.emoji
      this.curPage = response.data.meta.page
      this.count = response.data.meta.count
      this.maxPage = Math.ceil(this.meta.total_count / this.indexedParam.limit)
      await this.EC.Emoji.combine(response.data.emoji)
      return response.data.emoji
    } catch (error) {
      console.error(error)
      return onFalsyProcess()
    }
  }

  index(opts) {
    return this._indexesAPI('emoji', opts, this.index)
  }

  newest(opts) {
    return this._indexesAPI('newest', opts, this.newest)
  }

  popular(opts) {
    return this._indexesAPI('popular', opts, this.popular)
  }

  async static(staticType, language) {
    const loadStatic = async urlString => {
      try {
        const response = await axios.get(urlString)
        return response.data
      } catch (error) {
        console.error(error)
      }
    }

    const promises = staticType.map(type => loadStatic(`${this.EC.apiUrl + type}${language ? `?locale=${language}` : ''}`))
    const results = await Promise.all(promises)
    return this.EC.Emoji.combine(results.flat())
  }

  next() {
    if (this.maxPage === this.curPage) {
      return
    }

    this.indexedParam.page++
    return this.indexedFunc(this.indexedParam)
  }

  prev() {
    if (this.curPage === 1) {
      return
    }

    this.indexedParam.page--
    return this.indexedFunc(this.indexedParam)
  }
}
