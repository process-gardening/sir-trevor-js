"use strict";
import SirTrevor from "../../../../src";
describe("BlockManager::Removing blocks", function(){

  let manager;

  beforeEach(function(){
    const element = global.createBaseElement();
    const editor = new SirTrevor.Editor({
      el: element,
      blockTypes: ["Text"]
    });
    manager = editor.blockManager;
    manager.createBlock('Text');
  });

  it("removes the block from the blocks array", function(){
    manager.removeBlock(manager.blocks[0].blockID);
    expect(manager.blocks.length).toBe(0);
  });

  it("decrements the block type count", function(){
    manager.removeBlock(manager.blocks[0].blockID);
    expect(manager.blockCounts.Text).toBe(0);
  });

});
