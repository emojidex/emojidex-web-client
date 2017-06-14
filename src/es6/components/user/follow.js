export default class EmojidexUserFollow {
  constructor(EC, token) {
    this.EC = EC;
    this.token = token;
    this.following = [];
    this.followers = [];
  }

  _followAPI(options) {
    if (this.token === null || this.token === undefined) return;

    let ajax_obj = {
      dataType: 'json',
      data: {
        auth_token: this.token
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
    if (username === null || username === undefined) return;

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
    if (username === null || username === undefined) return;

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
