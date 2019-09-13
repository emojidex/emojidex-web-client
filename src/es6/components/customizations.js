import axios from 'axios'
import _extend from 'lodash/extend'

export default class EmojidexCustomizations {
  constructor(EC) {
    this.EC = EC
    this.results = []
    this.curPage = 1
  }

  async _customizationsAPI(opts) {
    const onFalsyProcess = () => {
      this.results = []
      this.curPage = 0
      return []
    }

    const param = {
      page: 1,
      limit: this.EC.limit,
      detailed: this.EC.detailed
    }
    _extend(param, opts)
    this.customizedParam = param

    try {
      const response = await axios.get(`${this.EC.apiUrl}emoji/customizations`, { params: param })
      if (response.data.emoji) {
        this.meta = response.data.meta
        this.results = response.data.emoji
        this.curPage = response.data.meta.page
        this.maxPage = Math.ceil(this.meta.total_count / this.customizedParam.limit)
        return response.data.emoji
      }

      return onFalsyProcess()
    } catch (error) {
      console.error(error)
      return onFalsyProcess()
    }
  }

  get(opts) {
    return this._customizationsAPI(opts)
  }

  next() {
    if (this.maxPage === this.curPage) {
      return
    }

    this.customizedParam.page++
    return this.get(this.customizedParam)
  }

  prev() {
    if (this.curPage === 1) {
      return
    }

    this.customizedParam.page--
    return this.get(this.customizedParam)
  }
}
