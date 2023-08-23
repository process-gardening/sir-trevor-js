"use strict";

import { vitest} from "vitest";
const spyOn = vi.spyOn;
import SirTrevor from "../../../../lib";

describe("BlockManager::Creating blocks", function(){

  let manager;

  // TODO: Tests don't work for List extended
  Object.keys(SirTrevor.Blocks).filter(key => key !== "List_Extended").forEach(function createBlockTest(blockName, i, blocks){

    describe("create " + blockName + "  with no editor options", function(){

      beforeEach(function(){
        const element = global.createBaseElement();
        const editor = new SirTrevor.Editor({
          el: element,
          blockTypes: [blockName]
        });
        manager = editor.blockManager;

        spyOn(SirTrevor.EventBus, 'trigger');
        manager.createBlock(blockName);
      });

      it("adds a block to the local block store", function(){
        expect(manager.blocks.length).toBe(1);
      });

      it("creates a block of the type specified", function(){
        expect(manager.blocks[0].type).toEqual(blockName.toLowerCase());
      });

      it("increments the block type count", function(){
        expect(manager._getBlockTypeCount(blockName)).toBe(1);
      });

      it("fires a create:new block event", function() {
        const evBus = SirTrevor.EventBus;
        const lastEvent = SirTrevor.EventBus.trigger.mock.calls[0];
        const [args, _] = lastEvent;
        expect(args).toBe('block:create:new');
      });

    });

  });

  describe("createBlock with overall block limit", function(){

    beforeEach(function(){
      const element = global.createBaseElement();
      const editor = new SirTrevor.Editor({
        el: element,
        defaultType: false,
        blockLimit: 1,
        blockTypes: ["Text"]
      });
      manager = editor.blockManager;

      manager.createBlock('Text');
    });

    it("adheres to the limit", function(){
      expect(manager.blocks.length).toBe(1);
      expect(manager._blockLimitReached()).toBe(true);
    });

  });

  describe("createBlock with blockTypes set", function(){

    beforeEach(function(){
      const element = global.createBaseElement();
      const editor = new SirTrevor.Editor({
        el: element,
        defaultType: false,
        blockTypes: ["Text"]
      });
      manager = editor.blockManager;
    });

    it("will only create a block where the type is available", function(){
      manager.createBlock('Image');
      expect(manager.blocks.length).toBe(0);

      manager.createBlock('Text');
      expect(manager.blocks.length).toBe(1);
    });

  });

  describe("createBlock with blockTypeLimits set", function(){

    beforeEach(function(){
      const element = global.createBaseElement();
      const editor = new SirTrevor.Editor({
        el: element,
        defaultType: false,
        blockTypeLimits: {'Text': 1},
        blockTypes: ["Text"]
      });
      manager = editor.blockManager;
    });

    it("adheres to the blockType limit", function(){
      manager.createBlock('Text');
      expect(manager.canAddBlockType('Text')).toBe(false);
    });

  });

});
