"use strict";

import generated from "../../../src/index";
import { afterAll, beforeAll} from "vitest";



const createBaseElement = function() {
  const form = document.createElement("form");
  const element = document.createElement("textarea");
  form.appendChild(element);
  return element;
};

beforeAll(() => {
  global.SirTrevor = generated;
  global.createBaseElement = createBaseElement;
})

afterAll(() => {
  delete global.SirTrevor;
  delete global.createBaseElement;
})

