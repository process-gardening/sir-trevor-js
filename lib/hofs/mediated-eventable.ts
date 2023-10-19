import { Constructor, GConstructor } from "../helpers/contructor";
import mediated_events from "../mediated-events";

export interface MediatedEventableInterface {
    mediator: any;
    eventNamespace: string;
    mediatedEvents: {};
}

type MediatedEventableConstructor = GConstructor<MediatedEventableInterface>;

export function MediatedEventable<TBase extends MediatedEventableConstructor>(Base: TBase) {
    return class MediatedEventsClass extends Base {
        // Mixins may not declare private/protected properties
        // however, you can use ES2020 private fields

        constructor(...args: any[]) {
            super(...args);
            this._bindMediatedEvents();
        }

        _bindMediatedEvents() {
            Object.keys(this.mediatedEvents).forEach(function (eventName) {
                const cb = this.mediatedEvents[eventName];
                eventName = this.eventNamespace ?
                    this.eventNamespace + ':' + eventName :
                    eventName;
                this.mediator.on(eventName, this[cb].bind(this));
            }, this);
        }
    };
}