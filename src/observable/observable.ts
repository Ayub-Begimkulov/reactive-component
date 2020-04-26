import { runningReactions } from "./observer";

type AnyObject = Record<string, any>;

const rawToProxy = new WeakMap();
const proxyToRaw = new WeakMap();

export const observable = <T extends AnyObject = AnyObject>(target: T) => {
  if (proxyToRaw.has(target)) return target;
  return (proxyToRaw.get(target) as T) || createObservable(target);
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
  observable: T,
  prop: string,
  value: K
) => {
  const reactions = new Set<Function>();
  let currentValue = value;

  Object.defineProperty(observable, prop, {
    get() {
      const currentlyRunningReaction =
        runningReactions[runningReactions.length - 1];
      currentlyRunningReaction && reactions.add(currentlyRunningReaction);
      return currentValue;
    },
    set(newValue) {
      currentValue = newValue;
      reactions.forEach(reaction => reaction());
    }
  });

  return observable;
};
