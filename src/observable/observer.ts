export interface Reaction {
  (): any;
  __isReaction: boolean;
  isRunning: boolean;
  options: ReactionOptions;
  deps: Set<Reaction>[];
}

interface ReactionOptions {
  lazy?: boolean;
  scheduler?: (fn: Reaction) => any;
}

export const runningReactions: Reaction[] = [];

export const observe = (fn: Function, options: ReactionOptions = {}) => {
  const reaction = isReaction(fn) ? fn : makeReaction(fn);

  reaction.__isReaction = true;
  reaction.options = options;

  if (!options.lazy) {
    reaction();
  }

  return reaction;
};

const makeReaction = (fn: Function) => {
  const reaction = (() => {
    // using isRunning instead of runningReactions.include
    // for a O(1) look up
    if (!reaction.isRunning) {
      try {
        cleanUpDeps(reaction);
        reaction.isRunning = true;
        runningReactions.push(reaction);
        return fn();
      } finally {
        runningReactions.pop();
        reaction.isRunning = false;
      }
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
