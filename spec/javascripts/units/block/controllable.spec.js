"use strict";
import { vitest} from "vitest";
import SirTrevor from "../../../../src";
const spyOn = vi.spyOn;
describe("Controllable Block", function(){

  let element, editor, block, testHandler;

  beforeEach(function(){
    element = createBaseElement();
    editor  = new SirTrevor.Editor({
      el: element,
      blockTypes: ["Text"]
    });

    testHandler = vi.fn();

    SirTrevor.Blocks.ControllableBlock = SirTrevor.Block.extend({
      controllable: true,
      controls: {
        'test': testHandler
      }
    });

    block = new SirTrevor.Blocks.ControllableBlock({}, editor.ID, editor.mediator);
  });

  afterEach(function(){
    delete SirTrevor.Blocks.ControllableBlock;
  });

  describe("render", function(){

    beforeEach(function(){
      spyOn(block, 'withMixin');
      block.render();
    });

    it("gets the controllable mixin", function(){
      expect(block.withMixin)
        .toHaveBeenCalledWith(SirTrevor.BlockMixins.Controllable);
    });

    it("adds an element to control_ui", function(){
      expect(block.control_ui.querySelectorAll('.st-block-control-ui-btn').length)
        .toBe(1);
    });

    /**
     TODO: This doesn't work
    it("runs the handler on click", function(){
      const event = new MouseEvent("click");
      const blk = SirTrevor.Blocks;
      const ctrl = block.control_ui.querySelector('.st-block-control-ui-btn');
      ctrl.dispatchEvent(event);
      expect(testHandler)
        .toHaveBeenCalled();
    });

     *
     */
  });

});
