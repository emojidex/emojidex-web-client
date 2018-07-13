export default class EmojidexUtil {
  constructor(EC) {
    // ↓ this process for processor of replace
    self = this;

    self.EC = EC;

    self.acknowledgedUnicodePattern = self.EC.Data.moji_codes.moji_array.join('|');

    self.a_pattern_base = `<a href=["|'][^'|^"]*['|"] emoji-code=["|'][^'|^"]*['|"]><img class=["|']emojidex-emoji['|"] src=["|'][^'|^"]*['|"] (emoji-code=["|'][^'|^"]*['|"] emoji-moji=["|'][^'|^"]*['|"]|emoji-code=["|'][^'|^"]*['|"]) alt=["|'][^'|^"]*['|"]( \/>|\/>|>)<\/a>`;
    self.img_pattern_base = `<img class=["|']emojidex-emoji['|"] src=["|'][^'|^"]*['|"] (emoji-code=["|'][^'|^"]*['|"] emoji-moji=["|'][^'|^"]*['|"]|emoji-code=["|'][^'|^"]*['|"]) alt=["|'][^'|^"]*['|"]( \/>|\/>|>)`;

    self.a_pattern = RegExp(self.a_pattern_base, 'g');
    self.img_pattern = RegExp(self.img_pattern_base, 'g');
    self.wrapped_a_pattern = RegExp(`<span[^>]*>` + self.a_pattern_base + `</span>`, 'g');
    self.wrapped_img_pattern = RegExp(`<span[^>]*>` + self.img_pattern_base + `</span>`, 'g');
    self.garbage_tags = RegExp(`<span></span>`, 'g');
    self.emoji_code_tag_attr_pattern = RegExp(`emoji-code=["|']([^'|^"]*)['|"]`, '');
    self.emoji_moji_tag_attr_pattern = RegExp(`emoji-moji=["|']([^'|^"]*)['|"]`, '');
    self.ignored_characters = '\'":;@&#~{}<>\\r\\n\\[\\]\\!\\$\\+\\?\\%\\*\\/\\\\';
    self.short_code_pattern = RegExp(`:([^\\s${self.ignored_characters}][^${self.ignored_characters}]*[^${self.ignored_characters}]):|:([^${self.ignored_characters}]):`, 'g');
    self.utf_pattern = RegExp(self.acknowledgedUnicodePattern);
    self.utf_pattern_global = RegExp(self.utf_pattern, 'g');
  }

  // Escapes spaces to underscore
  escapeTerm(term) {
    return term.replace(/\s/g, '_');
  }

  // De-Escapes underscores to spaces
  deEscapeTerm(term) {
    return term.replace(/_/g, ' ');
  }

  makeURLSafe(term) {
    return self.escapeTerm(term).replace(/\(/g, '%28').replace(/\)/g, '%29');
  }

  // Adds colons around a code
  encapsulateCode(code) {
    return `:${self.unEncapsulateCode(code)}:`;
  }

  // Removes colons around a code
  unEncapsulateCode(code) {
    return code.replace(/\:/g, '');
  }

  // Breakout into an array
  breakout(items) {
    if (items != null) {
      if (items instanceof Array) {
        return items;
      } else {
        return [items];
      }
    } else {
      return [];
    }
  }

  // Converts an emoji array to [{code: "moji_code", img_url: "https://cdn...moji_code.png}] format
  simplify(emoji = self.results, size_code = self.EC.size_code) {
    for (let i = 0; i < emoji.length; i++) {
      emoji[i].code = self.escapeTerm(emoji[i].code);
      emoji[i].img_url = `${self.EC.cdn_url}/${size_code}/${self.escapeTerm(emoji[i].code)}.png`;
    }

    return emoji;
  }

  // Convert emoji characters[moji] and short codes in a text block to whatever
  // format is retrurned by the method passed as the processor parameter.
  // An emoji object is passed to the processor and formatted text should be returned.
  // Default processor converts to HTML tags.
  emojify(source, processor = self.emojiToHTML) {
    return self.emojifyMoji(source, processor).then((processed) => {
      return self.emojifyCodes(processed, processor);
    }).then((processed) => {
      return processed;
    });
  }

  splitTextWithAcknowledgedEmoji(sourceText) {
    let splittedSources = sourceText.match(RegExp(`[${self.acknowledgedUnicodePattern}]+|[^${self.acknowledgedUnicodePattern}]+`, 'gu'));
    splittedSources = splittedSources.map((source) => {
      if(/\u200d/.test(source)) {
        let sources = source.match(RegExp(`${self.acknowledgedUnicodePattern}|\u200d`, 'gu'));
        let emojis = [];
        let zwjEmojis = [];
        for (let i = 0; i < sources.length; i++) {
          if (sources[i] !== '\u{200d}' && sources[i + 1] !== '\u{200d}' || sources[i + 1] === undefined) {
            zwjEmojis.push(sources[i]);
            emojis.push(zwjEmojis.join(''));
            zwjEmojis = [];
          } else {
            zwjEmojis.push(sources[i]);
          }
        }
        return emojis;
      } else if(RegExp(`${self.acknowledgedUnicodePattern}`, 'gu').test(source)) {
        return source.match(RegExp(`${self.acknowledgedUnicodePattern}`, 'gu'));
      } else {
        return source;
      }
    });
    return [].concat.apply([], splittedSources);
  }

  // Convert UTF emoji using the specified processor
  emojifyMoji(source, processor = self.emojiToHTML) {
    let getMojicodes = (mojis) => {
      return mojis.map((moji) => {
        return self.EC.Data.moji_codes.moji_index[moji];
      })
    }
    let getJwzReplacingPromises = (checkComponents, matchedMojiCodes, processor, combination = null) => {
      let promises = [];
      for(let i = 0; i < checkComponents.length; i++) {
        if(checkComponents[i] || checkComponents.includes(false)) {
          promises.push(new Promise((resolve, reject) => {
            self.EC.Search.find(matchedMojiCodes.shift()).then((result) => {
              if (result.hasOwnProperty('code')) {
                processor === self.getZwjEmojiTag
                  ? resolve(processor(result, combination.base, i, combination.component_layer_order[i]))
                  : resolve(processor(result));
              }
            })
          }))
        }
      }
      return promises
    }

    return new Promise((resolveEmojify, rejectEmojify) => {
      let splittedSources = self.splitTextWithAcknowledgedEmoji(source);
      let replacingSources = splittedSources.map((target) => {
        return new Promise((resolveReplace, rejectReplace) => {
          if(/\u200d/.test(target)) {
            // for used ZWJ emoji
            let matchedMojis = target.match(self.utf_pattern_global);
            let matchedMojiCodes = getMojicodes(matchedMojis)

            self.EC.Search.find(self.EC.Data.moji_codes.moji_index[matchedMojis[0]]).then((result) => {
              if(result.combinations.length) {
                result.combinations.forEach((combination) => {
                  // check for registered ZWJ emoji on emojidex.com
                  let checkComponents = combination.components;
                  let sortedMatchedMojiCodes = [];
                  checkComponents = checkComponents.map((component, i) => {
                    if(matchedMojiCodes.length) {
                      for(let i = 0; i < matchedMojiCodes.length; i++) {
                        if(component.includes(matchedMojiCodes[i])) {
                          sortedMatchedMojiCodes.push(matchedMojiCodes[i]);
                          matchedMojiCodes[i] = false
                          return true
                        } else if(i == matchedMojiCodes.length - 1) {
                          return component[component.length - 1] == '' ? null : false
                        }
                      }
                    }
                  })

                  let zwjReplacingPromises = null;
                  if(checkComponents.includes(false)) {
                    // for incorrect ZWJ emoji
                    zwjReplacingPromises = getJwzReplacingPromises(checkComponents, sortedMatchedMojiCodes, processor);
                  } else {
                    // for correct ZWJ emoji
                    zwjReplacingPromises = getJwzReplacingPromises(checkComponents, sortedMatchedMojiCodes, self.getZwjEmojiTag, combination);
                  }
                  Promise.all(zwjReplacingPromises).then((zwjReplacedStrings) => {
                    if(checkComponents.includes(false)) {
                      resolveReplace(zwjReplacedStrings.join(''));
                    } else {
                      self.EC.Search.find(combination.base).then((baseEmoji) => {
                        resolveReplace(self.getZwjEmojiSpanTag(baseEmoji, zwjReplacedStrings.join('')));
                      });
                    }
                  })
                })
              } else {
                let replaceingUtfEmojiPromises = [];
                matchedMojiCodes.forEach((code) => {
                  replaceingUtfEmojiPromises.push(new Promise((resolve, reject) => {
                    self.EC.Search.find(code).then((result) => {
                      if (result.hasOwnProperty('code')) {
                        resolve(processor(result));
                      }
                    })
                  }))
                })
                Promise.all(replaceingUtfEmojiPromises).then((replacedUtfEmoji) => {
                  resolveReplace(replacedUtfEmoji.join(''));
                })
              }
            })
          } else if(self.utf_pattern.test(target)) {
            self.EC.Search.find(self.EC.Data.moji_codes.moji_index[target]).then((result) => {
              if (result.hasOwnProperty('code')) {
                resolveReplace(processor(result));
              }
            }).catch(() => {
              resolveReplace(target);
            })
          } else {
            resolveReplace(target);
          }
        })
      })
      Promise.all(replacingSources).then((replacedSources) => {
        resolveEmojify(replacedSources.join(''));
      })
    });
  }

  // Convert emoji short codes using the specified processor
  emojifyCodes(source, processor = self.emojiToHTML) {
    return new Promise((resolve, reject) => {
      let targets = source.match(self.short_code_pattern);
      if (targets == null || targets.length == 0) { resolve(source); }

      let count = targets.length;
      let replacements = [];

      for (let target of targets) {
        let snip = `${target}`;
        self.EC.Search.find(self.EC.Util.unEncapsulateCode(snip)).then((result) => {
          if (result.hasOwnProperty('code')) {
            replacements.push({pre: snip, post: processor(result)});
          }
          return source;
        }).then((source) => {
          count -= 1;
        }).catch((response) => {
          count -= 1;
        }).then(() => {
          if(count == 0) {
            for (let replacement of replacements) {
              source = source.replace(replacement.pre, replacement.post);
            }
            resolve(source);
          }
        });
      }
    });
  }

  // Shortcut to emojify with emojiToHTML as the processor
  emojifyToHTML(source) {
    return self.emojify(source, self.emojiToHTML);
  }

  // Shortcut to emojify with emojiToMD as the processor
  emojifyToMD(source) {
    return self.emojify(source, self.emojiToMD);
  }

  // Returns an HTML image/link tag for an emoji from an emoji object
  emojiToHTML(emoji, size_code = self.EC.defaults.size_code) {
    let img = `<img class="emojidex-emoji" src="https://${self.EC.env.cdn_addr}/emoji/${size_code}/${self.escapeTerm(emoji.code)}.png" emoji-code="${self.escapeTerm(emoji.code)}"${(emoji.moji == null || emoji.moji == "")? "" : ' emoji-moji="' + emoji.moji + '"'} alt="${self.deEscapeTerm(emoji.code)}" />`;
    if(emoji.link != null && emoji.link != '')
      return `<a href="${emoji.link}" emoji-code="${self.escapeTerm(emoji.code)}">${img}</a>`;
    return img;
  }

  // Returns an HTML image tag for an emoji from a ZWJ emoji object
  getZwjEmojiTag(emoji, combinationBaseName, componentNumber, componentLayerOrderNumber, size_code = self.EC.defaults.size_code) {
    return `<img data-component-layer-order-number="${componentLayerOrderNumber}" class="emojidex-emoji" src="https://${self.EC.env.cdn_addr}/emoji/${size_code}/${combinationBaseName}/${componentNumber}/${self.escapeTerm(emoji.code)}.png" emoji-code="${self.escapeTerm(emoji.code)}"${(emoji.moji == null || emoji.moji == "")? "" : ' emoji-moji="' + emoji.moji + '"'} alt="${self.deEscapeTerm(emoji.code)}" />`;
  }

  // Returns an HTML ZWJ emoji objects wrapped with span and base emoji link tag.
  getZwjEmojiSpanTag(baseEmoji, zwjReplacedStrings) {
    if(baseEmoji.link != null && baseEmoji.link != '')
      return `<span class="zwj-emoji"><a href="${baseEmoji.link}" emoji-code="${self.escapeTerm(baseEmoji.code)}">${zwjReplacedStrings}</a></span>`;
    return `<span class="zwj-emoji">${zwjReplacedStrings}</span>`;
  }

  // Returns a MarkDown image/link tag for an emoji from an emoji object
  emojiToMD(emoji, size_code = self.EC.defaults.size_code) {
    let img = `![${(emoji.moji == null || emoji.moji == '')? emoji.code : emoji.moji}](https://${self.EC.env.cdn_addr}/emoji/${size_code}/${self.escapeTerm(emoji.code)}.png "${self.deEscapeTerm(emoji.code)}")`;
    if (emoji.link != null && emoji.link != '')
      return `[${img} ](${emoji.link})`;
    return img;
  }

  // Change emoji HTML tags into emoji codes and returns a string
  // *This method takes a string and returns a string, such as the contents of
  // a text box/content editable element, NOT a DOM object.
  deEmojifyHTML(source, mojify = true) {
    source = self._deEmojifyWrappedHTML(`${source}`, mojify);
    source = self.deLinkHTML(source);
    var targets = source.match(self.img_pattern);
    if (targets == null)
      return source;

    for (let target of targets) {
      if (mojify) {
        let moji_code = target.match(self.emoji_moji_tag_attr_pattern);
        if (moji_code != null && moji_code.length != 1) {
          source = source.replace(target, moji_code[1]);
          continue;
        }
      }
      let emoji_code = target.match(self.emoji_code_tag_attr_pattern);
      source = source.replace(target, self.encapsulateCode(emoji_code[1]));
    }

    return self._scrubGarbageTags(source);
  }

  _deEmojifyWrappedHTML(source, mojify = true) {
    source = self.deLinkHTML(source);
    var targets = source.match(self.wrapped_img_pattern);
    if (targets == null)
      return source;

    for (let target of targets) {
      if (mojify) {
        let moji_code = target.match(self.emoji_moji_tag_attr_pattern);
        if (moji_code != null && moji_code.length != 1) {
          source = source.replace(target, moji_code[1]);
          continue;
        }
      }
      let emoji_code = target.match(self.emoji_code_tag_attr_pattern);
      source = source.replace(target, self.encapsulateCode(emoji_code[1]));
    }

    return source;
  }

  // Scrubs junk left by at.js
  _scrubGarbageTags(source) {
    var targets = source.match(self.garbage_tags);
    if (targets == null)
      return source;

    for (var i = 0; i < targets.length; i++) {
      source = source.replace(targets[i], '');
    }

    return source;
  }

  // Remove links from wrapped emoji images in HTML
  // *Only do self if you need to remove links for functionality.
  deLinkHTML(source) {
    source = self._deLinkWrappedHTML(`${source}`);
    var targets = source.match(self.a_pattern);
    if (targets == null)
      return source;

    for (var i = 0; i < targets.length; i++) {
      source = source.replace(targets[i], targets[i].match(self.img_pattern)[0]);
    }

    return source;
  }

  _deLinkWrappedHTML(source) {
    var targets = source.match(self.wrapped_a_pattern);
    if (targets == null)
      return source;

    for (var i = 0; i < targets.length; i++) {
      source = source.replace(targets[i], targets[i].match(self.img_pattern)[0]);
    }

    return source;
  }

  // Get's the 'this' context for this Util instance
  // Generally should not be necessary, but with JS you never know...
  getContext() {
    return self;
  }
}
