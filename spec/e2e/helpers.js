"use strict";

import driver from "selenium-webdriver";


let browser =  {}


const APP_URL = 'http://localhost:8000/spec/app/index.html';
const USE_SAUCELABS = true;

function findElementByCss(css, parent) {
  return (parent || browser).findElement(driver.By.css(css));
}

function findElementsByCss(css, parent) {
  return (parent || browser).findElements(driver.By.css(css));
}

function findBlocks() {
  return findElementsByCss('.st-block');
}

function hasClassName(element, className) {
  return element.getAttribute('class').then( function(classes) {
    return classes.split(' ').indexOf(className) > -1;
  });
}

function pressBackSpace() {
  return browser.actions()
    .sendKeys(driver.Key.BACK_SPACE)
    .perform();
}

function pressShift() {
  return browser.actions()
    .sendKeys(driver.Key.SHIFT)
    .perform();
}

function pressEnter() {
  return browser.actions()
    .sendKeys(driver.Key.ENTER)
    .perform();
}

function pressShiftEnter() {
  return browser.actions()
    .sendKeys(driver.Key.SHIFT)
    .sendKeys(driver.Key.ENTER)
    .perform();
}

function pressLeft() {
  return browser.actions()
    .sendKeys(driver.Key.ARROW_LEFT)
    .perform();
}

function pressRight() {
  return browser.actions()
    .sendKeys(driver.Key.ARROW_RIGHT)
    .perform();
}

function pressDown() {
  return browser.actions()
    .sendKeys(driver.Key.ARROW_DOWN)
    .perform();
}

function pressCtrlA() {
  return browser.actions()
    .keyDown(driver.Key.CONTROL)
    .sendKeys("a")
    .keyUp(driver.Key.CONTROL)
    .perform();
};

function pressCtrlC() {
  return browser.actions()
    .keyDown(driver.Key.CONTROL)
    .sendKeys("c")
    .keyUp(driver.Key.CONTROL)
    .perform();
}

function pressCtrlV() {
  return browser.actions()
    .keyDown(driver.Key.CONTROL)
    .sendKeys("v")
    .keyUp(driver.Key.CONTROL)
    .perform();
}

function enterText(text) {
  return browser.actions()
                .sendKeys(text)
                .perform();
}

function createBlock(blockType, cb) {

  function createBlock(parent) {
    findElementByCss('.st-block-replacer', parent).click().then( function() {
      return findElementByCss('.st-block-controls__button[data-type="'+blockType+'"]', parent).click();
    }).then( function() {
      return findElementByCss('.st-block[data-type="'+blockType+'"]');
    }).then(cb);
  }

  findBlocks().then( function(blocks) {
    if (blocks.length > 0) {
      const element = blocks[blocks.length - 1];
      let classes, type;
      element.getAttribute('class').then( function(className) {
        classes = className.split(' ');
        return element.getAttribute('data-type');
      }).then( function(res) {
        type = res;
        if (classes.indexOf('st-block--textable') > -1) {
          if (blockType === 'text') {
            return pressEnter().then(cb);
          } else {
            return createBlock(element);
          }
        } else if (type === 'list') {
          return pressEnter()
            .then(findBlocks)
            .then( function(blocks2) {
              return createBlock(blocks2[blocks2.length-1]);
            });
        } else if (classes.indexOf('st-block--droppable') > -1) {
          return findElementByCss('.st-block__inner--droppable', element).click()
            .then(pressEnter)
            .then(findBlocks)
            .then(function(blocks2) {
              return createBlock(blocks2[blocks2.length-1]);
            });
        }
      });
    } else {
      findElementByCss('.st-top-controls > .st-block-addition').click()
        .then(findBlocks)
        .then(function(elements) {
          createBlock(elements[0]);
        });
    }
  });
}

function hasBlockCount(count) {
  return findBlocks().then( function(blocks) {
    expect(blocks.length === count);
  });
}

function focusOnTextBlock(index) {
  index = index || 0;
  return findElementsByCss('.st-text-block').then(function(elements) {
    return browser.actions()
              .mouseMove(elements[index], {x: 5, y: 10})
              .click()
              .perform();
  });
}

function focusOnListBlock(index) {
  index = index || 0;
  return findElementsByCss('.st-list-block__list').then(function(elements) {
    return findElementsByCss('.st-list-block__editor', elements[index]);
  }).then(function(elements) {
    return browser.actions()
              .mouseMove(elements[0], {x: 5, y: 10})
              .click()
              .perform();
  });
}

function initSirTrevor(data) {
  const javascriptString = [];

  if (data) {
    data = JSON.stringify(data).replace("'", "\\'");

    javascriptString.push(
      /*jshint multistr: true */
      "var textarea = document.querySelector('.sir-trevor'); \
       textarea.value = '" + data + "';"
    );
  }

  javascriptString.push(
    /*jshint multistr: true */
    "window.editor = new SirTrevor.Editor({ \
      el: document.querySelector('.sir-trevor'), \
      blockTypes: ['Heading', 'Text', 'List', 'Quote', 'Image', 'Video', 'Tweet'], \
      defaultType: 'Text' \
    });"
  );

  return browser.executeScript(javascriptString.join("")).then( function() {
    return findElementByCss('.st-outer');
  });
}

function catchError(err) { return false; }

function completeAlertPopup(text) {
  return browser.wait(driver.until.alertIsPresent()).then( function() {
    const alert = browser.switchTo().alert();
    alert.sendKeys(text);
    return alert.accept();
  });
}

beforeAll(function() {

  let serverUrl = null;

  const capabilities = {
    browserName: 'chrome'
  };

  if (process.env.TRAVIS) {

    capabilities.browserName = 'firefox';

    if (USE_SAUCELABS) {

      Object.assign(capabilities, {
        browserName: process.env.BROWSER_NAME,
        version: process.env.BROWSER_VERSION,
        platform: process.env.PLATFORM
      });

      serverUrl = 'http://ondemand.saucelabs.com:80/wd/hub';

      Object.assign(capabilities, {
        build: process.env.TRAVIS_BUILD_NUMBER,
        tags: [process.env.TRAVIS_NODE_VERSION, 'CI'],
      });

      Object.assign(capabilities, {
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      });
    }
  }

  browser = new driver.Builder().usingServer(serverUrl).withCapabilities(capabilities).build();
  browser.manage().timeouts().setScriptTimeout(20000);
});

beforeEach(function(done) {
  browser.get(APP_URL).then(done);
});

afterAll(function(done) {
  browser.quit().then(done);
});

export default {
  findElementsByCss,
  findElementByCss,
  findBlocks,
  hasClassName,
  pressBackSpace,
  pressShift,
  pressEnter,
  pressShiftEnter,
  pressLeft,
  pressRight,
  pressCtrlA,
  pressCtrlV,
  pressCtrlC,
  enterText,
  createBlock,
  hasBlockCount,
  focusOnListBlock,
  focusOnTextBlock,
  initSirTrevor,
  catchError,
  completeAlertPopup,
  browser: browser
}
