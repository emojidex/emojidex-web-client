import axios from 'axios'

export default class EmojidexUserFollow {
  constructor(EC) {
    this.EC = EC;
    this.following = [];
    this.followers = [];
  }

  _followAPI(options) {
    if (this.EC.User.auth_info.token === null || this.EC.User.auth_info.token === undefined) return 'require auth token';

    return axios({
      method: options.type,
      url: options.url,
      params: { auth_token: this.EC.User.auth_info.token },
      data: options.data
    }).then(response => {
      return response.data;
    }).catch(response => {
      return response.response;
    });
  }

  getFollowing(callback) {
    let options = { url: `${this.EC.api_url}users/following` };
    return this._followAPI(options).then(response => {
      this.following = response.following;
      if (typeof callback === 'function') { callback(this.following); }
    });
  }

  addFollowing(username, callback) {
    if (username === null || username === undefined) return 'require username';

    let options = {
      url: `${this.EC.api_url}users/following`,
      type: 'POST',
      data: { username }
    };
    return this._followAPI(options).then(response => {
      if (response.username !== undefined && response.username !== null) {
        this.following.push(response.username);
      }
      if (typeof callback === 'function') { callback(this.following); }
    });
  }

  deleteFollowing(username, callback) {
    if (username === null || username === undefined) return 'require username';

    let options = {
      url: this.EC.api_url + 'users/following',
      type: 'DELETE',
      data: { username }
    };
    return this._followAPI(options).then(response => {
      if (response.username !== undefined && response.username !== null) {
        this.following.splice(this.following.indexOf(response.username), 1);
      }
      if (typeof callback === 'function') { callback(this.following); }
    });
  }

  getFollowers(callback) {
    if (!(this.EC.User.auth_info.pro || this.EC.User.auth_info.premium)) return 'Premium or Pro accounts only';

    let options = {
      url: this.EC.api_url + 'users/followers'
    };
    return this._followAPI(options).then(response => {
      this.followers = response.followers;
      if (typeof callback === 'function') { callback(this.followers); }
    });
  }

  sync() {
    $.when(
      this.getFollowing(), this.getFollowers()
    ).done(() => {
      return this;
    })
  }
}
