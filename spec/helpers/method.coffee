helperChains = (chains_data) ->
  if chains_data.functions.length is 0
    chains_data.end()
  else
    chain_function = chains_data.functions.shift()
    chain_function chains_data

helperBefore = (chains_data) ->
  @EC = new EmojidexClient
  @EC.User.set_auth user_info.auth_user, user_info.auth_token
  helperChains chains_data

helperExtendedEmojiData = (chains_data) ->
  $.ajax
    url: 'https://www.emojidex.com/api/v1/extended_emoji'
    dataType: 'json'
    success: (response) =>
      @emoji_emojidex = response
      helperChains chains_data

getCosmosEmoji = (chains_data) ->
  $.ajax
    url: 'https://www.emojidex.com/api/v1/categories/cosmos/emoji'
    dataType: 'json'
    success: (response) =>
      @cosmos_emoji = response.emoji
      helperChains chains_data

getCosmosNewest = (chains_data) ->
  $.ajax
    url: 'https://www.emojidex.com/api/v1/categories/cosmos/newest'
    dataType: 'json'
    success: (response) =>
      @cosmos_newest = response.emoji
      helperChains chains_data
