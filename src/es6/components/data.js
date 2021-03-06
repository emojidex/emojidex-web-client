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

    return this.initialize()
  }

  async initialize() {
    try {
      const keys = await this.storage.keys()
      if (keys.indexOf('emojidex') === -1) {
        /* eslint-disable camelcase */
        await this.storage.update('emojidex', {
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
      } else {
        await this.storage.updateCache('emojidex')
      }

      if (this._needUpdate()) {
        await this._initMojiCodes()
      }

      this.mojiCodes = this.storage.get('emojidex.moji_codes')
      return this
    } catch (error) {
      console.error(error)
    }
  }

  async _initMojiCodes() {
    try {
      await this.storage.update('emojidex.moji_codes_updated', new Date().toString())
      const response = await axios.get(`${this.EC.apiUrl}moji_codes?locale=${this.EC.locale}`)
      return this.storage.update('emojidex.moji_codes', response.data)
    } catch (error) {
      console.error(error)
    }
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

  async emoji(emojiSet) {
    if (emojiSet) {
      if (this.storage.hubCache.emojidex.emoji && this.storage.hubCache.emojidex.emoji.length > 0) {
        emojiSet = this.createEmojisForUpdate(this.storage.hubCache.emojidex.emoji, emojiSet)
      }

      await this.storage.update('emojidex.emoji', emojiSet)
    }

    return this.storage.hubCache.emojidex.emoji || []
  }

  async favorites(favoritesSet) {
    if (favoritesSet) {
      if (this.storage.hubCache.emojidex.favorites && this.storage.hubCache.emojidex.favorites.length > 0) {
        favoritesSet = this.createEmojisForUpdate(this.storage.hubCache.emojidex.favorites, favoritesSet)
      }

      if (!this.storage.hubCache.emojidex.auth_info.premium && !this.storage.hubCache.emojidex.auth_info.pro) {
        favoritesSet = favoritesSet.slice(0, 50)
      }

      await this.storage.update('emojidex.favorites', favoritesSet)
    }

    return this.storage.hubCache.emojidex.favorites || []
  }

  async history(historySet) {
    if (historySet) {
      if (this.storage.hubCache.emojidex.history && this.storage.hubCache.emojidex.history.length > 0) {
        historySet = this.createEmojisForUpdate(this.storage.hubCache.emojidex.history, historySet)
      }

      if (!this.storage.hubCache.emojidex.auth_info.premium && !this.storage.hubCache.emojidex.auth_info.pro) {
        historySet = historySet.slice(0, 50)
      }

      await this.storage.update('emojidex.history', historySet)
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
      await this.storage.update('emojidex.categories', categoriesSet)
    }

    return this.storage.hubCache.emojidex.categories || []
  }

  async authInfo(authInfoSet) {
    if (authInfoSet) {
      await this.storage.update('emojidex.auth_info', authInfoSet)
    }

    return this.storage.hubCache.emojidex.auth_info
  }
}
