import buildCommandPatch from './api/command-patch';
import buildCommand from './api/command';
import buildSelection from './api/selection';
import buildSimpleCommand from './api/simple-command';
import Scribe from '.';

  

  export default function Api(scribe: Scribe) {
    this.CommandPatch = buildCommandPatch(scribe);
    this.Command = buildCommand(scribe);
    this.Selection = buildSelection(scribe);
    this.SimpleCommand = buildSimpleCommand(this, scribe);
  };

