"use strict";

describe("toMarkdown", function(){

  it("converts links to markdown", function(){
    const html = "<a href='http://google.com'>test</a>",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("[test](http://google.com)");
  });

  it("converts links with bolds inside to markdown", function(){
    const html = "<a href='http://google.com'><strong>test</strong></a>",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("[**test**](http://google.com)");
  });

  it("converts links with square brackets correctly", function(){
    const html = "[<a href='http://google.com'>1</a>]",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("\\[[1](http://google.com)\\]");
  });

  it("converts bold to markdown", function(){
    const html = "<strong>testing</strong>",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("**testing**");
  });

  it("converts bold tags without closing tags to markdown", function(){
    const html = "<strong>testing</strong><strong>",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("**testing**");
  });

  it("converts italic to markdown", function(){
    const html = "<em>testing</em>",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("_testing_");
  });

  it("converts paragraphs to newlines", function(){
    const html = "<p>testing</p>",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("testing\n\n");
  });

  it("converts br's to newlines", function(){
    const html = "testing<br>",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("testing\n");
  });

  it("removes comments", function(){
    const html = "<!--Yo!-->/* This is a comment */",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("");
  });

  it("removes styles", function(){
    const html = "<style>html { text-align: left; }</style>",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("");
  });

  it("removes scripts", function(){
    const html = "<script>alert('YO!');</script>",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("");
  });

  it("cleans up br's inside of bolds", function(){
    const html = "<b><br></b>",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("\n");
  });

  it("cleans up br's inside of italics", function(){
    const html = "<i><br></i>",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("\n");
  });

  it("removes font tags, but leaves content", function(){
    const html = "<font>Yolo</font>",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("Yolo");
  });

  it("converts a complex piece of text correctly", function(){
    const html = "<p><a href=\"#\">Hello</a> this is my <strong>amazing <em>piece</em></strong> <em>I think</em> that <strong>it should</strong> be able to be convereted correctly.</p>",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("[Hello](#) this is my **amazing _piece_** _I think_ that **it should** be able to be convereted correctly.\n\n");
  });

  it("correctly encodes * characters", function(){
    const html = "test*",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("test\\*");
  });

  it("correctly encodes _ characters", function(){
    const html = "test_",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("test\\_");
  });

  it("correctly encodes - characters", function(){
    const html = "test-something",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("test\\-something");
  });

  it("strips whitepace from bolds", function(){
    const html = "<b> Test</b>",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("**Test**");
  });

  it("strips whitepace from italics", function(){
    const html = "<i> Test</i>",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("_Test_");
  });

  it("strips whitepace from links", function(){
    const html = "<a href='test'> test</a>",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("[test](test)");
  });

  it("removes newlines from bolds", function(){
    const html = "<b>test<br><br></b>",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("**test**");
  });

  it("removes newlines from italics", function(){
    const html = "<i>test<br><br></i>",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("_test_");
  });

  it("removes newlines from links", function(){
    const html = "<a href='test'>test<br></a>",
      markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("[test](test)");
  });

});
