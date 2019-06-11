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

    return $.ajax({
      url: `${this.EC.api_url}emoji/customizations`,
      dataType: 'json',
      data: param,
      success: response => {
        if (response.status != null) {
          this.results = [];
          this.cur_page = 0;
          if (typeof callback === 'function') { callback([]); }
        } else {
          this.meta = response.meta;
          this.results = response.emoji;
          this.cur_page = response.meta.page;
          this.max_page = Math.ceil(response.meta.total_count / this.EC.limit);
          if (typeof callback === 'function') { callback(response.emoji); }
        }
      },
      error: response => {
        this.results = [];
        this.cur_page = 0;
        if (typeof callback === 'function') { callback([]); }
      }
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
