type Cleanup = () => void;
type AddListener = (
  el: Element,
  event: string,
  listener: EventListenerOrEventListenerObject
) => Cleanup;

export const makeAddListener = () => {
  const cleanups = new Set<Cleanup>();

  const addListener: AddListener = (el, event, listener) => {
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

  return [addListener, removeAllListeners] as [AddListener, Cleanup];
};

export const error = (message: string) => {
  if (process.env.NODE_ENV === "production") {
    console.error(message);
  } else {
    throw new Error(message);
  }
};
