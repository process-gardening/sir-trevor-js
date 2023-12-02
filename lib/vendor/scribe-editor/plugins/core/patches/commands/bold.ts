import Scribe from "../../../..";


  

  export default function () {
    return function (scribe: Scribe) {
        const boldCommand = new scribe.api.CommandPatch('bold');

        /**
       * Chrome: Executing the bold command inside a heading corrupts the markup.
       * Disabling for now.
       */
      boldCommand.queryEnabled = function () {
          const selection = new scribe.api.Selection();
          const headingNode = selection.getContaining(function (node) {
              return (/^(H[1-6])$/).test(node.nodeName);
          });

          return scribe.api.CommandPatch.prototype.queryEnabled.apply(this, arguments) && ! headingNode;
      };

      // TODO: We can't use STRONGs because this would mean we have to
      // re-implement the `queryState` command, which would be difficult.

      scribe.commandPatches.bold = boldCommand;
    };
  };


