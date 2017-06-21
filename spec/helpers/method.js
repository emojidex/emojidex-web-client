jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

this.EC_spec = null;

let hub_path = 'https://www.emojidex.com/hub/1.0.0';
let helperChains = function(chains_data) {
  if (chains_data.functions.length === 0) {
    chains_data.end();
  } else {
    let chain_function = chains_data.functions.shift();
    chain_function(chains_data);
  }
};
this.helperChains = helperChains;

let helperBefore = function(chains_data) {
  this.EC_spec = new EmojidexClient({
    storageHubPath: hub_path,
    onReady: EC => {
      EC.User.login({ authtype: 'token', username: test_user_info.auth_user, auth_token: test_user_info.auth_token }).then(() => {
        helperChains(chains_data);
      });
    }
  });
};
this.helperBefore = helperBefore;

let helperBeforeForPremiumUser = function(chains_data) {
  this.EC_spec = new EmojidexClient({
    storageHubPath: hub_path,
    onReady: EC => {
      this.EC_spec.User.login({ authtype: 'token', username: premium_user_info.auth_user, auth_token: premium_user_info.auth_token }).then(() => {
        helperChains(chains_data);
      });
    }
  });
};
this.helperBeforeForPremiumUser = helperBeforeForPremiumUser;

let clearStorage = function(chains_data) {
  let CSC = new CrossStorageClient(hub_path, {frameId: 'emojidex-client-storage-hub'});
  CSC.onReadyFrame().then(() => {
    return CSC.onConnect();
  }).then(() => {
    CSC.clear();
  }).then(() => {
    helperChains(chains_data);
  });
};
this.clearStorage = clearStorage;

let helperBeforeForEmojidexData = function(chains_data) {
  this.EC_spec = new EmojidexClient({
    storageHubPath: hub_path,
    onReady: EC => {
      helperChains(chains_data);
    }
  });
};
this.helperBeforeForEmojidexData = helperBeforeForEmojidexData;

let getExtendedEmojiData = chains_data =>
  $.ajax({
    url: 'https://www.emojidex.com/api/v1/extended_emoji',
    dataType: 'json',
    success: response => {
      this.emoji_emojidex = response;
      helperChains(chains_data);
    }
  });

let getFacesEmoji = chains_data =>
  $.ajax({
    url: 'https://www.emojidex.com/api/v1/emoji',
    dataType: 'json',
    data: {
      category: 'faces'
    },
    success: response => {
      this.faces_emoji = response.emoji;
      helperChains(chains_data);
    }
  });

let setPremiumUser = function(chains_data) {
  this.EC_spec.User.setAuth(premium_user_info.auth_user, premium_user_info.auth_token).then(() => {
    helperChains(chains_data);
  });
};

let spec_timer = function(option) {
  let default_option = {
    time: 100,
    callback: undefined
  };
  $.extend(default_option, option);
  if (default_option.callback != null) { setTimeout(default_option.callback, default_option.time); }
};
