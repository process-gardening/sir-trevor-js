import Immutable from 'immutable';

class EventEmitter {
  _listeners;

  constructor() {
    this._listeners = {};
  }

  on(eventName, fn) {
    const listeners = this._listeners[eventName] || Immutable.Set();
    this._listeners[eventName] = listeners.add(fn);
  }

  off(eventName, fn) {
    const listeners = this._listeners[eventName] || Immutable.Set();
    if (fn) {
      this._listeners[eventName] = listeners.delete(fn);
    } else {
      this._listeners[eventName] = listeners.clear();
    }
  }

  trigger(eventName, args?: any) {
    //fire events like my:custom:event -> my:custom -> my
    const events = eventName.split(':');
    while(!!events.length){
      const currentEvent = events.join(':');
      const listeners = this._listeners[currentEvent] || Immutable.Set();
      //trigger handles
      listeners.forEach(function (listener) {
        listener.apply(null, args);
      });
      events.splice((events.length - 1), 1);
    }
  }
}

export default EventEmitter;