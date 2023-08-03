import keystrokes from '../../../keystrokes';

  

  export default function () {
    return function (scribe) {
      var undoCommand = new scribe.api.Command('undo');

      undoCommand.execute = function () {
        scribe.undoManager.undo();
      };

      undoCommand.queryEnabled = function () {
        return scribe.undoManager.position < scribe.undoManager.length;
      };

      scribe.commands.undo = undoCommand;

      if (scribe.options.undo.enabled) {
        scribe.el.addEventListener('keydown', function (event) {
          if (keystrokes.isUndoKeyCombination(event)) {
            event.preventDefault();
            undoCommand.execute();
          }
        });
      }
    };
  };


