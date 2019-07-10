// emojidex client
// * Provides search, index caching and combining and asset URI resolution
//
// =LICENSE=
// Licensed under the emojidex Open License
// https://www.emojidex.com/emojidex/emojidex_open_license
//
// Copyright 2013 the emojidex project / K.K. GenSouSha

import EmojidexCategories from './components/categories'
import EmojidexCustomizations from './components/customizations'
import EmojidexData from './components/data'
import EmojidexEmoji from './components/emoji'
import EmojidexIndexes from './components/indexes'
import EmojidexSearch from './components/search'
import EmojidexUser from './components/user'
import EmojidexUtil from './components/util'
import _extend from 'lodash/extend'

export default class EmojidexClient {
  constructor(options) {
    this.env = {
      apiVer: 1,
      cdnAddr: 'cdn.emojidex.com',
      sCdnAddr: 'cdn.emojidex.com',
      assetAddr: 'assets.emojidex.com',
      sAssetAddr: ''
    }

    // sets global default value
    this.defaults = {
      locale: 'en',
      apiUrl: 'https://www.emojidex.com/api/v1/',
      cdnUrl: 'https://cdn.emojidex.com/emoji/',
      closedNet: false,
      minQueryLen: 4,
      sizeCode: 'xhdpi',
      detailed: false,
      limit: 32,
      onReady: () => ({})
    }

    this.options = _extend({}, this.defaults, options)

    // set closed network flag (for OSS distrobutions, intranet/private neworks, or closed license)
    // DO NOT set to true unless permitted by an emojidex License
    this.closedNet = this.options.closedNet

    // set end points
    this.apiUrl = this.options.apiUrl
    this.cdnUrl = this.options.cdnUrl
    this.sizeCode = this.options.sizeCode

    // common @options
    this.detailed = this.options.detailed
    this.limit = this.options.limit
    this.locale = this.options.locale

    // new Emojidex modules
    this.Data = new EmojidexData(this, this.options).then(() => {
      this.Customizations = new EmojidexCustomizations(this)
      this.Util = new EmojidexUtil(this)
      this.User = new EmojidexUser(this)
      this.Indexes = new EmojidexIndexes(this)
      this.Search = new EmojidexSearch(this)
      this.Emoji = new EmojidexEmoji(this)
      this.Categories = new EmojidexCategories(this)
      return this.Categories
    }).then(() => {
      this.options.onReady(this)
    }).catch(error => {
      console.error(error)
    })
  }
}
