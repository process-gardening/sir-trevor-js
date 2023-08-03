

  /**
   * Chrome:
   */

  

  export default function () {
    return function (scribe) {
      var nbspCharRegExp = /(\s|&nbsp;)+/g;

      // TODO: should we be doing this on paste?
      scribe.registerHTMLFormatter('export', function (html) {
        return html.replace(nbspCharRegExp, ' ');
      });
    };
  };


