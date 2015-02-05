@for_beforeEach = ->
  @EC = new EmojidexClient
  @EC.User.set_auth user_info.auth_user, user_info.auth_token
