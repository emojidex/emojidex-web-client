import axios from 'axios'

export default class EmojidexUserEmoji {
  constructor(EC) {
    this.EC = EC
    this.results = []
    this.curPage = 1
    this.count = 0
    this.maxPage = 0
    this.username = null
  }

  async _userEmojiAPI(page = 1) {
    const onFalsyProcess = () => {
      this.results = []
      this.curPage = 0
      this.count = 0
      return []
    }

    const param = {
      page,
      limit: this.EC.limit,
      detailed: this.EC.detailed
    }

    try {
      const response = await axios.get(`${this.EC.apiUrl}users/${this.username}/emoji`, { params: param })
      if (!response.data.emoji) {
        return onFalsyProcess()
      }

      this.meta = response.data.meta
      this.results = response.data.emoji
      this.curPage = response.data.meta.page
      this.count = response.data.meta.count
      this.maxPage = Math.floor(this.meta.total_count / this.EC.limit)
      if (this.meta.total_count % this.EC.limit > 0) {
        this.maxPage++
      }

      await this.EC.Emoji.combine(response.data.emoji)
      return response.data.emoji
    } catch (error) {
      console.error(error)
      return onFalsyProcess()
    }
  }

  get(username) {
    this.username = username
    return this._userEmojiAPI()
  }

  next() {
    if (this.maxPage === this.curPage) {
      return
    }

    return this._userEmojiAPI(this.curPage + 1)
  }

  prev() {
    if (this.curPage === 1) {
      return
    }

    return this._userEmojiAPI(this.curPage - 1)
  }
}
