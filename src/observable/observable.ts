import { runningReactions } from "./observer";
import { isObject, hasChanged } from "../utils";

type AnyObject = Record<string, any>;

const rawToProxy = new WeakMap();
const proxyToRaw = new WeakMap();

export const observable = <T extends AnyObject = AnyObject>(raw: T) => {
  if (proxyToRaw.has(raw)) return raw;
  return (rawToProxy.get(raw) as T) || createObservable(raw);
};

const createObservable = <T extends AnyObject>(target: T) => {
  const observable = Object.entries(target).reduce((result, [key, value]) => {
    return addPropertyToObservable(result, key, value);
  }, {} as T);

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
  const reactions = new Set<Function>();

  Object.defineProperty(target, key, {
    get() {
      const currentlyRunningReaction =
        runningReactions[runningReactions.length - 1];

      if (
        currentlyRunningReaction &&
        !reactions.has(currentlyRunningReaction)
      ) {
        reactions.add(currentlyRunningReaction);
      }

      return isObject(currentValue) ? observable(currentValue) : currentValue;
    },
    set(newValue) {
      if (hasChanged(currentValue, newValue)) {
        currentValue = newValue;
        reactions.forEach(reaction => reaction());
      }
    }
  });

  return target;
};
