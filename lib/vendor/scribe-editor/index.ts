import plugins from './plugins/core/plugins';
import commands from './plugins/core/commands';
import formatters from './plugins/core/formatters';
import events from './plugins/core/events';
import patches from './plugins/core/patches';
import Api from './api';
import buildTransactionManager from './transaction-manager';
import UndoManager from './undo-manager';
import EventEmitter from './event-emitter';
import nodeHelpers from './node';
import Immutable from 'immutable';
import config, { ScribeOptions } from './config';
import eventNames from './events';
import { FormatterFactory, HTMLFormatterFactory } from './formatter';



function listenForUserInput() {
  /**
   * This section replaces a simple observation of the input event.
   * With Edge, Chrome, FF, this event triggers when either the user types
   * something.
   * With IE, the input event does not trigger on contenteditable element
   * that is why we have to simulate it.
   */
  let isComposing = false;
  const self = this;

  const handler = {
    handleEvent: function (e) {
      if (isComposing) return;

      if (e.type === 'compositionstart') {
        isComposing = true;

      } else if (e.type === 'compositionend') {
        isComposing = false;
        self.transactionManager.run();
      } else {
        self.transactionManager.run();
      }
    }
  };

  ['compositionstart', 'compositionend', 'keydown', 'cut', 'paste'].forEach(function (e) {
    this.el.addEventListener(e, handler, false);
  }.bind(this));
}

class Scribe extends EventEmitter {

  el: HTMLElement;
  commands: any;
  options: ScribeOptions;
  commandPatches: any;
  _plainTextFormatterFactory: FormatterFactory;
  _htmlFormatterFactory: HTMLFormatterFactory;
  api: any;
  Immutable: any;
  transactionManager: any;
  undoManager: any;
  _merge: boolean;
  _forceMerge: boolean;
  _mergeTimer: number | NodeJS.Timeout;
  _lastItem: any;
  _skipFormatters: boolean;
  node: any;
  element: any;

  constructor(el: HTMLElement, options: ScribeOptions) {
    super();
    this.el = el;
    this.commands = {};
    this.options = config.checkOptions(options);
    this.commandPatches = {};
    this._plainTextFormatterFactory = new FormatterFactory();
    this._htmlFormatterFactory = new HTMLFormatterFactory();
    this.Immutable = Immutable;
    this.undoManager = false;
    this.node = nodeHelpers;
    this.element = this.node;

    this.api = new Api(this);
    const TransactionManager = buildTransactionManager(this);
    this.transactionManager = new TransactionManager();

    if (this.options.undo.enabled) {
      if (this.options.undo.manager) {
        this.undoManager = this.options.undo.manager;
      }
      else {
        this.undoManager = new UndoManager(this.options.undo.limit, this.el);
      }
      this._merge = false;
      this._forceMerge = false;
      this._mergeTimer = 0;
      this._lastItem = { content: '' };
    }

    this.setHTML(this.getHTML());
    this.el.setAttribute('contenteditable', "true");

    listenForUserInput.call(this);


    config.filterByBlockLevelMode
    /**
   * Core Plugins
   */
    const corePlugins = Immutable.OrderedSet(this.options.defaultPlugins)
      .sort(config.sortByPlugin('setRootPElement')) // Ensure `setRootPElement` is always loaded first
      .filter(config.filterByBlockLevelMode(this.allowsBlockElements()))
      .map(function (plugin) {
        return plugins[plugin];
      });

    // Formatters
    const defaultFormatters = Immutable.List(this.options.defaultFormatters)
      .filter(function (formatter) {
        return !!formatters[formatter];
      })
      .map(function (formatter) {
        return formatters[formatter];
      });

    // Patches

    const defaultPatches = Immutable.List.of(
      patches.events
    );

    const defaultCommandPatches = Immutable.List(this.options.defaultCommandPatches).map(function (patch) {
      return patches.commands[patch];
    });

    const defaultCommands = Immutable.List.of(
      'indent',
      'insertList',
      'outdent',
      'redo',
      'subscript',
      'superscript',
      'undo'
    ).map(function (command) {
      return commands[command];
    });

    const allPlugins = Immutable.List().concat(
      corePlugins,
      defaultFormatters,
      defaultPatches,
      defaultCommandPatches,
      defaultCommands);

    allPlugins.forEach(function (plugin) {
      this.use(plugin());
    }.bind(this));

    this.use(events());

  }

  use(configurePlugin: any) {
    configurePlugin(this);
  }

  setHTML(html: string, skipFormatters?: boolean) {
    if (this.options.undo.enabled) {
      this._lastItem.content = html;
    }

    if (skipFormatters) {
      this._skipFormatters = true;
    }
    // IE11: Setting HTML to the value it already has causes breakages elsewhere (see #336)
    if (this.el.innerHTML !== html) {
      this.el.innerHTML = html;
    }
  }

  getHTML() {
    return this.el.innerHTML;
  }

  getContent() {
    // Remove bogus BR element for Firefox — see explanation in BR mode files.
    return this._htmlFormatterFactory.formatForExport(this.getHTML().replace(/<br>$/, ''));
  }

  getTextContent() {
    return this.el.textContent;
  }

  pushHistory() {
    if (this.options.undo.enabled) {
      // Get scribe previous content, and strip markers.
      const lastContentNoMarkers = this._lastItem.content.replace(/<em [^>]*class="scribe-marker"[^>]*>[^<]*?<\/em>/g, '');

      // We only want to push the history if the content actually changed.
      if (this.getHTML() !== lastContentNoMarkers) {
        const selection = new this.api.Selection();

        selection.placeMarkers();
        const content = this.getHTML();
        selection.removeMarkers();

        // Checking if there is a need to merge, and that the previous history item
        // is the last history item of the same scribe instance.
        // It is possible the last transaction is not for the same instance, or
        // even not a scribe transaction (e.g. when using a shared undo manager).
        const previousItem = this.undoManager.item(this.undoManager.position);
        if ((this._merge || this._forceMerge) && previousItem && this._lastItem == previousItem[0]) {
          // If so, merge manually with the last item to save more memory space.
          this._lastItem.content = content;
        }
        else {
          // Otherwise, create a new history item, and register it as a new transaction
          this._lastItem = {
            previousItem: this._lastItem,
            content: content,
            scribe: this,
            execute: function () { },
            undo: function () { this.scribe.restoreFromHistory(this.previousItem); },
            redo: function () { this.scribe.restoreFromHistory(this); }
          };

          this.undoManager.transact(this._lastItem, false);
        }

        // Merge next transaction if it happens before the interval option, otherwise don't merge.
        clearTimeout(this._mergeTimer);
        this._merge = true;
        this._mergeTimer = setTimeout(function () { this._merge = false; }, this.options.undo.interval);

        return true;
      }
    }

    return false;
  };

  getCommand(commandName) {
    return this.commands[commandName] || this.commandPatches[commandName] || new this.api.Command(commandName);
  }

  restoreFromHistory(historyItem) {
    this._lastItem = historyItem;

    this.setHTML(historyItem.content, true);

    // Restore the selection
    const selection = new this.api.Selection();
    selection.selectMarkers();

    // Because we skip the formatters, a transaction is not run, so we have to
    // emit this event ourselves.
    this.trigger(eventNames.legacyContentChanged);
    this.trigger(eventNames.contentChanged);
  };

  allowsBlockElements() {
    return this.options.allowBlockElements;
  }

  setContent(content: string) {

    if (!this.allowsBlockElements()) {
      // Set bogus BR element for Firefox — see explanation in BR mode files.
      content = content + '<br>';
    }

    this.setHTML(content);

    this.trigger(eventNames.legacyContentChanged);
    this.trigger(eventNames.contentChanged);
  }

  insertPlainText(plainText: string) {
    this.insertHTML('<p>' + this._plainTextFormatterFactory.format(plainText) + '</p>');
  }

  insertHTML(html: string) {
    this.getCommand('insertHTML').execute(this._htmlFormatterFactory.format(html));
  }

  isDebugModeEnabled() {
    return this.options.debug;
  }

  /**
 * Applies HTML formatting to all editor text.
 * @param {String} phase sanitize/normalize/export are the standard phases
 * @param {Function} fn Function that takes the current editor HTML and returns a formatted version.
 */
  registerHTMLFormatter(phase, formatter) {
    this._htmlFormatterFactory.formatters[phase]
      = this._htmlFormatterFactory.formatters[phase].push(formatter);
  }

  registerPlainTextFormatter(formatter) {
    this._plainTextFormatterFactory.formatters
      = this._plainTextFormatterFactory.formatters.push(formatter);
  }

  destroy() {
    this.trigger(eventNames.destroy);
  }



}

export default Scribe;


