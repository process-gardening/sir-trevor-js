import { GConstructor } from "../helpers/contructor";

function once(func) {
    let memo, times = 2;

    return function () {
        if (--times > 0) {
            memo = func.apply(this, arguments);
        } else {
            func = null;
        }
        return memo;
    };
}

// Backbone.Events
// ---------------

// A module that can be mixed in to *any object* in order to provide it with
// custom events. You may bind with `on` or remove with `off` callback
// functions to an event; `trigger`-ing an event fires all callbacks in
// succession.
//
//     const object = {};
//     extend(object, Backbone.Events);
//     object.on('expand', function(){ alert('expanded'); });
//     object.trigger('expand');
//

export interface EventableInterface {
}

type EventableConstructor = GConstructor<EventableInterface>;

export function Eventable<TBase extends EventableConstructor>(Base: TBase) {

    return class EventableClass extends Base {

        _events: any;
        _listeners: any;
        eventSplitter = /\s+/;


        constructor(...args: any[]) {
            super(...args);
        }

        // Bind an event to a `callback` function. Passing `"all"` will bind
        // the callback to all events fired.
        on(name: string, callback: () => {}, context) {
            if (!this.eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
            this._events || (this._events = {});
            const events = this._events[name] || (this._events[name] = []);
            events.push({ callback: callback, context: context, ctx: context || this });
            return this;
        }

        // Bind an event to only be triggered a single time. After the first time
        // the callback is invoked, it will be removed.
        once(name, callback, context) {
            if (!this.eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
            const self = this;
            const func = once(function () {
                self.off(name, func);
                callback.apply(this, arguments);
            });
            func._callback = callback;
            return this.on(name, func, context);
        }

        // Remove one or many callbacks. If `context` is null, removes all
        // callbacks with that function. If `callback` is null, removes all
        // callbacks for the event. If `name` is null, removes all bound
        // callbacks for all events.
        off(name, callback, context = undefined) {
            let retain, ev, events, names, i, l, j, k;
            if (!this._events || !this.eventsApi(this, 'off', name, [callback, context])) return this;
            if (!name && !callback && !context) {
                this._events = {};
                return this;
            }

            names = name ? [name] : Object.keys(this._events);
            for (i = 0, l = names.length; i < l; i++) {
                name = names[i];
                if (events = this._events[name]) {
                    this._events[name] = retain = [];
                    if (callback || context) {
                        for (j = 0, k = events.length; j < k; j++) {
                            ev = events[j];
                            if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                                (context && context !== ev.context)) {
                                retain.push(ev);
                            }
                        }
                    }
                    if (!retain.length) delete this._events[name];
                }
            }

            return this;
        }

        // Trigger one or many events, firing all bound callbacks. Callbacks are
        // passed the same arguments as `trigger` is, apart from the event name
        // (unless you're listening on `"all"`, which will cause your callback to
        // receive the true name of the event as the first argument).
        trigger(name: string, ...restArgs: any[]) {
            if (!this._events) return this;
            const args = Array.prototype.slice.call(arguments, 1);
            if (!this.eventsApi(this, 'trigger', name, args)) return this;
            const events = this._events[name];
            const allEvents = this._events.all;
            if (events) this.triggerEvents(events, args);
            if (allEvents) this.triggerEvents(allEvents, arguments);
            return this;
        }

        // Tell this object to stop listening to either specific events ... or
        // to every object it's currently listening to.
        stopListening(obj, name, callback) {
            let listeners = this._listeners;
            if (!listeners) return this;
            const deleteListener = !name && !callback;
            if (typeof name === 'object') callback = this;
            if (obj) (listeners = {})[obj._listenerId] = obj;
            for (const id in listeners) {
                listeners[id].off(name, callback, this);
                if (deleteListener) delete this._listeners[id];
            }
            return this;
        }

        // Implement fancy features of the Events API such as multiple event
        // names `"change blur"` and jQuery-style event maps `{change: action}`
        // in terms of the existing API.
        eventsApi(obj: EventableInterface, action: string, name: any, rest) {
            if (!name) return true;

            // Handle event maps.
            if (typeof name === 'object') {
                for (const key in name) {
                    obj[action].apply(obj, [key, name[key]].concat(rest));
                }
                return false;
            }

            // Handle space separated event names.
            if (this.eventSplitter.test(name)) {
                const names = name.split(this.eventSplitter);
                for (let i = 0, l = names.length; i < l; i++) {
                    obj[action].apply(obj, [names[i]].concat(rest));
                }
                return false;
            }

            return true;
        }

        // A difficult-to-believe, but optimized internal dispatch function for
        // triggering events. Tries to keep the usual cases speedy (most internal
        // Backbone events have 3 arguments).
        triggerEvents(events, args) {
            let ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
            switch (args.length) {
                case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
                case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
                case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
                case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
                default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
            }
        }

    }

}

// Inversion-of-control versions of `on` and `once`. Tell *this* object to
// listen to an event in another object ... keeping track of what it's
// listening to.
function addListenMethod(method: string, implementation: string) {
    Eventable[method] = function (obj, name, callback) {
        let listeners = this._listeners || (this._listeners = {});
        const id = obj._listenerId || (obj._listenerId = (new Date()).getTime());
        listeners[id] = obj;
        if (typeof name === 'object') callback = this;
        obj[implementation](name, callback, this);
        return this;
    };
}

addListenMethod('listenTo', 'on');
addListenMethod('listenToOnce', 'once');

//export type EventableClassType<T> = InstanceType<ReturnType<typeof Eventable>> & T;
export type MediatorInstanceType = InstanceType<ReturnType<typeof Eventable>>;