// as per https://www.typescriptlang.org/docs/handbook/mixins.html

export type Constructor = new (...args: any[]) => {};

export type GConstructor<T = {}> = new (...args: any[]) => T;