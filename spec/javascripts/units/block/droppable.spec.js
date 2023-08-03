"use strict";

import { vitest} from "vitest";
import SirTrevor from "../../../../src";
const spyOn = vi.spyOn;

describe("Block:Droppable Block", function(){

  let element, editor, block;

  beforeEach(function(){
    element = global.createBaseElement();
    editor = new SirTrevor.Editor({ el: element });

    SirTrevor.Blocks.DroppableBlock = SirTrevor.Block.extend({
      droppable: true
    });

    block = new SirTrevor.Blocks.DroppableBlock({}, editor.ID, editor.mediator);
  });

  afterEach(function(){
    delete SirTrevor.Blocks.DroppableBlock;
  });

  describe("render", function(){

    beforeEach(function(){
      spyOn(block, 'withMixin');
      block = block.render();
    });

    it("gets the droppable mixin", function(){
      expect(block.withMixin)
        .toHaveBeenCalledWith(SirTrevor.BlockMixins.Droppable);
    });

    it("adds a droppable class to inner", function(){
      expect(block.inner.classList.contains('st-block__inner--droppable'));
    });

    it("creates an inputs element", function(){
      expect(block.inputs)
        .not.toBe(undefined);
    });

    it("appends the html to the inputs element", function(){
      expect(block.inputs.querySelectorAll('.st-block__dropzone').length)
        .toBe(1);
    });

  });

});
