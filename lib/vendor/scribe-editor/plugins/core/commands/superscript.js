

  

  export default function () {
    return function (scribe) {
        const superscriptCommand = new scribe.api.Command('superscript');

        scribe.commands.superscript = superscriptCommand;
    };
  };


