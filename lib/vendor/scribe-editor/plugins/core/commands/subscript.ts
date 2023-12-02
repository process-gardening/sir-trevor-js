import Scribe from "../../..";


  

  export default function () {
    return function (scribe: Scribe) {
        const subscriptCommand = new scribe.api.Command('subscript');

        scribe.commands.subscript = subscriptCommand;
    };
  };


