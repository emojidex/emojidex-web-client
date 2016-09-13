jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

let hub_path = 'https://www.emojidex.com/hub/0.8.2';
let helperChains = function(chains_data) {
  if (chains_data.functions.length === 0) {
    return chains_data.end();
  } else {
    let chain_function = chains_data.functions.shift();
    return chain_function(chains_data);
  }
};

let helperBefore = function(chains_data) {
  return this.EC_spec = new EmojidexClient({
    storageHubPath: hub_path,
    onReady: EC => {
      return this.EC_spec.User.set_auth(test_user_info.auth_user, test_user_info.auth_token).then(() => {
        return helperChains(chains_data);
      }
      );
    }
  });
};

let clearStorage = function(chains_data) {
  let CSC = new CrossStorageClient(hub_path,
    {frameId: 'emojidex-client-storage-hub'});
  return CSC.onConnect().then(() => {
    CSC.clear();
    return helperChains(chains_data);
  }
  );
};

let helperBeforeForEmojidexData = function(chains_data) {
  return this.EC_spec = new EmojidexClient({
    storageHubPath: hub_path,
    onReady(EC) {
      return helperChains(chains_data);
    }
  });
};

let getExtendedEmojiData = chains_data =>
  $.ajax({
    url: 'https://www.emojidex.com/api/v1/extended_emoji',
    dataType: 'json',
    success: response => {
      this.emoji_emojidex = response;
      return helperChains(chains_data);
    }
  })
;

let getFacesEmoji = chains_data =>
  $.ajax({
    url: 'https://www.emojidex.com/api/v1/emoji',
    dataType: 'json',
    data: {
      category: 'faces'
    },
    success: response => {
      this.faces_emoji = response.emoji;
      return helperChains(chains_data);
    }
  })
;

let setPremiumUser = function(chains_data) {
  return this.EC_spec.User.set_auth(premium_user_info.auth_user, premium_user_info.auth_token).then(() => {
    return helperChains(chains_data);
  }
  );
};

let spec_timer = function(option) {
  let default_option = {
    time: 100,
    callback: undefined
  };
  $.extend(default_option, option);
  if (default_option.callback != null) { return setTimeout(default_option.callback, default_option.time); }
};
