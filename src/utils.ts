type Cleanup = () => void;
export type AddListenerFunction = (
  el: Element,
  event: string,
  listener: EventListenerOrEventListenerObject
) => () => void;

export type RemoveAllListenersFunction = () => void;

export const makeAddListener = () => {
  const cleanups = new Set<Cleanup>();

  const addListener = (
    el: Element,
    event: string,
    listener: EventListenerOrEventListenerObject
  ) => {
    el.addEventListener(event, listener);

    const cleanup = () => {
      el.removeEventListener(event, listener);
      cleanups.delete(cleanup);
    };

    cleanups.add(cleanup);
    return cleanup;
  };

  const removeAllListeners = () => {
    cleanups.forEach(fn => fn());
  };

  return [addListener, removeAllListeners] as [
    AddListenerFunction,
    RemoveAllListenersFunction
  ];
};

export const isObject = (val: any): val is object => {
  return val !== null && typeof val === "object";
};

export const isFunction = (val: any): val is Function => {
  return typeof val === "function";
};

export const hasChanged = (value: any, oldValue: any): boolean =>
  value !== oldValue && (value === value || oldValue === oldValue);

export const replaceNode = (oldNode: Node, newNode: Node) => {
  const parent = oldNode.parentNode;

  if (parent) {
    parent.insertBefore(newNode, oldNode);
    parent.removeChild(oldNode);
  }
};

export const error = (message: string) => {
  if (process.env.NODE_ENV === "production") {
    console.error(message);
  } else {
    throw new Error(message);
  }
};
