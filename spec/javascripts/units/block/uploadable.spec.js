"use strict";

import { vitest} from "vitest";
import SirTrevor from "../../../../lib";
const spyOn = vi.spyOn;

describe("Block:Uploadable Block", function(){

  let element, editor, block;

  beforeEach(function(){
    element = global.createBaseElement();
    editor = new SirTrevor.Editor({ el: element });

    SirTrevor.Blocks.UploadableBlock = SirTrevor.Block.extend({
      uploadable: true
    });

    block = new SirTrevor.Blocks.UploadableBlock({}, editor.ID, editor.mediator);
  });

  afterEach(function(){
    delete SirTrevor.Blocks.UploadableBlock;
  });

  describe("render", function(){

    beforeEach(function(){
      spyOn(block, 'withMixin');

      block = block.render();
    });

    it("gets the uploadable mixin", function(){
      expect(block.withMixin)
        .toHaveBeenCalledWith(SirTrevor.BlockMixins.Uploadable);
    });

    it("creates an inputs element", function(){
      expect(block.inputs)
        .not.toBe(undefined);
    });

    it("appends the html to the inputs element", function(){
      expect(block.inputs.querySelectorAll('.st-block__upload-container').length)
        .toBe(1);
    });

  });

});
