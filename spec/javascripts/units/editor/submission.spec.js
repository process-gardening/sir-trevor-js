"use strict";
import { vi } from "vitest";
const spyOn = vi.spyOn;
import SirTrevor from "../../../../src";

describe("Editor:Submission", function(){

  let element, editor;

  beforeEach(function(){
    SirTrevor.instances = [];
    element = global.createBaseElement();
    editor = new SirTrevor.Editor({
      el: element, defaultType: false
    });
    console.log(element)
  });

  it("calls reset and save on the store", function(){
    spyOn(editor.store, "reset");
    editor.onFormSubmit();
    expect(editor.store.reset).toHaveBeenCalled();
  });

  it("calls the validateBlocks method", function(){
    spyOn(editor, "validateBlocks");
    editor.onFormSubmit();
    expect(editor.validateBlocks).toHaveBeenCalled();
  });

  it("calls the validateBlockTypesExist method", function(){
    spyOn(editor.blockManager, "validateBlockTypesExist");
    editor.onFormSubmit();
    expect(editor.blockManager.validateBlockTypesExist).toHaveBeenCalled();
  });

  it("calls toString on the store", function(){
    spyOn(editor.store, "toString");
    editor.onFormSubmit();
    // Store gets called twice
    expect(editor.store.toString).toHaveBeenCalled();
  });

});
