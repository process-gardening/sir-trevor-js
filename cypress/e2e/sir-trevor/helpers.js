"use strict";

const APP_URL = 'http://localhost:8000/spec/app/index.html';

export function findElementByCss(css, parent) {
    console.log(parent)
    return (cy.get(parent) || cy.window()).find(css).first()
};

export function findElementsByCss(css, parent) {
    return (cy.get(parent) || cy.window()).find(css)
};

export function findBlocks() {
    return cy.get('.st-block');
};

export function hasClassName(element, className) {
    return element.getAttribute('class').then( function(classes) {
        return classes.split(' ').indexOf(className) > -1;
    });
};

export function pressBackSpace() {
    cy.window().type("{backspace}")
};

export function pressShift() {
    cy.window().type("{shift}")
};
export async function pressEnter() {
    cy.window().type("{enter}")
};
export function pressShiftEnter() {
    cy.window().type("{shift}{enter}")
};
export function pressLeft() {
    cy.window().type("{leftArrow}")
};
export function pressRight() {
    cy.window().type("{rightArrow}")
};
export function pressDown() {
    cy.window().type("{downArrow}")
};
export function pressCtrlA() {
    cy.window().type("{ctrl}a")
};
export function pressCtrlC() {
    cy.window().type("{ctrl}c")
};
export function pressCtrlV() {
    cy.window().type("{ctrl}v")
};

export function enterText(text) {
    cy.window().type(text)
};

export function initSirTrevor(data) {
    return cy.visit("/").then(win => win.initSirTrevor());
}

export function createBlock(blockType, cb) {

    function createBlock(parent) {
        findElementByCss('.st-block-replacer', parent).click().then( function() {
            return findElementByCss('.st-block-controls__button[data-type="'+blockType+'"]', parent).click();
        }).then( function() {
            return findElementByCss('.st-block[data-type="'+blockType+'"]');
        }).then(cb);
    }

    findBlocks().then( function(blocks) {
        if (blocks.length > 0) {
            const element = blocks[blocks.length-1];

            const classes = element.getAttribute("class").split(" ");
            const dataType = element.getAttribute("data-type");

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
        } else {
            findElementByCss('.st-top-controls > .st-block-addition').click()
                .then(findBlocks)
                .then(function(elements) {
                    createBlock(elements[0]);
                });
        }
    });
};

export function focusOnTextBlock(index) {
    return findElementsByCss('.st-text-block').then(function(elements) {
        elements.focus()
    });
};

export function focusOnListBlock(index) {
    index = index || 0;
    return exports.findElementsByCss('.st-list-block__list').then(function(elements) {
        return exports.findElementsByCss('.st-list-block__editor', elements[index]);
    }).then(function(elements) {
        return exports.browser.actions()
            .mouseMove(elements[0], {x: 5, y: 10})
            .click()
            .perform();
    });
};

export function catchError(err) { return false; };

export function completeAlertPopup(text) {
    return exports.browser.wait(driver.until.alertIsPresent()).then( function() {
        var alert = exports.browser.switchTo().alert();
        alert.sendKeys(text);
        return alert.accept();
    });
};