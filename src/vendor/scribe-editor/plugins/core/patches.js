import boldCommand from './patches/commands/bold';
import indentCommand from './patches/commands/indent';
import insertHTMLCommand from './patches/commands/insert-html';
import insertListCommands from './patches/commands/insert-list';
import outdentCommand from './patches/commands/outdent';
import createLinkCommand from './patches/commands/create-link';
import events from './patches/events';

  /**
   * Command patches browser inconsistencies. They do not perform core features
   * of the editor, such as ensuring P elements are created when
   * applying/unapplying commands — that is the job of the core commands.
   */

  

  export default {
    commands: {
      bold: boldCommand,
      indent: indentCommand,
      insertHTML: insertHTMLCommand,
      insertList: insertListCommands,
      outdent: outdentCommand,
      createLink: createLinkCommand,
    },
    events: events
  };


