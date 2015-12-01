helperBefore = (done)->
  @EC = new EmojidexClient
  @EC.User.set_auth user_info.auth_user, user_info.auth_token

  $.ajax
    url: 'https://www.emojidex.com/api/v1/extended_emoji'
    dataType: 'json'
    success: (response) =>
      @emoji_emojidex = response
      done()
