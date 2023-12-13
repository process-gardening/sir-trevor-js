"use strict";

import utils from "../utils";

import config from "../config";

import Dom from "../packages/dom";

import Events from "../packages/events";

export default {

  mixinName: "Controllable",

  initializeControllable: function() {
    utils.log("Adding controllable to block " + this.blockID);
    //this.inner.classList.add('st-block__inner--controllable');
    this.control_ui = Dom.createElement('div', {'class': 'st-block__control-ui'});
    Object.keys(this.controls).forEach(
      function(cmd) {
        // Bind configured handler to current block context
        this.addUiControl(cmd, this.controls[cmd].bind(this));
      },
      this
    );
    //this.inner.appendChild(this.control_ui);
    //this.ui_drawer.appendChild(this.control_ui);
    this.ui_drawer.querySelector('.st-block__ui-controllables').appendChild(this.control_ui);
  },

  getControlTemplate: function(cmd) {
    return Dom.createElement("a", {
      'data-icon': cmd,
      'class': 'st-icon st-block-control-ui-btn st-block-control-ui-btn--' + cmd,
      'html': `<svg role="img" class="st-icon">
                  <use xlink:href="${config.defaults.iconUrl}#${cmd}"/>
                </svg>`
    });
  },

  addUiControl: function(cmd, handler) {
    this.control_ui.appendChild(this.getControlTemplate(cmd));
    Events.delegate(this.control_ui, '.st-block-control-ui-btn--' + cmd, 'click', (e) => {
      this.selectUiControl(cmd);
      handler(e);
      e.stopPropagation();
    });
  },

  selectUiControl: function(cmd) {
    const selectedClass = 'st-block-control-ui-btn--selected';
    Object.keys(this.controls).forEach(control => {
      this.getControlUiBtn(control).classList.remove(selectedClass);
    });
    this.getControlUiBtn(cmd).classList.add(selectedClass);
  },

  getControlUiBtn: function(cmd) {
    return this.control_ui.querySelector('.st-block-control-ui-btn--' + cmd);
  }
};