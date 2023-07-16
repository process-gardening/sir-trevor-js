"use strict";

global.SirTrevor = require('../../../');

global.createBaseElement = function() {
  const form = document.createElement("form");
  const element = document.createElement("textarea");
  form.appendChild(element);
  return element;
};
