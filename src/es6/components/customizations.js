export default class EmojidexCustomizations {
  constructor(EC) {
    this.EC = EC;
    this.results = [];
    this.cur_page = 1;
  }

  _customizationsAPI(callback, opts) {
    const param = {
      page: 1,
      limit: this.EC.limit,
      detailed: this.EC.detailed
    };
    $.extend(param, opts);

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

  get(callback, page = 1) {
    const opts = {
      page: page
    };
    return this._customizationsAPI(callback, opts);
  }

  next(callback) {
    if (this.max_page === this.cur_page) return;
    return this.get(callback, this.cur_page + 1);
  }

  prev(callback) {
    if (this.cur_page === 1) return;
    return this.get(callback, this.cur_page - 1);
  }
}
