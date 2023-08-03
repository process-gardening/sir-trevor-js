

  

  export default function () {
    return function (scribe) {
        const subscriptCommand = new scribe.api.Command('subscript');

        scribe.commands.subscript = subscriptCommand;
    };
  };


