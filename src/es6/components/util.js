export default class EmojidexUtil {
  constructor(EC) {
    this.EC = EC

    this.acknowledgedUnicodePattern = this.EC.Data.mojiCodes.moji_array.join('|')

    this.anchorPatternBase = '<a href=["|\'][^\'|^"]*[\'|"] emoji-code=["|\'][^\'|^"]*[\'|"]><img class=["|\']emojidex-emoji[\'|"] src=["|\'][^\'|^"]*[\'|"] (emoji-code=["|\'][^\'|^"]*[\'|"] emoji-moji=["|\'][^\'|^"]*[\'|"]|emoji-code=["|\'][^\'|^"]*[\'|"]) alt=["|\'][^\'|^"]*[\'|"]( />|/>|>)</a>'
    this.imgPatternBase = '<img class=["|\']emojidex-emoji[\'|"] src=["|\'][^\'|^"]*[\'|"] (emoji-code=["|\'][^\'|^"]*[\'|"] emoji-moji=["|\'][^\'|^"]*[\'|"]|emoji-code=["|\'][^\'|^"]*[\'|"]) alt=["|\'][^\'|^"]*[\'|"]( />|/>|>)'

    this.anchorPattern = new RegExp(this.anchorPatternBase, 'g')
    this.imgPattern = new RegExp(this.imgPatternBase, 'g')
    this.wrappedPattern = new RegExp('<span[^>]*>' + this.anchorPatternBase + '</span>', 'g')
    this.wrappedImgPattern = new RegExp('<span[^>]*>' + this.imgPatternBase + '</span>', 'g')
    this.garbageTags = new RegExp('<span></span>', 'g')
    this.emojiCodeTagAttrPattern = new RegExp('emoji-code=["|\']([^\'|^"]*)[\'|"]', '')
    this.emojiMojiTagAttrPattern = new RegExp('emoji-moji=["|\']([^\'|^"]*)[\'|"]', '')
    this.ignoredCharacters = '\'":;@&#~{}<>\\r\\n\\[\\]\\!\\$\\+\\?\\%\\*\\/\\\\'
    this.shortCodePattern = new RegExp(`:([^\\s${this.ignoredCharacters}][^${this.ignoredCharacters}]*[^${this.ignoredCharacters}]):|:([^${this.ignoredCharacters}]):`, 'g')
    this.utfPattern = new RegExp(this.acknowledgedUnicodePattern)
    this.utfPatternGlobal = new RegExp(this.utfPattern, 'g')
  }

  // Escapes spaces to underscore
  escapeTerm(term) {
    return term ? term.replace(/\s/g, '_') : ''
    // return term.replace(/\s/g, '_')
  }

  // De-Escapes underscores to spaces
  deEscapeTerm(term) {
    return term ? term.replace(/_/g, ' ') : ''
  }

  makeURLSafe(term) {
    return term ? this.escapeTerm(term).replace(/\(/g, '%28').replace(/\)/g, '%29') : ''
  }

  // Adds colons around a code
  encapsulateCode(code) {
    return `:${this.unEncapsulateCode(code)}:`
  }

  // Removes colons around a code
  unEncapsulateCode(code) {
    return code ? code.replace(/:/g, '') : ''
  }

  // Breakout into an array
  breakout(items) {
    if (items) {
      if (Array.isArray(items)) {
        return items
      }

      return [items]
    }

    return []
  }

  // Converts an emoji array to [{code: "moji_code", imgUrl: "https://cdn...moji_code.png}] format
  simplify(emoji, sizeCode = this.EC.sizeCode) {
    for (let i = 0; i < emoji.length; i++) {
      emoji[i].code = this.escapeTerm(emoji[i].code)
      emoji[i].imgUrl = `${this.EC.cdnUrl}/${sizeCode}/${this.escapeTerm(emoji[i].code)}.png`
    }

    return emoji
  }

  // Convert emoji characters[moji] and short codes in a text block to whatever
  // format is retrurned by the method passed as the processor parameter.
  // An emoji object is passed to the processor and formatted text should be returned.
  // Default processor converts to HTML tags.
  emojify(source, processor = this.emojiToHTML) {
    return this.emojifyMoji(source, processor).then(processed => {
      return this.emojifyCodes(processed, processor)
    }).then(processed => {
      return processed
    }).catch(error => {
      console.error(error)
    })
  }

  splitTextWithAcknowledgedEmoji(sourceText) {
    let splittedSources = sourceText.match(new RegExp(`[${this.acknowledgedUnicodePattern}]+|[^${this.acknowledgedUnicodePattern}]+`, 'gu'))
    splittedSources = splittedSources.map(source => {
      if (/\u200D/.test(source)) {
        const sources = source.match(new RegExp(`${this.acknowledgedUnicodePattern}|\u200D`, 'gu'))
        const emojis = []
        let zwjEmojis = []
        for (let i = 0; i < sources.length; i++) {
          if (sources[i] !== '\u{200D}' && sources[i + 1] !== '\u{200D}' || sources[i + 1] === undefined) {
            zwjEmojis.push(sources[i])
            emojis.push(zwjEmojis.join(''))
            zwjEmojis = []
          } else {
            zwjEmojis.push(sources[i])
          }
        }

        return emojis
      }

      if (new RegExp(`${this.acknowledgedUnicodePattern}`, 'gu').test(source)) {
        return source.match(new RegExp(`${this.acknowledgedUnicodePattern}`, 'gu'))
      }

      return source
    })
    return [].concat(...splittedSources)
  }

  // Convert UTF emoji using the specified processor
  emojifyMoji(source, processor = this.emojiToHTML) {
    processor = processor.bind(this)

    const getMojicodes = mojis => {
      return mojis.map(moji => {
        return this.EC.Data.mojiCodes.moji_index[moji]
      })
    }

    const getJwzReplacingPromises = (checkComponents, matchedMojiCodes, processor, combination = null) => {
      const promises = []
      for (let i = 0; i < checkComponents.length; i++) {
        if (checkComponents[i] || checkComponents.includes(false)) {
          promises.push(new Promise((resolve, reject) => {
            this.EC.Search.find(matchedMojiCodes.shift()).then(result => {
              if (Object.prototype.hasOwnProperty.call(result, 'code')) {
                if (processor === this.getZwjEmojiTag) {
                  resolve(processor.call(this, result, combination.base, i))
                } else {
                  resolve(processor.call(this, result))
                }
              }
            }).catch(error => {
              reject(error)
            })
          }))
        }
      }

      return promises
    }

    return new Promise((resolveEmojify, rejectEmojify) => {
      const splittedSources = this.splitTextWithAcknowledgedEmoji(source)
      const replacingSources = splittedSources.map(target => {
        return new Promise((resolveReplace, rejectReplace) => {
          if (/\u200D/.test(target)) {
            // for used ZWJ emoji
            const matchedMojis = target.match(this.utfPatternGlobal)
            const matchedMojiCodes = getMojicodes(matchedMojis)

            this.EC.Search.find(this.EC.Data.mojiCodes.moji_index[matchedMojis[0]]).then(result => {
              if (result.combinations.length) {
                result.combinations.forEach(combination => {
                  // check for registered ZWJ emoji on emojidex.com
                  let checkComponents = combination.components
                  const sortedMatchedMojiCodes = []
                  checkComponents = checkComponents.map((component, i) => {
                    if (matchedMojiCodes.length) {
                      for (let j = 0; j < matchedMojiCodes.length; j++) {
                        if (component.includes(matchedMojiCodes[j])) {
                          sortedMatchedMojiCodes.push({ emojiCode: matchedMojiCodes[j], layerNum: combination.component_layer_order[i] })
                          matchedMojiCodes[j] = false
                          return true
                        }

                        if (j === matchedMojiCodes.length - 1) {
                          return component[component.length - 1] === '' ? null : false
                        }
                      }
                    }

                    return null
                  })

                  let zwjReplacingPromises = null
                  const emojiCodes = sortedMatchedMojiCodes.sort((a, b) => {
                    return a.layerNum < b.layerNum ? -1 : 1
                  }).map(o => {
                    return o.emojiCode
                  })
                  if (checkComponents.includes(false)) {
                    // for incorrect ZWJ emoji
                    zwjReplacingPromises = getJwzReplacingPromises(checkComponents, emojiCodes, processor)
                  } else {
                    // for correct ZWJ emoji
                    zwjReplacingPromises = getJwzReplacingPromises(checkComponents, emojiCodes, this.getZwjEmojiTag, combination)
                  }

                  Promise.all(zwjReplacingPromises).then(zwjReplacedStrings => {
                    if (checkComponents.includes(false)) {
                      resolveReplace(zwjReplacedStrings.join(''))
                    } else {
                      this.EC.Search.find(combination.base).then(baseEmoji => {
                        resolveReplace(this.getZwjEmojiSpanTag(baseEmoji, zwjReplacedStrings.join('')))
                      })
                    }
                  })
                })
              } else {
                const replaceingUtfEmojiPromises = []
                matchedMojiCodes.forEach(code => {
                  replaceingUtfEmojiPromises.push(new Promise(resolve => {
                    this.EC.Search.find(code).then(result => {
                      if (Object.prototype.hasOwnProperty.call(result, 'code')) {
                        resolve(processor(result))
                      }
                    })
                  }))
                })
                Promise.all(replaceingUtfEmojiPromises).then(replacedUtfEmoji => {
                  resolveReplace(replacedUtfEmoji.join(''))
                })
              }
            }).catch(error => {
              rejectReplace(error)
            })
          } else if (this.utfPattern.test(target)) {
            this.EC.Search.find(this.EC.Data.mojiCodes.moji_index[target]).then(result => {
              if (Object.prototype.hasOwnProperty.call(result, 'code')) {
                resolveReplace(processor(result))
              }
            }).catch(() => {
              resolveReplace(target)
            })
          } else {
            resolveReplace(target)
          }
        })
      })
      Promise.all(replacingSources).then(replacedSources => {
        resolveEmojify(replacedSources.join(''))
      }).catch(error => {
        rejectEmojify(error)
      })
    })
  }

  // Convert emoji short codes using the specified processor
  emojifyCodes(source, processor = this.emojiToHTML) {
    processor = processor.bind(this)

    return new Promise((resolve, reject) => {
      const targets = source.match(this.shortCodePattern)
      if (targets === null || targets.length === 0) {
        resolve(source)
      }

      let count = targets.length
      const replacements = []

      for (const target of targets) {
        const snip = `${target}`
        this.EC.Search.find(this.unEncapsulateCode(snip)).then(result => {
          if (Object.prototype.hasOwnProperty.call(result, 'code')) {
            replacements.push({ pre: snip, post: processor(result) })
          }

          return source
        }).then(() => {
          count -= 1
        }).catch(() => {
          count -= 1
        }).then(() => {
          if (count === 0) {
            for (const replacement of replacements) {
              source = source.replace(replacement.pre, replacement.post)
            }

            resolve(source)
          }
        }).catch(error => {
          reject(error)
        })
      }
    })
  }

  // Shortcut to emojify with emojiToHTML as the processor
  emojifyToHTML(source) {
    return this.emojify(source, this.emojiToHTML)
  }

  // Shortcut to emojify with emojiToMD as the processor
  emojifyToMD(source) {
    return this.emojify(source, this.emojiToMD)
  }

  // Returns an HTML image/link tag for an emoji from an emoji object
  emojiToHTML(emoji, sizeCode = this.EC.defaults.sizeCode) {
    const img = `<img class="emojidex-emoji" src="https://${this.EC.env.cdnAddr}/emoji/${sizeCode}/${this.escapeTerm(emoji.code)}.png" emoji-code="${this.escapeTerm(emoji.code)}"${(emoji.moji === null || emoji.moji === '') ? '' : ' emoji-moji="' + emoji.moji + '"'} alt="${this.deEscapeTerm(emoji.code)}" />`
    if (emoji.link && emoji.link !== '') {
      return `<a href="${emoji.link}" emoji-code="${this.escapeTerm(emoji.code)}">${img}</a>`
    }

    return img
  }

  // Returns an HTML image tag for an emoji from a ZWJ emoji object
  getZwjEmojiTag(emoji, combinationBaseName, componentNumber, sizeCode = this.EC.defaults.sizeCode) {
    return `<img class="emojidex-emoji" src="https://${this.EC.env.cdnAddr}/emoji/${sizeCode}/${combinationBaseName}/${componentNumber}/${this.escapeTerm(emoji.code)}.png" emoji-code="${this.escapeTerm(emoji.code)}"${(emoji.moji === null || emoji.moji === '') ? '' : ' emoji-moji="' + emoji.moji + '"'} alt="${this.deEscapeTerm(emoji.code)}" />`
  }

  // Returns an HTML ZWJ emoji objects wrapped with span and base emoji link tag.
  getZwjEmojiSpanTag(baseEmoji, zwjReplacedStrings) {
    if (baseEmoji.link && baseEmoji.link !== '') {
      return `<span class="zwj-emoji"><a href="${baseEmoji.link}" emoji-code="${this.escapeTerm(baseEmoji.code)}">${zwjReplacedStrings}</a></span>`
    }

    return `<span class="zwj-emoji">${zwjReplacedStrings}</span>`
  }

  // Returns a MarkDown image/link tag for an emoji from an emoji object
  emojiToMD(emoji, sizeCode = this.EC.defaults.sizeCode) {
    const img = `![${(emoji.moji === null || emoji.moji === '') ? emoji.code : emoji.moji}](https://${this.EC.env.cdnAddr}/emoji/${sizeCode}/${this.escapeTerm(emoji.code)}.png "${this.deEscapeTerm(emoji.code)}")`
    if (emoji.link && emoji.link !== '') {
      return `[${img} ](${emoji.link})`
    }

    return img
  }

  // Change emoji HTML tags into emoji codes and returns a string
  // *This method takes a string and returns a string, such as the contents of
  // a text box/content editable element, NOT a DOM object.
  deEmojifyHTML(source, mojify = true) {
    source = this._deEmojifyWrappedHTML(`${source}`, mojify)
    source = this.deLinkHTML(source)
    const targets = source.match(this.imgPattern)
    if (targets === null) {
      return source
    }

    for (const target of targets) {
      if (mojify) {
        const mojiCode = target.match(this.emojiMojiTagAttrPattern)
        if (mojiCode && mojiCode.length !== 1) {
          source = source.replace(target, mojiCode[1])
          continue
        }
      }

      const emojiCode = target.match(this.emojiCodeTagAttrPattern)
      source = source.replace(target, this.encapsulateCode(emojiCode[1]))
    }

    return this._scrubGarbageTags(source)
  }

  _deEmojifyWrappedHTML(source, mojify = true) {
    source = this.deLinkHTML(source)
    const targets = source.match(this.wrappedImgPattern)
    if (targets === null) {
      return source
    }

    for (const target of targets) {
      if (mojify) {
        const mojiCode = target.match(this.emojiMojiTagAttrPattern)
        if (mojiCode && mojiCode.length !== 1) {
          source = source.replace(target, mojiCode[1])
          continue
        }
      }

      const emojiCode = target.match(this.emojiCodeTagAttrPattern)
      source = source.replace(target, this.encapsulateCode(emojiCode[1]))
    }

    return source
  }

  // Scrubs junk left by at.js
  _scrubGarbageTags(source) {
    const targets = source.match(this.garbageTags)
    if (targets === null) {
      return source
    }

    for (let i = 0; i < targets.length; i++) {
      source = source.replace(targets[i], '')
    }

    return source
  }

  // Remove links from wrapped emoji images in HTML
  // *Only do this if you need to remove links for functionality.
  deLinkHTML(source) {
    source = this._deLinkWrappedHTML(`${source}`)
    const targets = source.match(this.anchorPattern)
    if (targets === null) {
      return source
    }

    for (let i = 0; i < targets.length; i++) {
      source = source.replace(targets[i], targets[i].match(this.imgPattern)[0])
    }

    return source
  }

  _deLinkWrappedHTML(source) {
    const targets = source.match(this.wrappedPattern)
    if (targets === null) {
      return source
    }

    for (let i = 0; i < targets.length; i++) {
      source = source.replace(targets[i], targets[i].match(this.imgPattern)[0])
    }

    return source
  }

  // Get's the 'this' context for this Util instance
  // Generally should not be necessary, but with JS you never know...
  getContext() {
    return this
  }
}
