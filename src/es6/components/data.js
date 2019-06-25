import EmojidexDataStorage from './data/_storage'
import axios from 'axios'

export default class EmojidexData {
  constructor(EC, options) {
    this.EC = EC
    this.options = options
    this.defaultAuthInfo = {
      status: 'none',
      user: '',
      token: null,
      r18: false,
      premium: false,
      premiumExp: null,
      pro: false,
      proExp: null
    }

    if (this.options.storageHubPath != null) {
      this.storage = new EmojidexDataStorage(this.options.storageHubPath)
    } else {
      this.storage = new EmojidexDataStorage()
    }

    return this.storage.hub.onReadyFrame().then(() => {
      return this.storage.hub.onConnect()
    }).then(() => {
      return this.storage.hub.getKeys()
    }).then(keys => {
      if (keys.indexOf('emojidex') !== -1) {
        return this.storage.updateCache('emojidex')
      }

      return this.storage.update('emojidex', {
        moji_codes: {
          moji_string: '',
          moji_array: [],
          moji_index: {}
        },
        emoji: this.EC.options.emoji || [],
        history: this.EC.options.history || [],
        favorites: this.EC.options.favorites || [],
        categories: this.EC.options.categories || [],
        auth_info: this.EC.options.authInfo || this.defaultAuthInfo
      })
    }).then(data => {
      if (this._needUpdate()) {
        return this._initMojiCodes()
      }

      return this.storage.get('emojidex')
    }).then(data => {
      this.moji_codes = this.storage.get('emojidex.moji_codes')
      return this.EC.Data = this
    }).catch(error => {
      console.error(error)
    })
  }

  _initMojiCodes(force = false) {
    return this.storage.update('emojidex.moji_codes_updated', new Date().toString()).then(() => {
      return axios.get(`${this.EC.apiUrl}moji_codes?locale=${this.EC.locale}`)
    }).then(response => {
      return this.storage.update('emojidex.moji_codes', response.data)
    }).catch(error => {
      console.error(error)
    })
  }

  _needUpdate() {
    if (this.storage.isSet('emojidex.utfInfoUpdated')) {
      current = new Date()
      updated = new Date(this.storage.get('emojidex.utfInfoUpdated'))
      // ２週間に一度更新する
      if (current - updated >= 3600000 * 24 * 14) {
        return true
      }

      return false
    }

    return true
  }

  emoji(emoji_set) {
    if (emoji_set != null) {
      if (this.storage.hubCache.emojidex.emoji != null &&
          this.storage.hubCache.emojidex.emoji.length > 0) {
        const hub_emoji = this.storage.hubCache.emojidex.emoji
        for (let i = 0; i < emoji_set.length; i++) {
          const new_emoji = emoji_set[i]
          for (let j = 0; j < hub_emoji.length; j++) {
            const emoji = hub_emoji[j]
            if (new_emoji.code === emoji.code) {
              hub_emoji.splice(hub_emoji.indexOf(emoji), 1, new_emoji)
              break
            } else if (emoji === hub_emoji[hub_emoji.length - 1]) {
              hub_emoji.push(new_emoji)
            }
          }
        }

        return this.storage.update('emojidex', { emoji: hub_emoji })
      }

      return this.storage.update('emojidex', { emoji: emoji_set })
    }

    if (this.storage.hubCache.emojidex.emoji != null) {
      return this.storage.hubCache.emojidex.emoji
    }

    return undefined
  }

  favorites(favorites_set) {
    if (favorites_set != null) {
      if (this.storage.hubCache.emojidex.favorites != null &&
          this.storage.hubCache.emojidex.favorites.length > 0) {
        const hub_emoji = this.storage.hubCache.emojidex.favorites
        for (let i = 0; i < favorites_set.length; i++) {
          const new_emoji = favorites_set[i]
          for (let j = 0; j < hub_emoji.length; j++) {
            const emoji = hub_emoji[j]
            if (new_emoji.code === emoji.code) {
              hub_emoji.splice(hub_emoji.indexOf(emoji), 1, new_emoji)
              break
            } else if (emoji === hub_emoji[hub_emoji.length - 1]) {
              hub_emoji.push(new_emoji)
            }
          }
        }

        return this.storage.update('emojidex', { favorites: hub_emoji })
      }

      return this.storage.update('emojidex', { favorites: favorites_set })
    }

    if (this.storage.hubCache.emojidex.favorites != null) {
      return new Promise(resolve => resolve(this.storage.hubCache.emojidex.favorites))
    }

    return new Promise(resolve => resolve([]))
  }

  history(history_set) {
    if (history_set != null) {
      if (this.storage.hubCache.emojidex.history != null &&
          this.storage.hubCache.emojidex.history.length > 0) {
        const hub_emoji = this.storage.hubCache.emojidex.history
        for (let i = 0; i < history_set.length; i++) {
          const new_emoji = history_set[i]
          for (let j = 0; j < hub_emoji.length; j++) {
            const emoji = hub_emoji[j]
            if (new_emoji.code === emoji.code) {
              hub_emoji.splice(hub_emoji.indexOf(emoji), 1, new_emoji)
              break
            } else if (emoji === hub_emoji[hub_emoji.length - 1]) {
              hub_emoji.push(new_emoji)
            }
          }
        }

        return this.storage.update('emojidex', { history: hub_emoji })
      }

      return this.storage.update('emojidex', { history: history_set })
    }

    if (this.storage.hubCache.emojidex.history != null) {
      return new Promise(resolve => resolve(this.storage.hubCache.emojidex.history))
    }

    return new Promise(resolve => resolve([]))
  }

  categories(categories_set) {
    if (categories_set != null) {
      return this.storage.update('emojidex', { categories: categories_set })
    }

    return this.storage.hubCache.emojidex.categories
  }

  authInfo(authInfoSet) {
    if (authInfoSet != null) {
      this.EC.User.authInfo = authInfoSet
      return this.storage.update('emojidex', { auth_info: authInfoSet })
    }

    return this.storage.hubCache.emojidex.auth_info
  }
}
