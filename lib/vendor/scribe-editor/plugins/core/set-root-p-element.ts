

  /**
   * Sets the default content of the scribe so that each carriage return creates
   * a P.
   */

  
  
  function getChromeVersion () {
      const raw = window.navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);

      return raw ? parseInt(raw[2], 10) : false;
  }

  export default function () {
    return function (scribe) {
      // The content might have already been set, in which case we don't want
      // to apply.
      if (scribe.getHTML().trim() === '') {
          /**
           * We have to begin with the following HTML, because otherwise some
           * browsers(?) will position the caret outside of the P when the scribe is
           * focused.
           */
          const chromeVersion = getChromeVersion();

          // Force IE10 to not include br otherwise a linebreak is always included
        // in the textarea.
        if(window.navigator.userAgent.match(/MSIE 10/)) {
          scribe.setContent('<p></p>');
        } else if (chromeVersion && chromeVersion >= 95) {
          // Chrome 95 hangs when initial content is set
        } else {
          scribe.setContent('<p><br></p>');
        }
      }
    };
  };


