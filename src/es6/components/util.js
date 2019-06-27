export default class EmojidexUtil {
  constructor(EC) {
    // ↓ this process for processor of replace
    self = this

    self.EC = EC

    self.acknowledgedUnicodePattern = self.EC.Data.mojiCodes.moji_array.join('|')

    self.anchorPatternBase = '<a href=["|\'][^\'|^"]*[\'|"] emoji-code=["|\'][^\'|^"]*[\'|"]><img class=["|\']emojidex-emoji[\'|"] src=["|\'][^\'|^"]*[\'|"] (emoji-code=["|\'][^\'|^"]*[\'|"] emoji-moji=["|\'][^\'|^"]*[\'|"]|emoji-code=["|\'][^\'|^"]*[\'|"]) alt=["|\'][^\'|^"]*[\'|"]( />|/>|>)</a>'
    self.imgPatternBase = '<img class=["|\']emojidex-emoji[\'|"] src=["|\'][^\'|^"]*[\'|"] (emoji-code=["|\'][^\'|^"]*[\'|"] emoji-moji=["|\'][^\'|^"]*[\'|"]|emoji-code=["|\'][^\'|^"]*[\'|"]) alt=["|\'][^\'|^"]*[\'|"]( />|/>|>)'

    self.anchorPattern = new RegExp(self.anchorPatternBase, 'g')
    self.imgPattern = new RegExp(self.imgPatternBase, 'g')
    self.wrappedPattern = new RegExp('<span[^>]*>' + self.anchorPatternBase + '</span>', 'g')
    self.wrappedImgPattern = new RegExp('<span[^>]*>' + self.imgPatternBase + '</span>', 'g')
    self.garbageTags = new RegExp('<span></span>', 'g')
    self.emojiCodeTagAttrPattern = new RegExp('emoji-code=["|\']([^\'|^"]*)[\'|"]', '')
    self.emojiMojiTagAttrPattern = new RegExp('emoji-moji=["|\']([^\'|^"]*)[\'|"]', '')
    self.ignoredCharacters = '\'":;@&#~{}<>\\r\\n\\[\\]\\!\\$\\+\\?\\%\\*\\/\\\\'
    self.shortCodePattern = new RegExp(`:([^\\s${self.ignoredCharacters}][^${self.ignoredCharacters}]*[^${self.ignoredCharacters}]):|:([^${self.ignoredCharacters}]):`, 'g')
    self.utfPattern = new RegExp(self.acknowledgedUnicodePattern)
    self.utfPatternGlobal = new RegExp(self.utfPattern, 'g')
  }

  // Escapes spaces to underscore
  escapeTerm(term) {
    return term.replace(/\s/g, '_')
  }

  // De-Escapes underscores to spaces
  deEscapeTerm(term) {
    return term.replace(/_/g, ' ')
  }

  makeURLSafe(term) {
    return self.escapeTerm(term).replace(/\(/g, '%28').replace(/\)/g, '%29')
  }

  // Adds colons around a code
  encapsulateCode(code) {
    return `:${self.unEncapsulateCode(code)}:`
  }

  // Removes colons around a code
  unEncapsulateCode(code) {
    return code.replace(/:/g, '')
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
  simplify(emoji = self.results, sizeCode = self.EC.sizeCode) {
    for (let i = 0; i < emoji.length; i++) {
      emoji[i].code = self.escapeTerm(emoji[i].code)
      emoji[i].imgUrl = `${self.EC.cdnUrl}/${sizeCode}/${self.escapeTerm(emoji[i].code)}.png`
    }

    return emoji
  }

  // Convert emoji characters[moji] and short codes in a text block to whatever
  // format is retrurned by the method passed as the processor parameter.
  // An emoji object is passed to the processor and formatted text should be returned.
  // Default processor converts to HTML tags.
  emojify(source, processor = self.emojiToHTML) {
    return self.emojifyMoji(source, processor).then(processed => {
      return self.emojifyCodes(processed, processor)
    }).then(processed => {
      return processed
    }).catch(error => {
      console.error(error)
    })
  }

  splitTextWithAcknowledgedEmoji(sourceText) {
    let splittedSources = sourceText.match(new RegExp(`[${self.acknowledgedUnicodePattern}]+|[^${self.acknowledgedUnicodePattern}]+`, 'gu'))
    splittedSources = splittedSources.map(source => {
      if (/\u200D/.test(source)) {
        const sources = source.match(new RegExp(`${self.acknowledgedUnicodePattern}|\u200D`, 'gu'))
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

      if (new RegExp(`${self.acknowledgedUnicodePattern}`, 'gu').test(source)) {
        return source.match(new RegExp(`${self.acknowledgedUnicodePattern}`, 'gu'))
      }

      return source
    })
    return [].concat(...splittedSources)
  }

  // Convert UTF emoji using the specified processor
  emojifyMoji(source, processor = self.emojiToHTML) {
    const getMojicodes = mojis => {
      return mojis.map(moji => {
        return self.EC.Data.mojiCodes.moji_index[moji]
      })
    }

    const getJwzReplacingPromises = (checkComponents, matchedMojiCodes, processor, combination = null) => {
      const promises = []
      for (let i = 0; i < checkComponents.length; i++) {
        if (checkComponents[i] || checkComponents.includes(false)) {
          promises.push(new Promise((resolve, reject) => {
            self.EC.Search.find(matchedMojiCodes.shift()).then(result => {
              if (Object.prototype.hasOwnProperty.call(result, 'code')) {
                if (processor === self.getZwjEmojiTag) {
                  resolve(processor(result, combination.base, i))
                } else {
                  resolve(processor(result))
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
      const splittedSources = self.splitTextWithAcknowledgedEmoji(source)
      const replacingSources = splittedSources.map(target => {
        return new Promise((resolveReplace, rejectReplace) => {
          if (/\u200D/.test(target)) {
            // for used ZWJ emoji
            const matchedMojis = target.match(self.utfPatternGlobal)
            const matchedMojiCodes = getMojicodes(matchedMojis)

            self.EC.Search.find(self.EC.Data.mojiCodes.moji_index[matchedMojis[0]]).then(result => {
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
                    zwjReplacingPromises = getJwzReplacingPromises(checkComponents, emojiCodes, self.getZwjEmojiTag, combination)
                  }

                  Promise.all(zwjReplacingPromises).then(zwjReplacedStrings => {
                    if (checkComponents.includes(false)) {
                      resolveReplace(zwjReplacedStrings.join(''))
                    } else {
                      self.EC.Search.find(combination.base).then(baseEmoji => {
                        resolveReplace(self.getZwjEmojiSpanTag(baseEmoji, zwjReplacedStrings.join('')))
                      })
                    }
                  })
                })
              } else {
                const replaceingUtfEmojiPromises = []
                matchedMojiCodes.forEach(code => {
                  replaceingUtfEmojiPromises.push(new Promise(resolve => {
                    self.EC.Search.find(code).then(result => {
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
          } else if (self.utfPattern.test(target)) {
            self.EC.Search.find(self.EC.Data.mojiCodes.moji_index[target]).then(result => {
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
  emojifyCodes(source, processor = self.emojiToHTML) {
    return new Promise((resolve, reject) => {
      const targets = source.match(self.shortCodePattern)
      if (targets === null || targets.length === 0) {
        resolve(source)
      }

      let count = targets.length
      const replacements = []

      for (const target of targets) {
        const snip = `${target}`
        self.EC.Search.find(self.EC.Util.unEncapsulateCode(snip)).then(result => {
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
    return self.emojify(source, self.emojiToHTML)
  }

  // Shortcut to emojify with emojiToMD as the processor
  emojifyToMD(source) {
    return self.emojify(source, self.emojiToMD)
  }

  // Returns an HTML image/link tag for an emoji from an emoji object
  emojiToHTML(emoji, sizeCode = self.EC.defaults.sizeCode) {
    const img = `<img class="emojidex-emoji" src="https://${self.EC.env.cdnAddr}/emoji/${sizeCode}/${self.escapeTerm(emoji.code)}.png" emoji-code="${self.escapeTerm(emoji.code)}"${(emoji.moji === null || emoji.moji === '') ? '' : ' emoji-moji="' + emoji.moji + '"'} alt="${self.deEscapeTerm(emoji.code)}" />`
    if (emoji.link && emoji.link !== '') {
      return `<a href="${emoji.link}" emoji-code="${self.escapeTerm(emoji.code)}">${img}</a>`
    }

    return img
  }

  // Returns an HTML image tag for an emoji from a ZWJ emoji object
  getZwjEmojiTag(emoji, combinationBaseName, componentNumber, sizeCode = self.EC.defaults.sizeCode) {
    return `<img class="emojidex-emoji" src="https://${self.EC.env.cdnAddr}/emoji/${sizeCode}/${combinationBaseName}/${componentNumber}/${self.escapeTerm(emoji.code)}.png" emoji-code="${self.escapeTerm(emoji.code)}"${(emoji.moji === null || emoji.moji === '') ? '' : ' emoji-moji="' + emoji.moji + '"'} alt="${self.deEscapeTerm(emoji.code)}" />`
  }

  // Returns an HTML ZWJ emoji objects wrapped with span and base emoji link tag.
  getZwjEmojiSpanTag(baseEmoji, zwjReplacedStrings) {
    if (baseEmoji.link && baseEmoji.link !== '') {
      return `<span class="zwj-emoji"><a href="${baseEmoji.link}" emoji-code="${self.escapeTerm(baseEmoji.code)}">${zwjReplacedStrings}</a></span>`
    }

    return `<span class="zwj-emoji">${zwjReplacedStrings}</span>`
  }

  // Returns a MarkDown image/link tag for an emoji from an emoji object
  emojiToMD(emoji, sizeCode = self.EC.defaults.sizeCode) {
    const img = `![${(emoji.moji === null || emoji.moji === '') ? emoji.code : emoji.moji}](https://${self.EC.env.cdnAddr}/emoji/${sizeCode}/${self.escapeTerm(emoji.code)}.png "${self.deEscapeTerm(emoji.code)}")`
    if (emoji.link && emoji.link !== '') {
      return `[${img} ](${emoji.link})`
    }

    return img
  }

  // Change emoji HTML tags into emoji codes and returns a string
  // *This method takes a string and returns a string, such as the contents of
  // a text box/content editable element, NOT a DOM object.
  deEmojifyHTML(source, mojify = true) {
    source = self._deEmojifyWrappedHTML(`${source}`, mojify)
    source = self.deLinkHTML(source)
    const targets = source.match(self.imgPattern)
    if (targets === null) {
      return source
    }

    for (const target of targets) {
      if (mojify) {
        const mojiCode = target.match(self.emojiMojiTagAttrPattern)
        if (mojiCode && mojiCode.length !== 1) {
          source = source.replace(target, mojiCode[1])
          continue
        }
      }

      const emojiCode = target.match(self.emojiCodeTagAttrPattern)
      source = source.replace(target, self.encapsulateCode(emojiCode[1]))
    }

    return self._scrubGarbageTags(source)
  }

  _deEmojifyWrappedHTML(source, mojify = true) {
    source = self.deLinkHTML(source)
    const targets = source.match(self.wrappedImgPattern)
    if (targets === null) {
      return source
    }

    for (const target of targets) {
      if (mojify) {
        const mojiCode = target.match(self.emojiMojiTagAttrPattern)
        if (mojiCode && mojiCode.length !== 1) {
          source = source.replace(target, mojiCode[1])
          continue
        }
      }

      const emojiCode = target.match(self.emojiCodeTagAttrPattern)
      source = source.replace(target, self.encapsulateCode(emojiCode[1]))
    }

    return source
  }

  // Scrubs junk left by at.js
  _scrubGarbageTags(source) {
    const targets = source.match(self.garbageTags)
    if (targets === null) {
      return source
    }

    for (let i = 0; i < targets.length; i++) {
      source = source.replace(targets[i], '')
    }

    return source
  }

  // Remove links from wrapped emoji images in HTML
  // *Only do self if you need to remove links for functionality.
  deLinkHTML(source) {
    source = self._deLinkWrappedHTML(`${source}`)
    const targets = source.match(self.anchorPattern)
    if (targets === null) {
      return source
    }

    for (let i = 0; i < targets.length; i++) {
      source = source.replace(targets[i], targets[i].match(self.imgPattern)[0])
    }

    return source
  }

  _deLinkWrappedHTML(source) {
    const targets = source.match(self.wrappedPattern)
    if (targets === null) {
      return source
    }

    for (let i = 0; i < targets.length; i++) {
      source = source.replace(targets[i], targets[i].match(self.imgPattern)[0])
    }

    return source
  }

  // Get's the 'this' context for this Util instance
  // Generally should not be necessary, but with JS you never know...
  getContext() {
    return self
  }
}
