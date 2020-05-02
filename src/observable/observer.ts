export const runningReactions: Function[] = [];

type Reaction = {
  (): any;
  isRunning: boolean;
  isReaction: boolean;
};

export const observe = (fn: Function) => {
  const reaction = isReaction(fn)
    ? fn
    : ((() => {
        if (!reaction.isRunning) {
          reaction.isRunning = true;
          runningReactions.push(reaction);
          fn();
          runningReactions.pop();
          reaction.isRunning = false;
        }
      }) as Reaction);

  if (reaction.isRunning) return reaction;

  reaction.isRunning = false;
  reaction.isReaction = true;

  reaction();

  return reaction;
};

const isReaction = (fn: any): fn is Reaction => {
  return fn && fn.isReaction;
};
