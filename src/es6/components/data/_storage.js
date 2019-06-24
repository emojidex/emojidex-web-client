import { CrossStorageClient } from 'cross-storage'
import _extend from 'lodash/extend'

export default class EmojidexDataStorage {
  constructor(hub_path = 'https://www.emojidex.com/hub/1.0.0') {
    this.hub = new CrossStorageClient(hub_path, { frameId: 'emojidex-client-storage-hub' })
    this.hub_cache = {}
  }

  _get_chained_data(query, data_obj, wrap = true) {
    query = this._get_parsed_query(query)
    const chain_obj = (data, key) => {
      if (query.array.length === 0) {
        data[key] = data_obj
      } else {
        data[key] = {}
        chain_obj(data[key], query.array.shift())
      }

      return data
    }

    const chained = chain_obj({}, query.array.shift())
    return wrap ? chained : chained[query.first]
  }

  _get_hub_data(query) {
    query = query.split('.')
    return this.hub.onConnect().then(() => {
      return this.hub.get(query.shift())
    }).then(hub_data => {
      if (query.length) {
        for (let i = 0; i < query.length; i++) {
          const q = query[i]
          hub_data = hub_data[q]
        }
      }

      return hub_data
    }).catch(error => {
      console.error(error)
    })
  }

  _get_parsed_query(query) {
    const parsed_query = query.split('.')
    return query = {
      code: query,
      array: parsed_query,
      first: parsed_query[0]
    }
  }

  get(query) {
    query = Array.isArray(query) ? query : query.split('.')
    let cache = this.hub_cache
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
    const first_query = query.split('.')[0]
    return this.hub.onConnect().then(() => {
      if (update) {
        const new_data = {}
        new_data[first_query] = data
        return this.hub.set(first_query, JSON.stringify(new_data))
      }

      return this.hub.set(first_query, this._get_chained_data(query, data))
    }).then(() => {
      return this.update_cache(first_query)
    }).catch(error => {
      console.error(error)
    })
  }

  update(query, data) {
    const merged = _extend({}, this.get(query.split('.')[0]), this._get_chained_data(query, data, false))
    return this.set(query, merged, true)
  }

  update_cache(key) {
    return this.hub.onConnect().then(() => {
      return key ? key : this.hub.getKeys()
    }).then(keys => {
      return this.hub.get(keys)
    }).then(hub_data => {
      const data = JSON.parse(hub_data)
      if (key) {
        return this.hub_cache[key] = data[key]
      }

      return this.hub_cache = data
    }).catch(error => {
      console.error(error)
    })
  }

  _remove(query) {
    query = this._get_parsed_query(query)
    if (query.array.length === 1) {
      return this.hub.del(query.code)
    }

    let scope
    const target = scope = this.get(query.array.shift())
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
      for (const key in this.get(query)) {
        keys.push(key)
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
