export default class EmojidexUserFollow {
  constructor(EC) {
    this.EC = EC;
    this.following = [];
    this.followers = [];
  }

  _followAPI(options) {
    if (this.EC.User.auth_info.token === null || this.EC.User.auth_info.token === undefined) return 'require auth token';

    let ajax_obj = {
      dataType: 'json',
      data: {
        auth_token: this.EC.User.auth_info.token
      },
      error: response => {
        return response;
      }
    };
    return $.ajax($.extend(true, ajax_obj, options));
  }

  getFollowing(callback) {
    let options = {
      url: this.EC.api_url + 'users/following',
      success: response => {
        this.following = response.following;
        if (typeof callback === 'function') { callback(this.following); }
      }
    };
    return this._followAPI(options);
  }

  addFollowing(username, callback) {
    if (username === null || username === undefined) return 'require username';

    let options = {
      url: this.EC.api_url + 'users/following',
      type: 'POST',
      data: { username },
      success: response => {
        if (response.username !== undefined && response.username !== null) {
          this.following.push(response.username);
        }
        if (typeof callback === 'function') { callback(this.following); }
      }
    };
    return this._followAPI(options);
  }

  deleteFollowing(username, callback) {
    if (username === null || username === undefined) return 'require username';

    let options = {
      url: this.EC.api_url + 'users/following',
      type: 'DELETE',
      data: { username },
      success: response => {
        if (response.username !== undefined && response.username !== null) {
          this.following.splice(this.following.indexOf(response.username), 1);
        }
        if (typeof callback === 'function') { callback(this.following); }
      }
    };
    return this._followAPI(options);
  }

  getFollowers(callback) {
    if (!(this.EC.User.auth_info.pro || this.EC.User.auth_info.premium)) return 'Premium or Pro accounts only';

    let options = {
      url: this.EC.api_url + 'users/followers',
      success: response => {
        this.followers = response.followers;
        if (typeof callback === 'function') { callback(this.followers); }
      }
    };
    return this._followAPI(options);
  }

  sync() {
    $.when(
      this.getFollowing(), this.getFollowers()
    ).done(() => {
      return this;
    })
  }
}
