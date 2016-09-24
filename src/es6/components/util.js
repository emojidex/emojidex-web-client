class EmojidexUtil {
  constructor(EC) {
    this.EC = EC;

    this.a_pattern = RegExp("<a href='[^']*' emoji-code='[^']*'><img class='emojidex-emoji' src='[^']*' (emoji-code='[^']*' emoji-moji='[^']*'|emoji-code='[^']*') alt='[^']*' \/><\/a>", 'g');
    this.img_pattern = RegExp("<img class='emojidex-emoji' src='[^']*' (emoji-code='[^']*' emoji-moji='[^']*'|emoji-code='[^']*') alt='[^']*' \/>", 'g');
    this.emoji_code_pattern = RegExp("emoji-code='([^']*)'", '');
    this.emoji_moji_pattern = RegExp("emoji-moji='([^']*)'", '');
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
    return this.escapeTerm(term).replace(/\(/g, '%28').replace(/\)/g, '%29');
  }

  // Adds colons around a code
  encapsulateCode(code) {
    return `:${this.unEncapsulateCode(code)}:`;
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
  simplify(emoji = this.results, size_code = this.EC.size_code) {
    for (i = 0; i < emoji.length; i++) {
      emoji[i].code = this.escapeTerm(emoji[i].code);
      emoji[i].img_url = `${this.EC.cdn_url}/${size_code}/${this.escapeTerm(emoji[i].code)}.png`;
    }

    return emoji;
  }


  // Returns an HTML image/link tag for an emoji from an emoji object
  emojiToHTML(emoji, size_code = this.EC.defaults.size_code) {
    let img = `<img class='emojidex-emoji' src='http://${this.EC.env.cdn_addr}/emoji/${size_code}/${this.escapeTerm(emoji.code)}.png' emoji-code='${this.escapeTerm(emoji.code)}'${(emoji.moji == null || emoji.moji == '')? '' : " emoji-moji='" + emoji.moji + "'"} alt='${this.deEscapeTerm(emoji.code)}' />`;
    if(emoji.link != null && emoji.link != '')
      return `<a href='${emoji.link}' emoji-code='${this.escapeTerm(emoji.code)}'>${img}</a>`;
    return img;
  }

  // Returns a MarkDown image/link tag for an emoji from an emoji object
  emojiToMD(emoji, size_code = this.EC.defaults.size_code) {
    let img = `![${(emoji.moji == null || emoji.moji == '')? emoji.code : emoji.moji}](http://${this.EC.env.cdn_addr}/emoji/${size_code}/${this.escapeTerm(emoji.code)}.png "${this.deEscapeTerm(emoji.code)}")`;
    if (emoji.link != null && emoji.link != '')
      return `[${img} ](${emoji.link})`;
    return img;
  }

  // Change emoji HTML tags into emoji codes and returns a string
  // *This method takes a string and returns a string, such as the contents of 
  // a text box/content editable element, NOT a DOM object.
  deEmojifyHTML(source, mojify = true) {
    source = this.deLinkHTML(source);
    let found = source.match(this.img_pattern);

    for (find of found) {
      if (mojify) {
        let moji_code = find.match(this.emoji_moji_pattern);
        if (moji_code != null && moji_code.length != 1) {
          source = source.replace(find, moji_code[1]);
          continue;
        }
      }
      let emoji_code = find.match(this.emoji_code_pattern);
      source = source.replace(find, this.encapsulateCode(emoji_code[1]));
    }

    return source;
  }

  // Remove links from wrapped emoji images in HTML
  // *Only do this if you need to remove links for functionality.
  deLinkHTML(source) {
    let found = source.match(this.a_pattern);

    for (find of found) {
      source = source.replace(find, find.match(this.img_pattern)[0]);
    }

    return source;
  }
}
