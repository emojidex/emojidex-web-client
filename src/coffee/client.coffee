# emojidex coffee client
# * Provides search, index caching and combining and asset URI resolution
#
# =LICENSE=
# Licensed under the emojidex Open License
# https://www.emojidex.com/emojidex/emojidex_open_license
#
# Copyright 2013 Genshin Souzou Kabushiki Kaisha

class @EmojidexClient
  constructor: (opts = {}) ->
    @Util = new EmojidexUtil
    @S = new EmojidexShared(opts)
    @Data = @S.Data
    @Emoji = @S.Emoji
    @Categories = @S.Categories
    @Indexes = @S.Indexes
    @User = @S.User
    @Search = new EmojidexSearch(@S)
