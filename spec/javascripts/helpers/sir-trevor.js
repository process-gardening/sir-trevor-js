"use strict";

import generated from "../../../src/index";

global.SirTrevor = generated;

global.createBaseElement = function() {
  const form = document.createElement("form");
  const element = document.createElement("textarea");
  form.appendChild(element);
  return element;
};
