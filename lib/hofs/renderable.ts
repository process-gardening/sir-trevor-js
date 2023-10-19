import _ from "lodash";
import Dom from "../packages/dom";
import { Constructor, GConstructor } from "../helpers/contructor";

export interface RenderableInterface {
    el: any;
    stopListening?: () => void;
    id: any;
    block: any;
    commands: any;

    tagName?: string;
    className?: string;
    attributes?: { [key: string]: any };
}

type RenderableConstructor = GConstructor<RenderableInterface>;

export function Renderable<TBase extends RenderableConstructor>(Base: TBase) {
  return class RenderableClass extends Base {

    // constructor
    constructor(...args: any[]) {
      super(...args);
      this.tagName = this.tagName ?? 'div';
      this.className = this.className ?? 'sir-trevor__view';
      this.attributes = this.attributes ?? {};
      this._ensureElement();
    }    


    $ = (selector: string) => {
      return this.el.querySelectorAll(selector);
    };

    render = () => {
      return this;
    };

    destroy = () => {
      if (!_.isUndefined(this.stopListening)) {
        this.stopListening();
      }
      Dom.remove(this.el);
    };

    _ensureElement = () => {
      if (!this.el) {
        const attrs = Object.assign({}, _.result(this, 'attributes'));
        if (this.id) {
          attrs.id = this.id;
        }
        if (this.className) {
          attrs['class'] = this.className;
        }

        const el = Dom.createElement(this.tagName, attrs);
        this._setElement(el);
      } else {
        this._setElement(this.el);
      }
    };

    _setElement = (element: HTMLElement) => {
      this.el = element;
      return this;
    };
  };
}
function FORMAT_BUTTON_TEMPLATE(format: any) {
  throw new Error("Function not implemented.");
}

