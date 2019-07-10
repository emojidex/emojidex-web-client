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

  _getHubData(query) {
    query = query.split('.')
    return this.hub.onConnect().then(() => {
      return this.hub.get(query.shift())
    }).then(hubData => {
      if (query.length) {
        for (let i = 0; i < query.length; i++) {
          const q = query[i]
          hubData = hubData[q]
        }
      }

      return hubData
    }).catch(error => {
      console.error(error)
    })
  }

  _getParsedQuery(query) {
    const parsedQuery = query.split('.')
    return {
      code: query,
      array: parsedQuery,
      first: parsedQuery[0]
    }
  }

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

  set(query, data, update) {
    const firstQuery = query.split('.')[0]
    return this.hub.onConnect().then(() => {
      if (update) {
        const newData = {}
        newData[firstQuery] = data
        return this.hub.set(firstQuery, JSON.stringify(newData))
      }

      return this.hub.set(firstQuery, this._getChainedData(query, data))
    }).then(() => {
      return this.updateCache(firstQuery)
    }).catch(error => {
      console.error(error)
    })
  }

  update(query, data) {
    const merged = _extend({}, this.get(query.split('.')[0]), this._getChainedData(query, data, false))
    return this.set(query, merged, true)
  }

  updateCache(key) {
    return this.hub.onConnect().then(() => {
      return key ? key : this.hub.getKeys()
    }).then(keys => {
      return this.hub.get(keys)
    }).then(hubData => {
      const data = JSON.parse(hubData)
      if (key) {
        this.hubCache[key] = data[key]
        return this.hubCache[key]
      }

      this.hubCache = data
      return this.hubCache
    }).catch(error => {
      console.error(error)
    })
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

  clear() {
    return this.hub.onConnect().then(() => {
      return this.hub.clear()
    }).catch(error => {
      console.error(error)
    })
  }

  keys(query) {
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

    return this.hub.onConnect().then(() => {
      return this.hub.getKeys()
    }).catch(error => {
      console.error(error)
    })
  }

  isEmpty(query) {
    return !this.get(query)
  }

  isSet(query) {
    return Boolean(this.get(query))
  }
}
