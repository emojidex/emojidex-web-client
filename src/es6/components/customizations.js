import axios from 'axios'
import _extend from 'lodash/extend'

export default class EmojidexCustomizations {
  constructor(EC) {
    this.EC = EC
    this.results = []
    this.cur_page = 1
  }

  _customizationsAPI(callback, opts, called_func) {
    const param = {
      page: 1,
      limit: this.EC.limit,
      detailed: this.EC.detailed
    }
    _extend(param, opts)

    this.customized_func = called_func
    this.customized = {
      callback,
      param
    }

    return axios.get(`${this.EC.api_url}emoji/customizations`, {
      params: param
    }).then(response => {
      if (response.data.status != null) {
        this.results = []
        this.cur_page = 0
        if (typeof callback === 'function') {
          callback([])
        }
      } else {
        this.meta = response.data.meta
        this.results = response.data.emoji
        this.cur_page = response.data.meta.page
        this.max_page = Math.ceil(response.data.meta.total_count / this.EC.limit)
        if (typeof callback === 'function') {
          callback(response.data.emoji)
        }
      }
    }).catch(error => {
      this.results = []
      this.cur_page = 0
      if (typeof callback === 'function') {
        callback([])
      } else {
        console.error(error)
      }
    })
  }

  get(callback, opts) {
    return this._customizationsAPI(callback, opts, this.get)
  }

  next() {
    if (this.max_page > this.cur_page) {
      this.customized.param.page++
    }

    return this.customized_func(this.customized.callback, this.customized.param)
  }

  prev() {
    if (this.cur_page > 1) {
      this.customized.param.page--
    }

    return this.customized_func(this.customized.callback, this.customized.param)
  }
}
