class EmojidexDataStorage {
  constructor(hub_path = 'https://www.emojidex.com/hub/1.0.0') {
    this.hub = new CrossStorageClient(hub_path,
      {frameId: 'emojidex-client-storage-hub'});
    this.hub_cache = {};
  }

  _get_chained_data(query, data_obj, wrap=true) {
    query = this._get_parsed_query(query);
    let chain_obj = function(data, key) {
      if (query.array.length === 0) {
        data[key] = data_obj;
      } else {
        data[key] = {};
        chain_obj(data[key], query.array.shift());
      }
      return data;
    };

    let chained = chain_obj({}, query.array.shift());
    return wrap ? chained : chained[query.first];
  }

  _get_hub_data(query) {
    query = query.split('.');
    return this.hub.onConnect().then(() => {
      return this.hub.get(query.shift());
    }
    ).then(function(hub_data){
      if (query.length) {
        for (let i = 0; i < query.length; i++) {
          let q = query[i];
          hub_data = hub_data[q];
        }
      }
      return hub_data;
    });
  }

  _get_parsed_query(query) {
    let parsed_query = query.split('.');
    return query = {
      code: query,
      array: parsed_query,
      first: parsed_query[0]
    };
  }

  get(query) {
    query = query instanceof Array ? query : query.split('.');
    let cache = this.hub_cache;
    if (query.length) {
      for (let i = 0; i < query.length; i++) {
        let q = query[i];
        if (cache[q] === undefined ) {
          return null;
        }
        cache = cache[q];
      }
    }
    return cache;
  }

  set(query, data, update) {
    let first_query = query.split('.')[0];
    return this.hub.onConnect().then( () => {
      if (update) {
        let new_data = {};
        new_data[first_query] = data;
        return this.hub.set(first_query, JSON.stringify(new_data));
      } else {
        return this.hub.set(first_query, this._get_chained_data(query, data));
      }
    }
    ).then(() => {
      return this.update_cache(first_query);
    }
    );
  }

  update(query, data) {
    let merged = $.extend(true, {}, this.get(query.split('.')[0]), this._get_chained_data(query, data, false));
    return this.set(query, merged, true);
  }

  update_cache(key) {
    return this.hub.onConnect().then( () => {
      if (key) { return key; } else { return this.hub.getKeys(); }
    }
    ).then(keys => {
      return this.hub.get(keys);
    }
    ).then(hub_data => {
      data = $.parseJSON(hub_data);
      if (key) {
        return this.hub_cache[key] = data[key];
      } else {
        return this.hub_cache = data;
      }
    }
    );
  }

  _remove(query) {
    query = this._get_parsed_query(query);
    if (query.array.length === 1) {
      return this.hub.del(query.code);
    } else {
      let scope;
      let target = scope = this.get(query.array.shift());
      let i = 0;
      while (i < query.array.length - 1) {
        scope = scope[query.array[i]];
        i++;
      }
      delete scope[query.array[i]];
      return this.update(query.first, target);
    }
  }

  clear() {
    return this.hub.onConnect().then(() => {
      return this.hub.clear();
    }
    );
  }

  keys(query) {
    if (query) {
      let keys = [];
      for (let key in this.get(query)) {
        keys.push(key);
      }
      return keys;

    } else {
      return this.hub.onConnect().then(() => {
        return this.hub.getKeys();
      }
      );
    }
  }

  isEmpty(query) {
    if (this.get(query)) { return false; } else { return true; }
  }

  isSet(query) {
    if (this.get(query)) { return true; } else { return false; }
  }
}
