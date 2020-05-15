import { runningReactions, Reaction } from "./observer";
import { isObject, hasChanged } from "../utils";
import { AnyObject } from "../types";

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
  const reactions = new Set<Reaction>();
  Object.defineProperty(target, key, {
    get() {
      const currentlyRunningReaction =
        runningReactions[runningReactions.length - 1];

      if (
        currentlyRunningReaction &&
        !reactions.has(currentlyRunningReaction)
      ) {
        reactions.add(currentlyRunningReaction);
        currentlyRunningReaction.deps.push(reactions);
      }

      return isObject(currentValue) ? observable(currentValue) : currentValue;
    },
    set(newValue) {
      if (hasChanged(currentValue, newValue)) {
        currentValue = newValue;
        // make a copy of reactions to not end up in an infinite loop
        const reactionsToRun = new Set<Reaction>();
        reactions.forEach(reactionsToRun.add, reactionsToRun);
        reactionsToRun.forEach(reaction => {
          if (reaction.options.scheduler) {
            reaction.options.scheduler(reaction);
          } else {
            reaction();
          }
        });
      }
    }
  });

  return target;
};
