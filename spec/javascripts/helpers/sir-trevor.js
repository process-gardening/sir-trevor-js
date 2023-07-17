"use strict";

import generated from "../../../src/index";

const createBaseElement = function() {
  const form = document.createElement("form");
  const element = document.createElement("textarea");
  form.appendChild(element);
  return element;
};

export function setup() {
  global.SirTrevor = generated;
  window.SirTrevor = generated;

  global.createBaseElement = createBaseElement;
  window.createBaseElement = createBaseElement;
}

