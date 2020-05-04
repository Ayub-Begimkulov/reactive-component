import { AnyObject } from "./types";
import { Reaction } from "./observer";

type ReactionsMap = Map<string, Set<Reaction>>;

const reactionsStore = new WeakMap<AnyObject, ReactionsMap>();

export const storeObservable = (obj: AnyObject) => {
  reactionsStore.set(obj, new Map());
};

export const addReaction = (
  obj: AnyObject,
  key: string,
  reaction: Reaction
) => {
  const reactionsForObj = reactionsStore.get(obj);
  if (!reactionsForObj) {
    return;
  }
  let reactionsForKey = reactionsForObj.get(key);
  if (!reactionsForKey) {
    reactionsForKey = new Set();
    reactionsForObj.set(key, reactionsForKey);
  }
  if (!reactionsForKey.has(reaction)) {
    reactionsForKey.add(reaction);
    reaction.deps.push(reactionsForKey);
  }
};

export const runReactions = (obj: AnyObject, key: string) => {
  const reactionsForObj = reactionsStore.get(obj);
  const reactionsForKey = reactionsForObj && reactionsForObj.get(key);
  if (!reactionsForKey) {
    return;
  }

  // make a copy of reactions to not end up in an infinite loop
  const reactionsToRun = new Set<Reaction>();
  reactionsForKey.forEach(reactionsToRun.add, reactionsToRun);
  reactionsToRun.forEach(reaction => reaction());
};
