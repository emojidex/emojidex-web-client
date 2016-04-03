hub_path = 'http://localhost:8001/build/hub.html'
# hub_path = 'https://www.emojidex.com/hub'
helperChains = (chains_data) ->
  if chains_data.functions.length is 0
    chains_data.end()
  else
    chain_function = chains_data.functions.shift()
    chain_function chains_data

helperBefore = (chains_data) ->
  @EC_spec = new EmojidexClient
    storageHubPath: hub_path
    onReady: (EC) =>
      @EC_spec.User.set_auth(test_user_info.auth_user, test_user_info.auth_token).then ->
        helperChains chains_data

helperBeforeForEmojidexData = (chains_data) ->
  CSC = new CrossStorageClient hub_path,
    frameId: 'emojidex-client-storage-hub'
  CSC.onConnect().then( =>
    CSC.clear()
  ).then =>
    @EC_spec = new EmojidexClient
      storageHubPath: hub_path
      onReady: (EC) ->
        helperChains chains_data

getExtendedEmojiData = (chains_data) ->
  $.ajax
    url: 'https://www.emojidex.com/api/v1/extended_emoji'
    dataType: 'json'
    success: (response) =>
      @emoji_emojidex = response
      helperChains chains_data

getFacesEmoji = (chains_data) ->
  $.ajax
    url: 'https://www.emojidex.com/api/v1/emoji'
    dataType: 'json'
    data:
      category: 'faces'
    success: (response) =>
      @faces_emoji = response.emoji
      helperChains chains_data

setPremiumUser = (chains_data) ->
  @EC_spec.User.set_auth(premium_user_info.auth_user, premium_user_info.auth_token).then ->
    helperChains chains_data

spec_timer = (option) ->
  default_option =
    time: 100
    callback: undefined
  $.extend default_option, option
  setTimeout(default_option.callback, default_option.time) if default_option.callback?
