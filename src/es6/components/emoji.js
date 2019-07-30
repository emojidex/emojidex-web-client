export default class EmojidexEmoji {
  constructor(EC) {
    this.combine = this.combine.bind(this)
    this.EC = EC
    this._emojiInstance = []
  }

  async _emoji() {
    if (this._emojiInstance) {
      return this._emojiInstance
    }

    if (this.checkUpdate()) {
      await this.EC.Data.storage.update('emojidex.seedUpdated', new Date().toString())
      return this.seed()
    }

    this._emojiInstance = this.EC.Data.storage.get('emojidex.emoji')
    return this._emojiInstance
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
  seed() {
    return this.EC.Indexes.static(['utf_emoji', 'extended_emoji'])
  }

  all() {
    return this._emoji()
  }

  // internal collection search
  async search(term) {
    const emojis = await this._emoji()
    return emojis.filter(moji => moji.code.match(term)).map(moji => moji)
  }

  // internal collection search (starting with)
  async starting(term) {
    const emojis = await this._emoji()
    return emojis.filter(moji => moji.code.match(`^${term}`)).map(moji => moji)
  }

  // internal collection search (starting with)
  async ending(term) {
    const emojis = await this._emoji()
    return emojis.filter(moji => moji.code.match(term + '$')).map(moji => moji)
  }

  // search for emoji with the given tags
  async tags(tags, opts) {
    tags = this.EC.Util.breakout(tags)
    const selection = opts && opts.selection ? opts.selection : await this._emoji()
    let collect = []
    for (let i = 0; i < tags.length; i++) {
      collect = collect.concat(selection.filter(moji => moji.tags.indexOf(tags[i]) >= 0).map(moji => moji))
    }

    return collect
  }

  // gets emoji in any of the given categories
  async categories(categories, opts) {
    categories = this.EC.Util.breakout(categories)
    const source = opts && opts.selection ? opts.selection : await this._emoji()
    let collect = []
    for (let i = 0; i < categories.length; i++) {
      collect = collect.concat(source.filter(moji => moji.category === categories[i]).map(moji => moji))
    }

    return collect
  }

  // searches by term (regex OK), containing the tags given, in any of the given categories
  async advanced(searchs) {
    const searchResult = await this.search(searchs.term)
    const tagsResult = await this.tags(searchs.tags, { selection: searchResult })
    return this.categories(searchs.categories, { selection: tagsResult })
  }

  // Concatenates and flattens the given emoji array into the @emoji array
  async combine(emoji) {
    try {
      this._emojiInstance = await this.EC.Data.emoji(emoji)
      return this._emojiInstance
    } catch (error) {
      console.error(error)
    }
  }

  // Clears the emoji array and emoji in storage.
  // DO NOT call this unless you have a really good reason!
  flush() {
    this._emojiInstance = []
    return this.EC.Data.storage._remove('emojidex.emoji')
  }
}
