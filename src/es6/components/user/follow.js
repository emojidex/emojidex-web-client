import axios from 'axios'

export default class EmojidexUserFollow {
  constructor(EC) {
    this.EC = EC
    this.following = []
    this.followers = []
  }

  _followAPI(options) {
    if (this.EC.User.auth_info.token === null || this.EC.User.auth_info.token === undefined) {
      return Promise.reject(new Error('Require auth token.'))
    }

    return axios({
      method: options.type,
      url: options.url,
      params: { auth_token: this.EC.User.auth_info.token },
      data: options.data
    }).then(response => {
      return response.data
    }).catch(error => {
      return error.response
    })
  }

  getFollowing(callback) {
    const options = { url: `${this.EC.api_url}users/following` }
    return this._followAPI(options).then(response => {
      this.following = response.following
      if (typeof callback === 'function') {
        callback(this.following)
      }
    }).catch(error => {
      console.error(error)
    })
  }

  addFollowing(username, callback) {
    if (username === null || username === undefined) {
      return Promise.reject(new Error('Require username.'))
    }

    const options = {
      url: `${this.EC.api_url}users/following`,
      type: 'POST',
      data: { username }
    }
    return this._followAPI(options).then(response => {
      if (response.username !== undefined && response.username !== null) {
        this.following.push(response.username)
      }

      if (typeof callback === 'function') {
        callback(this.following)
      }
    }).catch(error => {
      console.error(error)
    })
  }

  deleteFollowing(username, callback) {
    if (username === null || username === undefined) {
      return Promise.reject(new Error('Require username.'))
    }

    const options = {
      url: `${this.EC.api_url}users/following`,
      type: 'DELETE',
      data: { username }
    }
    return this._followAPI(options).then(response => {
      if (response.username !== undefined && response.username !== null) {
        this.following.splice(this.following.indexOf(response.username), 1)
      }

      if (typeof callback === 'function') {
        callback(this.following)
      }
    }).catch(error => {
      console.error(error)
    })
  }

  getFollowers(callback) {
    if (!(this.EC.User.auth_info.pro || this.EC.User.auth_info.premium)) {
      return Promise.reject(new Error('Premium or Pro accounts only'))
    }

    const options = { url: `${this.EC.api_url}users/followers` }
    return this._followAPI(options).then(response => {
      this.followers = response.followers
      if (typeof callback === 'function') {
        callback(this.followers)
      }
    }).catch(error => {
      console.error(error)
    })
  }

  sync() {
    Promise.all(
      [this.getFollowing(), this.getFollowers()]
    ).then(() => {
      return this
    })
  }
}
