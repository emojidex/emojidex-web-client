class EmojidexUtil {
  constructor(EC) {
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
      emoji[i].code = this.escape_term(emoji[i].code)
      emoji[i].img_url = `${this.EC.cdn_url}/${size_code}/${this.escape_term(emoji[i].code)}.png`
    }

    return emoji;
  }
}
