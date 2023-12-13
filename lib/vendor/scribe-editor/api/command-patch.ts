import Scribe from "..";


  

  export default function (scribe: Scribe) {
    function CommandPatch(commandName: any) {
      this.commandName = commandName;
    }

    CommandPatch.prototype.execute = function (value: any) {
      scribe.transactionManager.run(function () {
        document.execCommand(this.commandName, false, value || null);
      }.bind(this));
    };

    CommandPatch.prototype.queryState = function () {
      return document.queryCommandState(this.commandName);
    };

    CommandPatch.prototype.queryEnabled = function () {
      return document.queryCommandEnabled(this.commandName);
    };

    return CommandPatch;
  };


