import axios from 'axios'

export default class EmojidexCustomizations {
  constructor(EC) {
    this.EC = EC;
    this.results = [];
    this.cur_page = 1;
  }

  _customizationsAPI(callback, opts, call_func) {
    const param = {
      page: 1,
      limit: this.EC.limit,
      detailed: this.EC.detailed
    };
    $.extend(param, opts);

    this.customized_func = call_func.ajax;
    this.customized = {
      callback,
      param
    };

    return axios.get(`${this.EC.api_url}emoji/customizations`, {
      params: param
    }).then(response => {
      if (response.data.status != null) {
        this.results = [];
        this.cur_page = 0;
        if (typeof callback === 'function') { callback([]); }
      } else {
        this.meta = response.data.meta;
        this.results = response.data.emoji;
        this.cur_page = response.data.meta.page;
        this.max_page = Math.ceil(response.data.meta.total_count / this.EC.limit);
        if (typeof callback === 'function') { callback(response.data.emoji); }
      }
    }).catch(response => {
      this.results = [];
      this.cur_page = 0;
      if (typeof callback === 'function') { callback([]); }
    });
  }

  get(callback, opts) {
    return this._customizationsAPI(callback, opts, { ajax: this.get });
  }

  next() {
    if (this.max_page > this.cur_page) this.customized.param.page++;
    return this.customized_func(this.customized.callback, this.customized.param, { ajax: this.customized_func });
  }

  prev() {
    if (this.cur_page > 1) this.customized.param.page--;
    return this.customized_func(this.customized.callback, this.customized.param, { ajax: this.customized_func });
  }
}
