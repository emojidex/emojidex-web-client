class EmojidexUtil {
  constructor(EC) {
    if (EC == null)
      EC = new EmojidexClient();
    this.EC = EC;
  }

  // Escapes spaces to underscore
  escape_term(term) {
    return term.replace(/\s/g, '_').replace(/(\(|\))/g, '\\$1');
  }

  // De-Escapes underscores to spaces
  de_escape_term(term) {
    return term.replace(/_/g, ' ');
  }

  // Adds colons around a code
  encapsulate_code(code) {
    return `:${this.unencapsulate_code(code)}:`;
  }

  // Removes colons around a code
  unencapsulate_code(code) {
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
      emoji[i].code = this.escape_term(emoji[i].code);
      emoji[i].img_url = `${this.EC.cdn_url}/${size_code}/${this.escape_term(emoji[i].code)}.png`;
    }

    return emoji;
  }


  // Returns an HTML image/link tag for an emoji from an emoji object
  emoji_to_html(emoji, size_code = this.EC.defaults.size_code) {
    let img = `<img src='http://${this.EC.env.cdn_addr}/emoji/${this.EC.defaults.size_code}/${this.escape_term(emoji.code)}.png' emoji-code='${this.escape_term(emoji.code)}' alt='${this.de_escape_term(emoji.code)}' />`;
    if(emoji.link != null && emoji.link != '')
      return `<a href='${emoji.link}' emoji-code='${this.escape_term(emoji.code)}'>${img}</a>`;
    return img;
  }

  // Returns a MarkDown image/link tag for an emoji from an emoji object
  emoji_to_md(emoji, size_code = this.EC.defaults.size_code) {
    let img = `![${emoji.code}](http://${this.EC.env.cdn_addr}/emoji/${size_code}/${this.escape_term(emoji.code)}.png "${this.de_escape_term(emoji.code)} em😜ji")`;
    if (emoji.link != null && emoji.link != '')
      return `[${img} ](${emoji.link})`;
    return img;
  }

  de_emojify_html(source) {
    //so = $(source);
    //remove links
    source.find("a[emoji-code]").contents().unwrap();

    //change emoji images to encapsulated and de_escaped codes
    //TODO

    return so;
  }
}
