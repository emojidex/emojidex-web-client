import axios from 'axios'
import _extend from 'lodash/extend'

export default class EmojidexCategories {
  constructor(EC) {
    this.EC = EC
    this._categories = this.EC.Data.categories()
    this.local = this.EC.options.locale
    return this.sync(null, this.locale).then(() => {
      this.EC.Categories = this
      return
    })
  }

  _categoriesAPI(category_name, callback, opts, called_func) {
    const param = {
      page: 1,
      limit: this.EC.limit,
      detailed: this.EC.detailed
    }
    if (this.EC.User.auth_info.token !== null) {
      _extend(param, { auth_token: this.EC.User.auth_info.token })
    }

    _extend(param, opts)

    this.called_func = called_func
    this.called_data = {
      category_name,
      callback,
      param
    }

    return axios.get(`${this.EC.apiUrl}emoji`, {
      params: param
    }).then(response => {
      this.meta = response.data.meta
      this.results = response.data.emoji
      this.cur_page = response.data.meta.page
      this.count = response.data.meta.count
      return this.EC.Emoji.combine(response.data.emoji).then(() => {
        if (typeof callback === 'function') {
          return callback(response.data.emoji, {
            category_name,
            callback,
            param
          })
        }
      })
    }).catch(error => {
      console.error(error)
    })
  }

  getEmoji(category_name, callback, opts) {
    const param = { category: category_name }
    _extend(param, opts)
    return this._categoriesAPI(category_name, callback, param, this.getEmoji)
  }

  next() {
    if (this.count === this.called_data.param.limit) {
      this.called_data.param.page++
    }

    return this.called_func(this.called_data.category_name, this.called_data.callback, this.called_data.param)
  }

  prev() {
    if (this.called_data.param.page > 1) {
      this.called_data.param.page--
    }

    return this.called_func(this.called_data.category_name, this.called_data.callback, this.called_data.param)
  }

  // Gets the full list of caetgories available
  sync(callback, locale) {
    if (typeof locale === 'undefined' || locale === null) {
      locale = this.locale
    }

    if (typeof this._categories !== 'undefined' && typeof this._categories.length !== 'undefined' && this._categories.length != 0) {
      if (this.locale === locale) {
        return new Promise((resolve, reject) => {
          if (typeof callback === 'function') {
            callback(this._categories)
          }

          return resolve()
        })
      }

      return this._get_category(callback, locale)
    }

    if (typeof locale === 'undefined' || locale === null) {
      ({ locale } = this.EC)
    }

    return this._get_category(callback, locale)
  }

  _get_category(callback, locale) {
    return axios.get(`${this.EC.apiUrl}categories`, {
      params: { locale }
    }).then(response => {
      this._categories = response.data.categories
      return this.EC.Data.categories(response.data.categories).then(() => {
        if (typeof callback === 'function') {
          callback(this._categories)
        }
      })
    }).catch(error => {
      console.error(error)
    })
  }

  all(callback) {
    if (this._categories != null) {
      if (typeof callback === 'function') {
        callback(this._categories)
      }
    } else {
      return setTimeout((() => {
        return this.all(callback)
      }), 500)
    }
  }
}
