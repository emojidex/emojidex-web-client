class EmojidexShared
  defaults: () ->
    {
      locale: 'en',
      api_url: 'https://www.emojidex.com/api/v1/',
      cdn_url: 'http://cdn.emojidex.com/emoji',
      closed_net: false,
      min_query_len: 4,
      size_code: 'px32',
      detailed: false,
      limit: 32,
    }

  # sets global default value
  constructor: (opts) ->
    opts = $.extend {}, @defaults(), opts

    # set closed network flag (for OSS distrobutions, intranet/private neworks, or closed license)
    # DO NOT set to true unless permitted by an emojidex License
    @closed_net = opts.closed_net

    # set end points
    @api_url = opts.api_url
    @cdn_url = opts.cdn_url
    @size_code = opts.size_code

    # common opts
    @detailed = opts.detailed
    @limit = opts.limit
    @locale = opts.locale

    @Data = new EmojidexData(@)
    @Emoji = new EmojidexEmoji(@)
    @Categories = new EmojidexCategories(@)
    @Indexes = new EmojidexIndexes(@)
