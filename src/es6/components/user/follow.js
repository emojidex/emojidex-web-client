import axios from 'axios'

export default class EmojidexUserFollow {
  constructor(EC) {
    this.EC = EC
    this.following = []
    this.followers = []
  }

  async _followAPI(options) {
    if (!this.EC.User.authInfo.token) {
      return Promise.reject(new Error('Require auth token.'))
    }

    try {
      const response = await axios({
        method: options.type,
        url: options.url,
        params: { auth_token: this.EC.User.authInfo.token } // eslint-disable-line camelcase
      })
      return response.data
    } catch (error) {
      return error.response
    }
  }

  async getFollowing() {
    const options = { url: `${this.EC.apiUrl}users/following` }

    try {
      const response = await this._followAPI(options)
      this.following = response.following
      return this.following
    } catch (error) {
      console.error(error)
    }
  }

  async addFollowing(username) {
    if (!username) {
      return Promise.reject(new Error('Require username.'))
    }

    const options = {
      url: `${this.EC.apiUrl}users/following`,
      type: 'POST',
      params: { username }
    }

    try {
      const response = await this._followAPI(options)
      if (response.username) {
        this.following.push(response.username)
      }

      return this.following
    } catch (error) {
      console.error(error)
    }
  }

  async deleteFollowing(username) {
    if (!username) {
      return Promise.reject(new Error('Require username.'))
    }

    const options = {
      url: `${this.EC.apiUrl}users/following`,
      type: 'DELETE',
      params: { username }
    }

    try {
      const response = await this._followAPI(options)
      if (response.username) {
        this.following.splice(this.following.indexOf(response.username), 1)
      }

      return this.following
    } catch (error) {
      console.error(error)
    }
  }

  async getFollowers() {
    if (!this.EC.User.isSubscriber()) {
      return Promise.reject(new Error('Premium or Pro accounts only'))
    }

    const options = { url: `${this.EC.apiUrl}users/followers` }
    try {
      const response = await this._followAPI(options)
      this.followers = response.followers
      return this.followers
    } catch (error) {
      console.error(error)
    }
  }

  async sync() {
    await Promise.all(
      this.EC.User.isSubscriber() ? [this.getFollowing(), this.getFollowers()] : [this.getFollowing()]
    )
    return this
  }
}
