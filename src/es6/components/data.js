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

    if (this.options.storageHubPath) {
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

      /* eslint-disable camelcase */

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

      /* eslint-enable camelcase */
    }).then(() => {
      if (this._needUpdate()) {
        return this._initMojiCodes()
      }

      return this.storage.get('emojidex')
    }).then(() => {
      this.mojiCodes = this.storage.get('emojidex.moji_codes')
      this.EC.Data = this
      return this.EC.Data
    }).catch(error => {
      console.error(error)
    })
  }

  _initMojiCodes() {
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
      const current = new Date()
      const updated = new Date(this.storage.get('emojidex.utfInfoUpdated'))
      // ２週間に一度更新する
      if (current - updated >= 3600000 * 24 * 14) {
        return true
      }

      return false
    }

    return true
  }

  emoji(emojiSet) {
    if (emojiSet) {
      if (this.storage.hubCache.emojidex.emoji &&
          this.storage.hubCache.emojidex.emoji.length > 0) {
        const hubEmoji = this.storage.hubCache.emojidex.emoji
        for (let i = 0; i < emojiSet.length; i++) {
          const newEmoji = emojiSet[i]
          for (let j = 0; j < hubEmoji.length; j++) {
            const emoji = hubEmoji[j]
            if (newEmoji.code === emoji.code) {
              hubEmoji.splice(hubEmoji.indexOf(emoji), 1, newEmoji)
              break
            } else if (emoji === hubEmoji[hubEmoji.length - 1]) {
              hubEmoji.push(newEmoji)
            }
          }
        }

        return this.storage.update('emojidex', { emoji: hubEmoji })
      }

      return this.storage.update('emojidex', { emoji: emojiSet })
    }

    if (this.storage.hubCache.emojidex.emoji) {
      return this.storage.hubCache.emojidex.emoji
    }

    return undefined
  }

  async favorites(favoritesSet) {
    if (favoritesSet) {
      if (this.storage.hubCache.emojidex.favorites && this.storage.hubCache.emojidex.favorites.length > 0) {
        const hubEmoji = this.createEmojisForUpdate(this.storage.hubCache.emojidex.favorites, favoritesSet)
        await this.storage.update('emojidex', { favorites: hubEmoji })
      } else {
        await this.storage.update('emojidex', { favorites: favoritesSet })
      }
    }

    return this.storage.hubCache.emojidex.favorites || []
  }

  async history(historySet) {
    if (historySet) {
      if (this.storage.hubCache.emojidex.history && this.storage.hubCache.emojidex.history.length > 0) {
        const hubEmoji = this.createEmojisForUpdate(this.storage.hubCache.emojidex.history, historySet)
        await this.storage.update('emojidex', { history: hubEmoji })
      } else {
        await this.storage.update('emojidex', { history: historySet })
      }
    }

    return this.storage.hubCache.emojidex.history || []
  }

  createEmojisForUpdate(localEmojis, remoteEmojis) {
    for (let i = 0; i < remoteEmojis.length; i++) {
      const remoteEmoji = remoteEmojis[i]
      for (let j = 0; j < localEmojis.length; j++) {
        const localEmoji = localEmojis[j]
        if (remoteEmoji.code === localEmoji.code) {
          localEmojis[j] = remoteEmoji
          break
        } else if (localEmojis.length === j + 1) {
          localEmojis.push(remoteEmoji)
        }
      }
    }

    return localEmojis
  }

  async categories(categoriesSet) {
    if (categoriesSet) {
      await this.storage.update('emojidex', { categories: categoriesSet })
    }

    return this.storage.hubCache.emojidex.categories || []
  }

  async authInfo(authInfoSet) {
    if (authInfoSet) {
      this.EC.User.authInfo = authInfoSet
      await this.storage.update('emojidex', { auth_info: authInfoSet }) // eslint-disable-line camelcase
      return this.storage.hubCache.emojidex.auth_info
    }

    return this.storage.hubCache.emojidex.auth_info
  }
}
