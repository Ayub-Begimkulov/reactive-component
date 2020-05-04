export type Reaction = {
  (): any;
  __isReaction: boolean;
  isRunning: boolean;
  deps: Set<Reaction>[];
};

export const runningReactions: Reaction[] = [];

export const observe = (fn: Function) => {
  const reaction = isReaction(fn) ? fn : makeReaction(fn);

  reaction.__isReaction = true;

  reaction();

  return reaction;
};

const makeReaction = (fn: Function) => {
  const reaction = (() => {
    // using isRunning instead of runningReactions.include
    // for a O(1) look up
    if (!reaction.isRunning) {
      cleanUpDeps(reaction);
      reaction.isRunning = true;
      runningReactions.push(reaction);
      fn();
      runningReactions.pop();
      reaction.isRunning = false;
    }
  }) as Reaction;

  return reaction;
};

const cleanUpDeps = (reaction: Reaction) => {
  const { deps } = reaction;
  deps && deps.forEach(dep => dep.delete(reaction));
  reaction.deps = [];
};

const isReaction = (fn: any): fn is Reaction => {
  return fn && fn.__isReaction;
};
