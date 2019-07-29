import axios from 'axios'
import _extend from 'lodash/extend'

export default class EmojidexCategories {
  constructor(EC) {
    this.EC = EC
    this.local = this.EC.options.locale
    return this.EC.Data.categories().then(categories => {
      this._categories = categories
      return this.sync()
    }).then(() => {
      this.EC.Categories = this
      return this.EC.Categories
    })
  }

  async _categoryEmojiAPI(categoryName, opts) {
    const param = {
      page: 1,
      limit: this.EC.limit,
      detailed: this.EC.detailed
    }
    if (this.EC.User.authInfo.token) {
      _extend(param, { auth_token: this.EC.User.authInfo.token }) // eslint-disable-line camelcase
    }

    _extend(param, opts)

    this.calledData = {
      categoryName,
      param
    }

    try {
      const response = await axios.get(`${this.EC.apiUrl}emoji`, { params: param })
      this.meta = response.data.meta
      this.results = response.data.emoji
      this.curPage = response.data.meta.page
      this.count = response.data.meta.count
      this.maxPage = Math.floor(this.meta.total_count / this.calledData.param.limit)
      if (this.meta.total_count % this.calledData.param.limit > 0) {
        this.maxPage++
      }

      await this.EC.Emoji.combine(response.data.emoji)
      return response.data.emoji
    } catch (error) {
      console.error(error)
    }
  }

  getEmoji(categoryName, opts) {
    const param = { category: categoryName }
    _extend(param, opts)
    return this._categoryEmojiAPI(categoryName, param)
  }

  next() {
    if (this.maxPage === this.curPage) {
      return
    }

    this.calledData.param.page++
    return this.getEmoji(this.calledData.categoryName, this.calledData.param)
  }

  prev() {
    if (this.curPage === 1) {
      return
    }

    this.calledData.param.page--
    return this.getEmoji(this.calledData.categoryName, this.calledData.param)
  }

  // Gets the full list of caetgories available
  sync(locale = this.locale || 'en') {
    if (this._categories.length && this.locale === locale) {
      return this._categories
    }

    return this._getCategories(locale)
  }

  async _getCategories(locale) {
    try {
      const response = await axios.get(`${this.EC.apiUrl}categories`, { params: { locale } })
      this._categories = response.data.categories
      return this.EC.Data.categories(response.data.categories)
    } catch (error) {
      console.error(error)
    }
  }

  all() {
    return this._categories
  }
}
