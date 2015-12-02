helperChains = (chains_data) ->
  if chains_data.chains.length is 0
    chains_data.end()
  else
    current_chain = chains_data.chains.shift()
    current_chain chains_data

helperBefore = (chains_data) ->
  @EC = new EmojidexClient
  @EC.User.set_auth user_info.auth_user, user_info.auth_token
  helperChains chains_data

helperGetDataUseAjax = (chains_data) ->
  $.ajax
    url: 'https://www.emojidex.com/api/v1/extended_emoji'
    dataType: 'json'
    success: (response) =>
      @emoji_emojidex = response
      helperChains chains_data
