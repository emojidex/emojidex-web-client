# emojidex coffee client
# * Provides search, index caching and combining and asset URI resolution
#
# require: jquery.storageapi
#
# =LICENSE=
# Licensed under the emojidex Open License
# https://www.emojidex.com/emojidex/emojidex_open_license
#
# Copyright 2013 Genshin Souzou Kabushiki Kaisha

class @EmojidexClient
  constructor: (options) ->
    @env =
      api_ver: 1
      cdn_addr: 'cdn.emojidex.com'
      s_cdn_addr: ''
      asset_addr: 'assets.emojidex.com'
      s_asset_addr: ''

    # sets global default value
    @defaults =
      locale: 'en'
      api_url: 'https://www.emojidex.com/api/v1/'
      cdn_url: "http://#{@env.cdn_addr}/emoji/"
      closed_net: false
      min_query_len: 4
      size_code: 'px32'
      detailed: false
      limit: 32

    @options = $.extend {}, @defaults, options

    # set closed network flag (for OSS distrobutions, intranet/private neworks, or closed license)
    # DO NOT set to true unless permitted by an emojidex License
    @closed_net = @options.closed_net

    # set end points
    @api_url = @options.api_url
    @cdn_url = @options.cdn_url
    @size_code = @options.size_code

    # common @options
    @detailed = @options.detailed
    @limit = @options.limit
    @locale = @options.locale

    # new Emojidex modules
    @Data = new EmojidexData @
    @Categories = new EmojidexCategories @
    @User = new EmojidexUser @
    @Indexes = new EmojidexIndexes @
    # @Util = new EmojidexUtil @
    @Search = new EmojidexSearch @
    @Emoji = new EmojidexEmoji @
