export default class EmojidexCategories {
  constructor(EC) {
    this.EC = EC;
    this._categories = this.EC.Data.categories();
    this.local = this.EC.options.locale
    return this.sync(null, this.locale).then(() => {
      return this.EC.Categories = this;
    });
  }

  _categoriesAPI(category_name, callback, opts, called_func) {
    let param = {
      page: 1,
      limit: this.EC.limit,
      detailed: this.EC.detailed
    };
    if (this.EC.User.auth_info.token !== null) {
      $.extend(param, {auth_token: this.EC.User.auth_info.token});
    }
    $.extend(param, opts);

    this.called_func = called_func;
    this.called_data = {
      category_name,
      callback,
      param
    };

    return $.ajax({
      url: `${this.EC.api_url}emoji`,
      dataType: 'json',
      data: param,
      success: response => {
        this.meta = response.meta;
        this.results = response.emoji;
        this.cur_page = response.meta.page;
        this.count = response.meta.count;
        return this.EC.Emoji.combine(response.emoji).then(() => {
          if (typeof callback === 'function') {
            return callback(response.emoji, {
              category_name,
              callback,
              param
            })
          }
        });
      }
    });
  }

  getEmoji(category_name, callback, opts){
    let param =
      {category: category_name};
    $.extend(param, opts);
    return this._categoriesAPI(category_name, callback, param, this.getEmoji);
  }

  next() {
    if (this.count === this.called_data.param.limit) { this.called_data.param.page++; }
    return this.called_func(this.called_data.category_name, this.called_data.callback, this.called_data.param, {ajax: this.called_func});
  }

  prev() {
    if (this.called_data.param.page > 1) { this.called_data.param.page--; }
    return this.called_func(this.called_data.category_name, this.called_data.callback, this.called_data.param, {ajax: this.called_func});
  }

  // Gets the full list of caetgories available
  sync(callback, locale) {
    if (typeof locale === 'undefined' || locale === null) {
      locale = this.locale;
    }
    if (typeof this._categories !== 'undefined' && typeof this._categories.length !== 'undefined' && this._categories.length != 0) {
      if(this.locale === locale) {
        return new Promise((resolve, reject) => {
          if (typeof callback === 'function') { callback(this._categories); }
          return resolve();
        });
      } else {
        return this._get_category(callback, locale);
      }
    } else {
      if (typeof locale === 'undefined' || locale === null) { ({ locale } = this.EC); }
      return this._get_category(callback, locale);
    }
  }

  _get_category(callback, locale) {
    return $.ajax({
      url: this.EC.api_url + 'categories',
      dataType: 'json',
      data: {
        locale
      }
    }).then(response => {
      this._categories = response.categories;
      return this.EC.Data.categories(response.categories).then(() => {
        if (typeof callback === 'function') { callback(this._categories); }
      });
    });
  }

  all(callback) {
    if (this._categories != null) {
      if (typeof callback === 'function') { callback(this._categories); }
    } else {
      return setTimeout((() => {
        return this.all(callback);
      }
      ), 500);
    }
  }
}
