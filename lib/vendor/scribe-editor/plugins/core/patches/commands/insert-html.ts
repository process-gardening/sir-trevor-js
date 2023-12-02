import Scribe from "../../../..";

  
  export default function () {
    return function (scribe: Scribe) {
        const insertHTMLCommandPatch = new scribe.api.CommandPatch('insertHTML');
        const nodeHelpers = scribe.node;

        insertHTMLCommandPatch.execute = function (value) {
        scribe.transactionManager.run(function () {
          scribe.api.CommandPatch.prototype.execute.call(this, value);
          nodeHelpers.removeChromeArtifacts(scribe.el);
        }.bind(this));
      };

      scribe.commandPatches.insertHTML = insertHTMLCommandPatch;
    };
  };


