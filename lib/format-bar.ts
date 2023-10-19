"use strict";

/**
 * Format Bar
 * --
 * Displayed on focus on a text area.
 * Renders with all available options for the editor instance
 */
import _ from "./lodash";

import config from "./config";

import Dom from "./packages/dom";

import Events from "./packages/events";

import FORMAT_BUTTON_TEMPLATE from "./templates/format-button";

import { boundMethod } from "autobind-decorator";
import { MediatedEventable, MediatedEventableInterface } from "./hofs/mediated-eventable";
import { Renderable, RenderableInterface } from "./hofs/renderable";
import { Eventable } from "./hofs/eventable";
import { Initializeable, InitializeableInterface } from "./hofs/initializeable";

@Initializeable
@Eventable
@Renderable
@MediatedEventable
class FormatBar implements RenderableInterface, MediatedEventableInterface, InitializeableInterface {

  commands: any;
  mediator: any;
  editor: any;
  options: any;

  className: string;

  eventNamespace: string;
  mediatedEvents: {};

  bound: string[];

  startIndex; number;
  endIndex: number;
  isShown: boolean;

  // from RenderableInterface
  el: any;
  id: any;
  block: any;

  constructor(options, mediator, editor) {
    this.editor = editor;
    this.options = Object.assign({}, config.defaults.formatBar, options || {});
    this.commands = this.options.commands;
    this.mediator = mediator;
    this.isShown = false;

    this.className = 'st-format-bar';

    this.eventNamespace = "formatter";

    this.mediatedEvents = {
      'position': 'renderBySelection',
      'show': 'show',
      'hide': 'hide'
    };

  }

  initialize() {

    const buttons = this.commands.reduce(function (memo, format) {
      return memo + FORMAT_BUTTON_TEMPLATE(format);
    }, "");

    this.el.insertAdjacentHTML("beforeend", buttons);

    // We use mousedown rather than click as that allows us to keep focus on the contenteditable field.
    Events.delegate(this.el, '.st-format-btn', 'mousedown', this.onFormatButtonClick);
  }

  @boundMethod
  hide() {
    this.block = undefined;
    this.isShown = false;

    this.el.classList.remove('st-format-bar--is-ready');
    Dom.remove(this.el);
  }

  show() {
    if(this.isShown){
      return;
    }

    this.isShown = true;

    this.editor.outer.appendChild(this.el);
    this.el.classList.add('st-format-bar--is-ready');
  }

  remove(){ Dom.remove(this.el); }

  @boundMethod
  renderBySelection(block) {
    this.block = block;
    this.highlightSelectedButtons();
    this.show();
    this.calculatePosition();
  }

  calculatePosition() {
    const selection = window.getSelection(),
      range = selection.getRangeAt(0),
      boundary = range.getBoundingClientRect(),
      coords = {},
      outer = this.editor.outer,
      outerBoundary = outer.getBoundingClientRect();

    coords.top = (boundary.top - outerBoundary.top) + 'px';
    coords.left = (((boundary.left + boundary.right) / 2) -
      (this.el.offsetWidth / 2) - outerBoundary.left) + 'px';

    this.el.style.top = coords.top;
    this.el.style.left = coords.left;
  }

  highlightSelectedButtons() {
    [].forEach.call(this.el.querySelectorAll(".st-format-btn"), (btn) => {
      const cmd = btn.getAttribute('data-cmd');
      const state = this.block.queryTextBlockCommandState(cmd);
      btn.classList.toggle("st-format-btn--is-active", Boolean(state));
      btn.dataset.state = state;

      btn = null;
    });
  }

  @boundMethod
  onFormatButtonClick(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    if (_.isUndefined(this.block)) {
      throw "Associated block not found";
    }

    const btn = ev.currentTarget,
      cmd = btn.getAttribute('data-cmd');

    if (_.isUndefined(cmd)) {
      return false;
    }

    this.block.execTextBlockCommand(cmd);

    this.highlightSelectedButtons();

    // Re-select the contenteditable field.
    document.activeElement.focus();

    return false;
  }
}

export default FormatBar;
