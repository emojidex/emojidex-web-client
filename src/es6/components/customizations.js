import axios from 'axios'
import _extend from 'lodash/extend'

export default class EmojidexCustomizations {
  constructor(EC) {
    this.EC = EC
    this.results = []
    this.curPage = 1
  }

  _customizationsAPI(callback, opts, calledFunc) {
    const onFalsyProcess = callback => {
      this.results = []
      this.curPage = 0
      if (typeof callback === 'function') {
        callback([])
      } else {
        return []
      }
    }

    const param = {
      page: 1,
      limit: this.EC.limit,
      detailed: this.EC.detailed
    }
    _extend(param, opts)

    this.customizedFunc = calledFunc
    this.customized = {
      callback,
      param
    }

    return axios.get(`${this.EC.apiUrl}emoji/customizations`, {
      params: param
    }).then(response => {
      if (response.data.emoji) {
        this.meta = response.data.meta
        this.results = response.data.emoji
        this.curPage = response.data.meta.page
        this.maxPage = Math.ceil(this.meta.total_count / this.customized.param.limit)
        if (this.meta.total_count % this.customized.param.limit > 0) {
          this.maxPage++
        }

        if (typeof callback === 'function') {
          callback(response.data.emoji)
        } else {
          return response.data
        }
      } else {
        return onFalsyProcess(callback)
      }
    }).catch(error => {
      console.error(error)
      return onFalsyProcess(callback)
    })
  }

  get(callback, opts) {
    return this._customizationsAPI(callback, opts, this.get)
  }

  next() {
    if (this.maxPage > this.curPage) {
      this.customized.param.page++
    }

    return this.customizedFunc(this.customized.callback, this.customized.param)
  }

  prev() {
    if (this.curPage > 1) {
      this.customized.param.page--
    }

    return this.customizedFunc(this.customized.callback, this.customized.param)
  }
}
