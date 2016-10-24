class EmojidexUtil {
  constructor(EC) {
    self = this;

    self.EC = EC;

    self.a_pattern = RegExp("<a href='[^']*' emoji-code='[^']*'><img class='emojidex-emoji' src='[^']*' (emoji-code='[^']*' emoji-moji='[^']*'|emoji-code='[^']*') alt='[^']*' \/><\/a>", 'g');
    self.img_pattern = RegExp("<img class='emojidex-emoji' src='[^']*' (emoji-code='[^']*' emoji-moji='[^']*'|emoji-code='[^']*') alt='[^']*' \/>", 'g');
    self.emoji_code_tag_attr_pattern = RegExp("emoji-code='([^']*)'", '');
    self.emoji_moji_tag_attr_pattern = RegExp("emoji-moji='([^']*)'", '');
    self.ignored_characters = '\'":;@&#~{}<>\\r\\n\\[\\]\\!\\$\\+\\?\\%\\*\\/\\\\';
    self.short_code_pattern = RegExp(`:([^\\s${self.ignored_characters}][^${self.ignored_characters}]*[^${self.ignored_characters}]):|:([^${self.ignored_characters}]):`, 'g');
    self.utf_pattern = RegExp(self.EC.Data.moji_codes.moji_array.join('|'), 'g');
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

  // Converts an emoji array to [{code: "moji_code", img_url: "http://cdn...moji_code.png}] format
  simplify(emoji = self.results, size_code = self.EC.size_code) {
    for (i = 0; i < emoji.length; i++) {
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
      return self.emojifyCodes(processed, processor)
    }).then((processed) => {
      return processed
    });
  }

  // Convert UTF emoji using the specified processor
  emojifyMoji(source, processor = self.emojiToHTML) {
    return new Promise((resolve, reject) => {
      let found = source.match(self.utf_pattern);
      if (found == null) { return }

      let count = found.length;
      let replacements = [];

      for (find of found) {
        let snip = `${find}`;
        self.EC.Search.find(self.EC.Data.moji_codes.moji_index[snip]).then((result) => {
          if (result.hasOwnProperty('code')) {
            replacements.push({pre: snip, post: processor(result)});
          }
          return source
        }).then((source) => {
          count -= 1;
        }).catch((responce) => {
          count -= 1;
        }).then(() => {
          if(count == 0) {
            for (replacement of replacements) {
              source = source.replace(replacement.pre, replacement.post);
            }
            resolve(source)
          }
        });
      }
    });
  }

  // Convert emoji short codes using the specified processor
  emojifyCodes(source, processor = self.emojiToHTML) {
    return new Promise((resolve, reject) => {
      let found = source.match(self.short_code_pattern);

      if (found == null) { return }

      let count = found.length;
      let replacements = [];


      for (find of found) {
        let snip = `${find}`;
        self.EC.Search.find(self.EC.Util.unEncapsulateCode(snip)).then((result) => {
          if (result.hasOwnProperty('code')) {
            replacements.push({pre: snip, post: processor(result)});
          }
          return source
        }).then((source) => {
          count -= 1;
        }).catch((responce) => {
          count -= 1;
        }).then(() => {
          if(count == 0) {
            for (replacement of replacements) {
              source = source.replace(replacement.pre, replacement.post);
            }
            resolve(source)
          }
        });
      }
    });
  }

  // Shortcut to emojify with emojiToHTML as the processor
  emojifyToHTML(source) {
    return self.emojify(source, self.emojiToHTML)
  }

  // Shortcut to emojify with emojiToMD as the processor
  emojifyToMD(source) {
    return self.emojify(source, self.emojiToMD);
  }

  // Returns an HTML image/link tag for an emoji from an emoji object
  emojiToHTML(emoji, size_code =  self.EC.defaults.size_code) {
    let img = `<img class='emojidex-emoji' src='http://${self.EC.env.cdn_addr}/emoji/${size_code}/${self.escapeTerm(emoji.code)}.png' emoji-code='${self.escapeTerm(emoji.code)}'${(emoji.moji == null || emoji.moji == '')? '' : " emoji-moji='" + emoji.moji + "'"} alt='${self.deEscapeTerm(emoji.code)}' />`;
    if(emoji.link != null && emoji.link != '')
      return `<a href='${emoji.link}' emoji-code='${self.escapeTerm(emoji.code)}'>${img}</a>`;
    return img;
  }

  // Returns a MarkDown image/link tag for an emoji from an emoji object
  emojiToMD(emoji, size_code = self.EC.defaults.size_code) {
    let img = `![${(emoji.moji == null || emoji.moji == '')? emoji.code : emoji.moji}](http://${self.EC.env.cdn_addr}/emoji/${size_code}/${self.escapeTerm(emoji.code)}.png "${self.deEscapeTerm(emoji.code)}")`;
    if (emoji.link != null && emoji.link != '')
      return `[${img} ](${emoji.link})`;
    return img;
  }

  // Change emoji HTML tags into emoji codes and returns a string
  // *This method takes a string and returns a string, such as the contents of
  // a text box/content editable element, NOT a DOM object.
  deEmojifyHTML(source, mojify = true) {
    source = self.deLinkHTML(source);
    let found = source.match(self.img_pattern);

    for (find of found) {
      if (mojify) {
        let moji_code = find.match(self.emoji_moji_tag_attr_pattern);
        if (moji_code != null && moji_code.length != 1) {
          source = source.replace(find, moji_code[1]);
          continue;
        }
      }
      let emoji_code = find.match(self.emoji_code_tag_attr_pattern);
      source = source.replace(find, self.encapsulateCode(emoji_code[1]));
    }

    return source;
  }

  // Remove links from wrapped emoji images in HTML
  // *Only do self if you need to remove links for functionality.
  deLinkHTML(source) {
    let found = source.match(self.a_pattern);

    for (find of found) {
      source = source.replace(find, find.match(self.img_pattern)[0]);
    }

    return source;
  }
}
