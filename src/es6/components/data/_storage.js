import { CrossStorageClient } from 'cross-storage'
import _extend from 'lodash/extend'

export default class EmojidexDataStorage {
  constructor(hubPath = 'https://www.emojidex.com/hub/1.0.0') {
    this.hub = new CrossStorageClient(hubPath, { frameId: 'emojidex-client-storage-hub' })
    this.hubCache = {}
  }

  _getChainedData(query, dataObj, wrap = true) {
    query = this._getParsedQuery(query)
    const chainObj = (data, key) => {
      if (query.array.length === 0) {
        data[key] = dataObj
      } else {
        data[key] = {}
        chainObj(data[key], query.array.shift())
      }

      return data
    }

    const chained = chainObj({}, query.array.shift())
    return wrap ? chained : chained[query.first]
  }

  async _getHubData(query) {
    query = query.split('.')
    try {
      await this.connect()
      let hubData = await this.hub.get(query.shift())
      if (query.length) {
        for (let i = 0; i < query.length; i++) {
          const q = query[i]
          hubData = hubData[q]
        }
      }

      return hubData
    } catch (error) {
      console.error(error)
    }
  }

  _getParsedQuery(query) {
    const parsedQuery = query.split('.')
    return {
      code: query,
      array: parsedQuery,
      first: parsedQuery[0]
    }
  }

  // TODO: jQuery Storage APIの時の名残で文字列クエリー処理を実装したけど、そのうち書き直したい。lodashを使えば良さそう。
  get(query) {
    query = Array.isArray(query) ? query : query.split('.')
    let cache = this.hubCache
    if (query.length) {
      for (let i = 0; i < query.length; i++) {
        const q = query[i]
        if (cache[q] === undefined) {
          return null
        }

        cache = cache[q]
      }
    }

    return cache
  }

  async set(query, data) {
    const firstQuery = query.split('.')[0]
    try {
      await this.connect()
      const newData = {}
      newData[firstQuery] = data
      await this.hub.set(firstQuery, JSON.stringify(newData))

      return this.updateCache(firstQuery)
    } catch (error) {
      console.error(error)
    }
  }

  async update(query, data) {
    const merged = _extend({}, this.get(query.split('.')[0]), this._getChainedData(query, data, false))
    return this.set(query, merged)
  }

  async updateCache(key) {
    try {
      await this.connect()
      const keys = key ? key : await this.hub.getKeys()
      const hubData = await this.hub.get(keys)
      const data = JSON.parse(hubData)
      if (key) {
        this.hubCache[key] = data[key]
        return this.hubCache[key]
      }

      this.hubCache = data
      return this.hubCache
    } catch (error) {
      console.error(error)
    }
  }

  _remove(query) {
    query = this._getParsedQuery(query)
    if (query.array.length === 1) {
      return this.hub.del(query.code)
    }

    let scope = this.get(query.array.shift())
    const target = scope
    let i = 0
    while (i < query.array.length - 1) {
      scope = scope[query.array[i]]
      i++
    }

    delete scope[query.array[i]]
    return this.update(query.first, target)
  }

  async clear() {
    try {
      await this.connect()
      return this.hub.clear()
    } catch (error) {
      console.error(error)
    }
  }

  async keys(query) {
    if (query) {
      const keys = []
      const cache = this.get(query)
      for (const key in cache) {
        if (Object.prototype.hasOwnProperty.call(cache, key)) {
          keys.push(key)
        }
      }

      return keys
    }

    try {
      await this.connect()
      return this.hub.getKeys()
    } catch (error) {
      console.error(error)
    }
  }

  isEmpty(query) {
    return !this.get(query)
  }

  isSet(query) {
    return Boolean(this.get(query))
  }

  async connect() {
    await this.hub.onReadyFrame()
    return this.hub.onConnect()
  }
}
