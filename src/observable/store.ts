import { AnyObject } from "../types";
import { Reaction, runningReactions } from "./observer";
import { makeSet } from "../utils";

type ReactionsMap = Map<string, Set<Reaction>>;

const reactionsStore = new WeakMap<AnyObject, ReactionsMap>();

export const storeObservable = (obj: AnyObject) => {
  reactionsStore.set(obj, new Map());
};

export const addReaction = (obj: AnyObject, key: string) => {
  const currentReaction = runningReactions[runningReactions.length - 1];
  if (!currentReaction) {
    return;
  }
  const reactionsForObj = reactionsStore.get(obj);
  if (!reactionsForObj) {
    return;
  }
  let reactionsForKey = reactionsForObj.get(key);
  if (!reactionsForKey) {
    reactionsForKey = new Set();
    reactionsForObj.set(key, reactionsForKey);
  }
  if (!reactionsForKey.has(currentReaction)) {
    reactionsForKey.add(currentReaction);
    currentReaction.deps.push(reactionsForKey);
  }
};

export const runReactions = (obj: AnyObject, key: string) => {
  const reactionsForObj = reactionsStore.get(obj);
  const reactionsForKey = reactionsForObj && reactionsForObj.get(key);
  if (!reactionsForKey) {
    return;
  }
  // make a copy of reactions to not end up in an infinite loop
  const reactionsToRun = makeSet(reactionsForKey);
  reactionsToRun.forEach(reaction => {
    if (reaction.options.scheduler) {
      reaction.options.scheduler(reaction);
    } else {
      reaction();
    }
  });
};
