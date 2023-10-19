import { Constructor, GConstructor } from "../helpers/contructor";

export interface InitializeableInterface {
    initialize(): void;
}

type InitializeableConstructor = GConstructor<InitializeableInterface>;

export function Initializeable<TBase extends InitializeableConstructor>(Base: TBase) {
    const result = class InitializeableClass extends Base {

        constructor(...args: any[]) {
            super(...args);
            this.initialize();
        }

    }

    return result;
}


