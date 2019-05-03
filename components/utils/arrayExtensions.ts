export {} // this file needs to be a module

declare global {
  interface Array<T> {
    unique(): T[]
    selectMany<TInner>(propertyToSelect: (a: T) => TInner[]): TInner[]
    without(itemToRemove: T): T[]
  }
}

Array.prototype.unique = function() {
  return this.filter((v, i, a) => a.indexOf(v) === i)
}

Array.prototype.selectMany = function<T, TInner>(propertyToSelect: (a: T) => TInner[]): TInner[] {
  return (this as T[]).map(propertyToSelect).reduce((a, b) => a.concat(b))
}

Array.prototype.without = function<T>(itemToRemove: T) {
  return this.filter(x => x !== itemToRemove)
}
