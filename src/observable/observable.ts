import { isObject, hasChanged } from "../utils";
import { AnyObject } from "../types";
import { addReaction, runReactions, storeObservable } from "./store";

const rawToProxy = new WeakMap<AnyObject, AnyObject>();
const proxyToRaw = new WeakMap<AnyObject, AnyObject>();

export const observable = <T extends AnyObject = AnyObject>(raw: T) => {
  if (proxyToRaw.has(raw)) return raw;
  return (rawToProxy.get(raw) as T) || createObservable(raw);
};

const createObservable = <T extends AnyObject>(target: T) => {
  const observable = Object.entries(target).reduce((result, [key, value]) => {
    return addPropertyToObservable(result, key, value);
  }, {} as T);

  storeObservable(observable);

  rawToProxy.set(target, observable);
  proxyToRaw.set(observable, target);

  return observable;
};

const addPropertyToObservable = <T extends AnyObject, K>(
  target: T,
  key: string,
  value: K
) => {
  let currentValue = value;
  Object.defineProperty(target, key, {
    get() {
      addReaction(target, key);
      return isObject(currentValue) ? observable(currentValue) : currentValue;
    },
    set(newValue) {
      if (hasChanged(currentValue, newValue)) {
        currentValue = newValue;
        runReactions(target, key);
      }
    },
  });

  return target;
};
