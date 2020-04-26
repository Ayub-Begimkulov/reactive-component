export const runningReactions: Function[] = [];

export const observe = (reaction: Function) => {
  runningReactions.push(reaction);
  reaction();
  runningReactions.pop();
};
