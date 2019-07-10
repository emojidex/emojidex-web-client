import axios from 'axios'
import _extend from 'lodash/extend'

export default class EmojidexCategories {
  constructor(EC) {
    this.EC = EC
    this._categories = this.EC.Data.categories()
    this.local = this.EC.options.locale
    return this.sync(null, this.locale).then(() => {
      this.EC.Categories = this
      return this.EC.Categories
    })
  }

  _categoriesAPI(categoryName, callback, opts, calledFunc) {
    const param = {
      page: 1,
      limit: this.EC.limit,
      detailed: this.EC.detailed
    }
    if (this.EC.User.authInfo.token) {
      _extend(param, { auth_token: this.EC.User.authInfo.token }) // eslint-disable-line camelcase
    }

    _extend(param, opts)

    this.calledFunc = calledFunc
    this.calledData = {
      categoryName,
      callback,
      param
    }

    return axios.get(`${this.EC.apiUrl}emoji`, {
      params: param
    }).then(response => {
      this.meta = response.data.meta
      this.results = response.data.emoji
      this.curPage = response.data.meta.page
      this.count = response.data.meta.count
      return this.EC.Emoji.combine(response.data.emoji).then(() => {
        if (typeof callback === 'function') {
          callback(response.data.emoji, {
            categoryName,
            callback,
            param
          })
        } else {
          return response.data
        }
      })
    }).catch(error => {
      console.error(error)
    })
  }

  getEmoji(categoryName, callback, opts) {
    const param = { category: categoryName }
    _extend(param, opts)
    return this._categoriesAPI(categoryName, callback, param, this.getEmoji)
  }

  next() {
    if (this.count === this.calledData.param.limit) {
      this.calledData.param.page++
    }

    return this.calledFunc(this.calledData.categoryName, this.calledData.callback, this.calledData.param)
  }

  prev() {
    if (this.calledData.param.page > 1) {
      this.calledData.param.page--
    }

    return this.calledFunc(this.calledData.categoryName, this.calledData.callback, this.calledData.param)
  }

  // Gets the full list of caetgories available
  sync(callback, locale = this.locale) {
    if (typeof this._categories !== 'undefined' && typeof this._categories.length !== 'undefined' && this._categories.length !== 0) {
      if (this.locale === locale) {
        return new Promise(resolve => {
          if (typeof callback === 'function') {
            callback(this._categories)
          }

          return resolve(this._categories)
        })
      }

      return this._getCategory(callback, locale)
    }

    if (typeof locale === 'undefined' || locale === null) {
      ({ locale } = this.EC)
    }

    return this._getCategory(callback, locale)
  }

  _getCategory(callback, locale) {
    return axios.get(`${this.EC.apiUrl}categories`, {
      params: { locale }
    }).then(response => {
      this._categories = response.data.categories
      return this.EC.Data.categories(response.data.categories).then(() => {
        if (typeof callback === 'function') {
          callback(this._categories)
        } else {
          return this._categories
        }
      })
    }).catch(error => {
      console.error(error)
    })
  }

  all(callback) {
    if (this._categories) {
      if (typeof callback === 'function') {
        callback(this._categories)
      } else {
        return this._categories
      }
    } else {
      return setTimeout((() => {
        return this.all(callback)
      }), 500)
    }
  }
}
