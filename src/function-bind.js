"use strict";

/* Generic function binding utility, used by lots of our classes */

export default {
  bound: [],
  _bindFunctions: function(){
    this.bound.forEach(function(f) {
      this[f] = this[f].bind(this);
    }, this);
  }
};
