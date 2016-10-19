class EmojidexData {
  constructor(EC, options) {
    this.EC = EC;
    this.options = options;
    this._def_auth_info = {
      status: 'none',
      user: '',
      token: null,
      r18: false,
      premium: false,
      premium_exp: null,
      pro: false,
      pro_exp: null
    };

    if (this.options.storageHubPath != null) {
      this.storage = new EmojidexDataStorage(this.options.storageHubPath);
    } else {
      this.storage = new EmojidexDataStorage();
    }

    return this.storage.hub.onReadyFrame().then( () => {
      return this.storage.hub.onConnect();
    }).then( () => {
      return this.storage.hub.getKeys();
    }).then(keys => {
      if (keys.indexOf('emojidex') !== -1) {
        return this.storage.update_cache('emojidex');
      } else {
        return this.storage.update('emojidex', {
          moji_codes: {
            moji_string: "",
            moji_array: [],
            moji_index: {}
          },
          emoji: this.EC.options.emoji || [],
          history: this.EC.options.history || [],
          favorites: this.EC.options.favorites || [],
          categories: this.EC.options.categories || [],
          auth_info: this.EC.options.auth_info || this._def_auth_info
        })
      }
    }).then(data => {
      if (this.storage.hub_cache.emojidex.cdn_url != null) {
        return this.EC.cdn_url = this.storage.get('emojidex.cdn_url');
      } else {
        // if the CDN URL has not been overridden
        // attempt to get it from the api env
        if (this.EC.cdn_url === this.EC.defaults.cdn_url) {
          return $.ajax({
            url: this.EC.api_url + "/env",
            dataType: 'json'
          }).then(response => {
            this.EC.env = response;
            this.EC.cdn_url = `https://${this.EC.env.s_cdn_addr}/emoji/`;
            return this.storage.update('emojidex', {cdn_url: this.EC.cdn_url});
          });
        }
      }
    }).then(data => {
      if(this._needUpdate()) {
        return this._init_moji_codes()
      } else {
        return this.storage.get('emojidex')
      }
    }).then(data => {
      this.moji_codes = this.storage.get('emojidex.moji_codes');
      return this.EC.Data = this;
    });
  }

  _init_moji_codes(force = false) {
    return this.storage.update('emojidex.moji_codes_updated', new Date().toString()).then(() => {
      return $.ajax({
        url: this.EC.api_url + 'moji_codes',
        dataType: 'json'
      })
    }).then(response => {
      return this.storage.update('emojidex.moji_codes', response);
    })
  }

  _needUpdate() {
    if(this.storage.isSet('emojidex.utfInfoUpdated')) {
      current = new Date();
      updated = new Date(this.storage.get('emojidex.utfInfoUpdated'));
      // ２週間に一度更新する
      if(current - updated >= 3600000 * 24 * 14) {
        return true
      } else {
        return false
      }
    } else {
      return true
    }
  }

  emoji(emoji_set) {
    if (emoji_set != null) {
      if (this.storage.hub_cache.emojidex.emoji.length > 0) {
        let hub_emoji = this.storage.hub_cache.emojidex.emoji;
        for (let i = 0; i < emoji_set.length; i++) {
          let new_emoji = emoji_set[i];
          for (let j = 0; j < hub_emoji.length; j++) {
            let emoji = hub_emoji[j];
            if (new_emoji.code === emoji.code) {
              hub_emoji.splice(hub_emoji.indexOf(emoji), 1, new_emoji);
              break;
            } else if (emoji === hub_emoji[hub_emoji.length - 1]) {
              hub_emoji.push(new_emoji);
            }
          }
        }
        return this.storage.update('emojidex', {emoji: hub_emoji});
      } else {
        return this.storage.update('emojidex', {emoji: emoji_set});
      }
    } else if (this.storage.hub_cache.emojidex.emoji != null) {
      return this.storage.hub_cache.emojidex.emoji;
    } else {
      return undefined;
    }
  }

  favorites(favorites_set) {
    if (favorites_set != null) { return this.storage.update('emojidex', {favorites: favorites_set}); }
    return this.storage.hub_cache.favorites;
  }

  history(history_set) {
    if (history_set != null) { return this.storage.update('emojidex', {history: history_set}); }
    return this.storage.hub_cache.history;
  }

  categories(categories_set) {
    if (categories_set != null) { return this.storage.update('emojidex', {categories: categories_set}); }
    return this.storage.hub_cache.categories;
  }

  auth_info(auth_info_set) {
    if (auth_info_set != null) {
      this.EC.User.auth_info = auth_info_set;
      return this.storage.update('emojidex', {auth_info: auth_info_set});
    }
    return this.storage.hub_cache.auth_info;
  }
}
