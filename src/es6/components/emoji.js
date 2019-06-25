export default class EmojidexEmoji {
  constructor(EC) {
    this.combine = this.combine.bind(this)
    this.EC = EC
    this._emoji_instance = []
  }

  _emoji() {
    if (this._emoji_instance != null) {
      return this._emoji_instance
    }

    if (this.checkUpdate()) {
      this.EC.Data.storage.update('emojidex.seedUpdated', new Date().toString())
      return this.seed()
    }

    return this._emoji_instance = this.EC.Data.storage.get('emojidex.emoji')
  }

  checkUpdate() {
    if (this.EC.Data.storage.isSet('emojidex.seedUpdated')) {
      const current = new Date()
      const updated = new Date(this.EC.Data.storage.get('emojidex.seedUpdated'))
      if (current - updated >= 3600000 * 48) {
        return true
      }

      return false
    }

    return true
  }

  // Gets the full list of caetgories available
  seed(callback) {
    return this.EC.Indexes.static(['utf_emoji', 'extended_emoji'], null, callback)
  }

  all() {
    return this._emoji()
  }

  // internal collection search
  search(term, callback) {
    const results = (this._emoji().filter(moji => moji.code.match(term)).map(moji => moji))
    if (typeof callback === 'function') {
      callback(results)
    }

    return results
  }

  // internal collection search (starting with)
  starting(term, callback) {
    const results = (this._emoji().filter(moji => moji.code.match(`^${term}`)).map(moji => moji))
    if (typeof callback === 'function') {
      callback(results)
    }

    return results
  }

  // internal collection search (starting with)
  ending(term, callback) {
    const results = (this._emoji().filter(moji => moji.code.match(term + '$')).map(moji => moji))
    if (typeof callback === 'function') {
      callback(results)
    }

    return results
  }

  // search for emoji with the given tags
  tags(tags, opts) {
    tags = this.EC.Util.breakout(tags)
    const selection = (typeof opts !== 'undefined' && typeof opts.selection !== 'undefined') ? opts.selection : this._emoji()
    let collect = []
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i]
      collect = collect.concat((selection.filter(moji => moji.tags.indexOf(tag) >= 0).map(moji => moji)))
    }

    return collect
  }

  // gets emoji in any of the given categories
  categories(categories, opts) {
    categories = this.EC.Util.breakout(categories)
    const source = (typeof opts !== 'undefined' && typeof opts.selection !== 'undefined') ? opts.selection : this._emoji()
    let collect = []
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i]
      collect = collect.concat((source.filter(moji => moji.category === category).map(moji => moji)))
    }

    return collect
  }

  // searches by term (regex OK), containing the tags given, in any of the given categories
  advanced(searchs) {
    return this.categories(
      searchs.categories,
      { selection: this.tags(searchs.tags, { selection: this.search(searchs.term) }) }
    )
  }

  // Concatenates and flattens the given emoji array into the @emoji array
  combine(emoji) {
    return this.EC.Data.emoji(emoji).then(hubData => {
      return this._emoji_instance = hubData.emoji
    }).catch(error => {
      console.error(error)
    })
  }

  // Clears the emoji array and emoji in storage.
  // DO NOT call this unless you have a really good reason!
  flush() {
    this._emoji_instance = []
    return this.EC.Data.storage._remove('emojidex.emoji')
  }
}
