"use strict";

import _ from "./lodash";

import Scribe from "./vendor/scribe-editor";

import config from "./config";
import {ScribePluginSanitizer} from "./vendor/scribe-plugin-sanitizer";
import {ScribePluginPlainTextFormatter} from "./vendor/scribe-plugin-new-lines-formatter";

import scribePluginLinkPromptCommand from "./blocks/scribe-plugins/scribe-link-prompt-plugin";

const sanitizeDefaults = {
  p: true,
  a: {
    href: true,
    target: '_blank',
    rel: true
  },
  i: true,
  b: true,
  strong: true,
  em: true,
  sup: true
};

export default {

  initScribeInstance: function(el, scribeOptions, configureScribe, editorOptions) {

    scribeOptions = scribeOptions || {};

    let scribeConfig = {debug: config.scribeDebug};
    let tags = sanitizeDefaults;

    if (_.isObject(scribeOptions)) {
      scribeConfig = Object.assign(scribeConfig, scribeOptions);
    }

    const scribe = new Scribe(el, scribeConfig);

    if (scribeOptions.hasOwnProperty("tags")) {
      tags = Object.assign(sanitizeDefaults, scribeOptions.tags);
    }

    scribe.use(ScribePluginPlainTextFormatter());
    scribe.use(scribePluginLinkPromptCommand({ editorOptions }));
    scribe.use(ScribePluginSanitizer({tags: tags}));

    if (_.isFunction(configureScribe)) {
      configureScribe.call(this, scribe);
    }

    return scribe;
  },

  execTextBlockCommand: function(scribeInstance, cmdName) {
    if (_.isUndefined(scribeInstance)) {
      throw "No Scribe instance found to query command";
    }

    const cmd = scribeInstance.getCommand(cmdName);
    scribeInstance.el.focus();
    return cmd.execute();
  },

  queryTextBlockCommandState: function(scribeInstance, cmdName) {
    if (_.isUndefined(scribeInstance)) {
      throw "No Scribe instance found to query command";
    }

    const cmd = scribeInstance.getCommand(cmdName),
      sel = new scribeInstance.api.Selection();
    return sel.range && cmd.queryState();
  },
};
