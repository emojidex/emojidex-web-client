###
emojidex coffee plugin for jQuery/Zepto and compatible

=LICENSE=
Licensed under the emojidex Open License
https://www.emojidex.com/emojidex/emojidex_open_license

Copyright 2013 Genshin Souzou Kabushiki Kaisha
###

do ($ = jQuery, window, document) ->
  pluginName = "emojidex"
  defaults =
    emojiarea:
      plain_text: ".emojidex-plain_text"
      content_editable: ".emojidex-content_editable"

  $.fn[pluginName] = (options) ->
    @each ->
      if !$.data(@, "plugin_#{pluginName}")
        $.data(@, "plugin_#{pluginName}", new Plugin(@, options))

  class Plugin
    constructor: (@element, options) ->
      @emojis_data_array = []

      @options = $.extend {}, defaults, options
      @_defaults = defaults
      @_name = pluginName

      @api_emojis = new EmojisLoaderAPI @element, @options
      @api_emojis.load =>
        @emojis_data_array.push @api_emojis.emojis_data
        @checkLoadedEmojisData()

    checkLoadedEmojisData: ->
      if @emojis_data_array
        @setAutoComplete @options

        # @emojis_pallet = new EmojisPallet @emojis_data_array, $("#ep"), @options
        # @emojis_pallet.setPallet()

    setAutoComplete: (options) ->
      emojis = []
      for emojis_data in @emojis_data_array
        for category of emojis_data
          for emoji in emojis_data[category]
            emojis.push
              code: emoji.code
              img_url: emoji.img_url

      testCallback = (data)->
        console.log 111

      at_config =
        callback: testCallback
        at: ":"
        limit: 10
        search_key: "code"
        data: emojis
        tpl: "<li data-value=':${code}:'><img src='${img_url}' height='20' width='20' /> ${code}</li>"
        insert_tpl: "<img src='${img_url}' height='20' width='20' />"
      $(options.emojiarea["plain_text"]).atwho(at_config)
      $(options.emojiarea["content_editable"]).atwho(at_config)

    setEmojiarea: (options) ->
      options.emojiarea["plaintext"].emojiarea wysiwyg: false
      # options.emojiarea["wysiwyg"].emojiarea wysiwyg: true
      options.emojiarea["wysiwyg"].on "change", ->
        console.dir @
        # console.dir options.emojiarea["rawtext"].text
        options.emojiarea["rawtext"].text $(this).val()
      options.emojiarea["wysiwyg"].trigger "change"

class EmojisLoader
  emojis_data: null
  element: null
  options: null
  emoji_regexps: null

  getCategorizedData: (emojis_data) ->
    new_emojis_data = {}
    for emoji in emojis_data

      if emoji.category is null
        unless new_emojis_data.uncategorized? 
          new_emojis_data.uncategorized = [emoji]
        else
          new_emojis_data.uncategorized.push emoji

      else
        unless new_emojis_data[emoji.category]? 
          new_emojis_data[emoji.category] = [emoji]
        else
          new_emojis_data[emoji.category].push emoji

    return new_emojis_data

  setEmojiCSS_getEmojiRegexps: (emojis_data) ->
    regexp_for_utf = ""
    regexp_for_code = ":("

    emojis_css = $('<style type="text/css" />')
    for category of emojis_data
      emojis_in_category = emojis_data[category]
      for emoji in emojis_in_category
        regexp_for_utf += emoji.moji + "|"
        regexp_for_code += emoji.code + "|"
        emojis_css.append "i.emojidex-" + emoji.code + " {background-image: url('" + emoji.img_url + "')}"
    $("head").append emojis_css
    
    return utf: regexp_for_utf.slice(0, -1), code: regexp_for_code.slice(0, -1) + "):"

  getEmojiTag: (emoji_code) ->
    return '<i class="emojidex-' + emoji_code + '"></i>'
  
  replaceForUTF: (options) ->
    replaced_string = options.s_replace.replace new RegExp(options.regexp, "g"), (matched_string) ->
      for category of options.emojis_data
        for emoji in options.emojis_data[category]
          if emoji.moji is matched_string
            return EmojisLoader::getEmojiTag emoji.code
  
  replaceForCode: (options) ->
    replaced_string = options.s_replace.replace new RegExp(options.regexp, "g"), (matched_string) ->
      matched_string = matched_string.replace /:/g, ""
      for category of options.emojis_data
        for emoji in options.emojis_data[category]
          if emoji.code is matched_string
            return EmojisLoader::getEmojiTag emoji.code

  setEmojiIcon: (loader) ->
    $(@element).find(":not(iframe,textarea,script)").andSelf().contents().filter(->
      @nodeType is Node.TEXT_NODE
    ).each ->
      replaced_string = @textContent
      replaced_string = EmojisLoader::replaceForUTF s_replace: replaced_string, regexp: loader.emoji_regexps.utf, emojis_data: loader.emojis_data if loader.emoji_regexps.utf?
      replaced_string = EmojisLoader::replaceForCode s_replace: replaced_string, regexp: loader.emoji_regexps.code, emojis_data: loader.emojis_data if loader.emoji_regexps.code?
      $(@).replaceWith replaced_string

class EmojisLoaderAPI extends EmojisLoader
  constructor: (@element, @options) ->
    super

  load: (callback)->
    onLoadEmojisData = (emojis_data) =>
      # fix data for At.js --------
      for emoji in emojis_data
        emoji.code = emoji.code.replace RegExp(" ", "g"), "_"
        emoji.img_url = "http://assets.emojidex.com/emoji/px32/#{emoji.code}.png"

      # console.dir emojis_data
      @emojis_data = @getCategorizedData emojis_data
      @emoji_regexps = @setEmojiCSS_getEmojiRegexps @emojis_data
      @setEmojiIcon @
      callback @

    # start main --------
    @getEmojiDataFromAPI onLoadEmojisData
    @

  getEmojiDataFromAPI: (callback) ->
    loaded_num = 0
    user_names = ["emojidex", "emoji"]
    emojis_data = []

    for user_name in user_names
      $.ajaxSetup beforeSend: (jqXHR, settings) ->
        # set user_name for loaded flag
        jqXHR.user_name = user_name

      $.ajax
        url: "https://www.emojidex.com/api/v1/users/" + user_name + "/emoji"
        dataType: "json"
        type: "get"

        success: (user_emojis_json, status, xhr) ->
          # console.log "success: load json"
          emojis_data = emojis_data.concat user_emojis_json.emoji
          if ++loaded_num is user_names.length
            callback emojis_data

        error: (data) ->
          console.log "error: load json"
          console.log data

class EmojisPallet
  constructor: (@emojis_data_array, @element, @options) ->
    @KEY_ESC = 27
    @KEY_TAB = 9

  setPallet: ->
    # console.log @options

    # @element.click ->
    #   showPallet()
###
emojidex coffee client
* Provides search, index caching and combining and asset URI resolution

=LICENSE=
Licensed under the emojidex Open License
https://www.emojidex.com/emojidex/emojidex_open_license

Copyright 2013 Genshin Souzou Kabushiki Kaisha
###

class EmojidexClient
  constructor: (pre_cache_utf = false,
                  locale = 'en',
                  api_uri = 'https://www.emojidex.com/api/v1/',
                  cdn_uri = 'http://cdn.emojidex.com') ->
    @api_uri = api_uri
    @cdn_uri = cdn_uri
    @emoji = []
    @history = []
    @favorites = []

    if auto_login
      get_history
      get_favorites

    if pre_cache_utf
      switch locale
        when 'en' then user_emoji('emoji')
        when 'ja' then user_emoji('絵文字')

  # Breaks down a search string into arrays of search keys and tags and performs a search
  search_by_string: (search_string, page = 1, limit = 20) ->
    keys = []
    tags = []
    # TODO ストリングを分解する
    search(keys, tags, page, limit)

  # Searches using an array of keys and an array of tags
  search: (keys, tags, page = 1, limit = 20) ->
    

  # Obtains a collection
  user_emoji: (username, page = 1, limit = 20) ->
    $.getJSON((@api_uri +  'users/' + username + '/emoji'

  # Checks for local saved login data, and if present sets the username and api_key
  auto_login: () ->
    @username = nil
    @api_key = nil
    # TODO ローカルを確認してクッキー度にログイン情報(usernameとapi_key)があれば使う
    # TODO api_keyの暗号を解かすことを忘れなく

  login: (username = nil, password = nil) ->
    # TODO usernameとpasswordでログインし、成功したら@usernameと@api_keyを設定する. passwordを保存しないこと
    # TODO 絶対にapi_keyを保存する時に暗号化すること!

  get_history: (page = 1, limit = 50) ->
    if @api_key != nil
      # TODO get history

  set_history: (emoji_code) ->
    if @api_key != nil
      # TODO ユーザー履歴に追加
    else
      # TODO グローバル履歴に追加

  get_favorites: (page = 1, limit = 50) ->
    if @api_key != nil
      # TODO get favorites

  set_favorites: (emoji_code) ->
    if @api_key != nil
      # TODO お気に入りに追加

###
emojiarea.poe
@author Yusuke Matsui

emojiarea - A rich textarea control that supports emojis, WYSIWYG-style.
Copyright (c) 2012 DIY Co

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
file except in compliance with the License. You may obtain a copy of the License at:
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.

@author Brian Reavis <brian@diy.org>
###
(($, window, document) ->
  ELEMENT_NODE = 1
  TEXT_NODE = 3
  TAGS_BLOCK = [
    "p"
    "div"
    "pre"
    "form"
  ]
  KEY_ESC = 27
  KEY_TAB = 9
  
  # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  $.emojiarea =
    path: ""
    icons: {}
    defaults:
      button: null
      buttonLabel: "Emojis"
      buttonPosition: "after"

  $.fn.emojiarea = (options) ->
    options = $.extend({}, $.emojiarea.defaults, options)
    @each ->
      $textarea = $(this)
      if "contentEditable" of document.body and options.wysiwyg isnt false
        new EmojiArea_WYSIWYG($textarea, options)
      else
        new EmojiArea_Plain($textarea, options)
      return


  
  # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  util = {}
  util.restoreSelection = (->
    if window.getSelection
      (savedSelection) ->
        sel = window.getSelection()
        sel.removeAllRanges()
        i = 0
        len = savedSelection.length

        while i < len
          sel.addRange savedSelection[i]
          ++i
        return
    else if document.selection and document.selection.createRange
      (savedSelection) ->
        savedSelection.select()  if savedSelection
        return
  )()
  util.saveSelection = (->
    if window.getSelection
      ->
        sel = window.getSelection()
        ranges = []
        if sel.rangeCount
          i = 0
          len = sel.rangeCount

          while i < len
            ranges.push sel.getRangeAt(i)
            ++i
        ranges
    else if document.selection and document.selection.createRange
      ->
        sel = document.selection
        (if (sel.type.toLowerCase() isnt "none") then sel.createRange() else null)
  )()
  util.replaceSelection = (->
    if window.getSelection
      (content) ->
        range = undefined
        sel = window.getSelection()
        node = (if typeof content is "string" then document.createTextNode(content) else content)
        if sel.getRangeAt and sel.rangeCount
          range = sel.getRangeAt(0)
          range.deleteContents()
          range.insertNode document.createTextNode(" ")
          range.insertNode node
          range.setStart node, 0
          window.setTimeout (->
            range = document.createRange()
            range.setStartAfter node
            range.collapse true
            sel.removeAllRanges()
            sel.addRange range
            return
          ), 0
        return
    else if document.selection and document.selection.createRange
      (content) ->
        range = document.selection.createRange()
        if typeof content is "string"
          range.text = content
        else
          range.pasteHTML content.outerHTML
        return
  )()
  util.insertAtCursor = (text, el) ->
    text = " " + text
    val = el.value
    endIndex = undefined
    startIndex = undefined
    range = undefined
    if typeof el.selectionStart isnt "undefined" and typeof el.selectionEnd isnt "undefined"
      startIndex = el.selectionStart
      endIndex = el.selectionEnd
      el.value = val.substring(0, startIndex) + text + val.substring(el.selectionEnd)
      el.selectionStart = el.selectionEnd = startIndex + text.length
    else if typeof document.selection isnt "undefined" and typeof document.selection.createRange isnt "undefined"
      el.focus()
      range = document.selection.createRange()
      range.text = text
      range.select()
    return

  util.extend = (a, b) ->
    a = {}  if typeof a is "undefined" or not a
    if typeof b is "object"
      for key of b
        a[key] = b[key]  if b.hasOwnProperty(key)
    a

  util.escapeRegex = (str) ->
    (str + "").replace /([.?*+^$[\]\\(){}|-])/g, "\\$1"

  util.htmlEntities = (str) ->
    String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace /"/g, "&quot;"

  
  # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  EmojiArea = ->

  EmojiArea::setup = ->
    self = this
    @$editor.on "focus", ->
      self.hasFocus = true
      return

    @$editor.on "blur", ->
      self.hasFocus = false
      return

    @setupButton()
    return

  EmojiArea::setupButton = ->
    self = this
    $button = undefined
    if @options.button
      $button = $(@options.button)
    else if @options.button isnt false
      $button = $("<a href=\"javascript:void(0)\">")
      $button.html @options.buttonLabel
      $button.addClass "emoji-button"
      $button.attr title: @options.buttonLabel
      @$editor[@options.buttonPosition] $button
    else
      $button = $("")
    $button.on "click", (e) ->
      EmojiMenu.show self
      e.stopPropagation()
      return

    @$button = $button
    return

  EmojiArea.createIcon = (emoji) ->
    filename = emoji + ".svg"
    path = $.emojiarea.path or ""
    path += "/"  if path.length and path.charAt(path.length - 1) isnt "/"
    "<img src=\"" + path + filename + "\" alt=\"" + util.htmlEntities(emoji) + "\">"

  
  # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  
  ###
  Editor (plain-text)
  
  @constructor
  @param {object} $textarea
  @param {object} options
  ###
  EmojiArea_Plain = ($textarea, options) ->
    @options = options
    @$textarea = $textarea
    @$editor = $textarea
    @setup()
    return

  EmojiArea_Plain::insert = (emoji) ->
    for category of $.emojiarea.icons
      i = 0

      while i < $.emojiarea.icons[category]
        return  unless $.emojiarea.icons[category][i].hasOwnProperty(emoji)
        i++
    emoji = ":" + emoji + ":"
    util.insertAtCursor emoji, @$textarea[0]
    @$textarea.trigger "change"
    return

  EmojiArea_Plain::val = ->
    @$textarea.val()

  util.extend EmojiArea_Plain::, EmojiArea::
  
  # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  
  ###
  Editor (rich)
  
  @constructor
  @param {object} $textarea
  @param {object} options
  ###
  EmojiArea_WYSIWYG = ($textarea, options) ->
    self = this
    @options = options
    @$textarea = $textarea
    @$editor = $("<div>").addClass("emoji-wysiwyg-editor")
    @$editor.text $textarea.val()
    @$editor.attr contenteditable: "true"
    @$editor.on "blur keyup paste", ->
      self.onChange.apply self, arguments_

    @$editor.on "mousedown focus", ->
      document.execCommand "enableObjectResizing", false, false
      return

    @$editor.on "blur", ->
      document.execCommand "enableObjectResizing", true, true
      return

    html = @$editor.text()
    emojis = $.emojiarea.icons
    for key of emojis
      html = html.replace(new RegExp(util.escapeRegex(key), "g"), EmojiArea.createIcon(key))  if emojis.hasOwnProperty(key)
    @$editor.html html
    $textarea.hide().after @$editor
    @setup()
    @$button.on "mousedown", ->
      self.selection = util.saveSelection()  if self.hasFocus
      return

    return

  EmojiArea_WYSIWYG::onChange = ->
    @$textarea.val(@val()).trigger "change"
    return

  EmojiArea_WYSIWYG::insert = (emoji) ->
    content = undefined
    $img = $(EmojiArea.createIcon(emoji))
    $img[0].alt = ":" + $img[0].alt + ":"
    if $img[0].attachEvent
      $img[0].attachEvent "onresizestart", ((e) ->
        e.returnValue = false
        return
      ), false
    @$editor.trigger "focus"
    util.restoreSelection @selection  if @selection
    try
      util.replaceSelection $img[0]
    @onChange()
    return

  EmojiArea_WYSIWYG::val = ->
    lines = []
    line = []
    flush = ->
      lines.push line.join("")
      line = []
      return

    sanitizeNode = (node) ->
      if node.nodeType is TEXT_NODE
        line.push node.nodeValue
      else if node.nodeType is ELEMENT_NODE
        tagName = node.tagName.toLowerCase()
        isBlock = TAGS_BLOCK.indexOf(tagName) isnt -1
        flush()  if isBlock and line.length
        if tagName is "img"
          alt = node.getAttribute("alt") or ""
          line.push alt  if alt
          return
        else flush()  if tagName is "br"
        children = node.childNodes
        i = 0

        while i < children.length
          sanitizeNode children[i]
          i++
        flush()  if isBlock and line.length
      return

    children = @$editor[0].childNodes
    i = 0

    while i < children.length
      sanitizeNode children[i]
      i++
    flush()  if line.length
    lines.join "\n"

  util.extend EmojiArea_WYSIWYG::, EmojiArea::
  
  # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  
  ###
  Emoji Dropdown Menu
  
  @constructor
  @param {object} emojiarea
  ###
  EmojiMenu = ->
    self = this
    $body = $(document.body)
    $window = $(window)
    @visible = false
    @emojiarea = null
    @$menu = $("<div>")
    @$menu.addClass "emoji-menu"
    @$menu.hide()
    @$items = $("<div>").appendTo(@$menu)
    $body.append @$menu
    $body.on "keydown", (e) ->
      self.hide()  if e.keyCode is KEY_ESC or e.keyCode is KEY_TAB
      return

    $body.on "mouseup", ->
      self.hide()
      return

    $window.on "resize", ->
      self.reposition()  if self.visible
      return

    @$menu.on "mouseup", "a", (e) ->
      e.stopPropagation()
      false

    @$menu.on "click", "a", (e) ->
      emoji = $(".label", $(this)).text()
      unless emoji
        return window.setTimeout(->
          self.onItemSelected.apply self, [emoji]
          return
        , 0)
      e.stopPropagation()
      false

    @load()
    return

  EmojiMenu::onItemSelected = (emoji) ->
    @emojiarea.insert emoji
    @hide()
    return

  EmojiMenu::load = ->
    setImage = (category) ->
      html = ""
      i = 0

      while i < $.emojiarea.icons[category].length
        html += "<a href=\"javascript:void(0)\" title=\"" + options[category][i].code + "\">" + EmojiArea.createIcon(options[category][i].code) + "<span class=\"label\">" + util.htmlEntities(options[category][i].code) + "</span></a>"
        i++
      html
    html = []
    options = $.emojiarea.icons
    path = $.emojiarea.path
    path += "/"  if path.length and path.charAt(path.length - 1) isnt "/"
    html.push "<ul class=\"nav nav-tabs\"><li class=\"dropdown active emoji-category\"><a class=\"dropdown-toggle emoji-toggle\" data-toggle=\"dropdown\" href=\"#category\">category<span class=\"caret\"></span></a><ul class=\"dropdown-menu emoji-category-menu\" role=\"menu\">"
    flag = true
    for category of $.emojiarea.icons
      if flag
        html.push "<li class=\"active\"><a href=\"#" + category + "\" data-toggle=\"tab\">" + category + "</a></li>"
        flag = false
      else
        html.push "<li><a href=\"#" + category + "\" data-toggle=\"tab\">" + category + "</a></li>"
    html.push "</ul></li></ul><div class=\"tab-content emoji-content\">"
    flag = true
    for category of $.emojiarea.icons
      if flag
        html.push "<div class=\"tab-pane fade active in\" id=\"" + category + "\">" + setImage(category) + "</div>"
        flag = false
      else
        html.push "<div class=\"tab-pane fade\" id=\"" + category + "\">" + setImage(category) + "</div>"
    html.push "</div>"
    @$items.html html.join("")
    return

  EmojiMenu::reposition = ->
    $button = @emojiarea.$button
    offset = $button.offset()
    offset.top += $button.outerHeight()
    offset.left += Math.round($button.outerWidth() / 2)
    @$menu.css
      top: offset.top
      left: offset.left

    return

  EmojiMenu::hide = (callback) ->
    if @emojiarea
      @emojiarea.menu = null
      @emojiarea.$button.removeClass "on"
      @emojiarea = null
    @visible = false
    @$menu.hide()
    return

  EmojiMenu::show = (emojiarea) ->
    return  if @emojiarea and @emojiarea is emojiarea
    @emojiarea = emojiarea
    @emojiarea.menu = this
    @reposition()
    @$menu.show()
    @visible = true
    return

  EmojiMenu.show = (->
    menu = null
    (emojiarea) ->
      menu = menu or new EmojiMenu()
      menu.show emojiarea
      return
  )()
  return
) jQuery, window, document