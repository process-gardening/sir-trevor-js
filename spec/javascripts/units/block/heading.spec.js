"use strict";

import SirTrevor from "../../../../src";

describe("Blocks: Heading block", function() {
  let block;

  const getSerializedData = function (data) {
    const element = global.createBaseElement();
    const editor = new SirTrevor.Editor({el: element});
    const options = editor.blockManager.blockOptions;
    block = new SirTrevor.Blocks.Heading(
      data,
      editor.id,
      editor.mediator,
      options,
      editor.options
    );
    block.render();
    return block.getBlockData();
  };

  it("doesn't allow block level elements", function() {
    getSerializedData({ text: "Test Heading" });
    expect(block._scribe.options.allowBlockElements).toBe(false);
  });

  it("doesn't wrap content in <p> tags", function() {
    const data = getSerializedData({text: "Test Heading"});
    expect(data.text).not.toContain("<p>");
  });

  it("doesn't save <br> at the end of the text", function() {
    const data = getSerializedData({text: "Test Heading"});
    expect(data.text).toEqual("Test Heading");
  });

  it("converts markdown inline styling to html", function() {
    const data = getSerializedData({text: "**Test** _Heading_"});
    expect(data.text).toEqual("<b>Test</b> <i>Heading</i>");
  });

  it("doesn't strip HTML style tags", function() {
    const blockData = {text: "<b>Test</b> <i>Heading</i>", format: "html"};
    const data = getSerializedData(blockData);
    expect(data.text).toEqual("<b>Test</b> <i>Heading</i>");
  });
});
