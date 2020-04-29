import { makeAddListener, error, isFunction } from "./utils";

interface IComponentProps<T> {
  root: Element | string;
  elements?: Record<string, string>;
  events?: Record<string, string>;
  setup: ({ elements }: { elements: IElementsMap }) => T;
}

interface IElementsMap {
  [key: string]: Element;
}

let destroyHooks: Set<Function> | null;
const eventRegex = /(\w+)\s+on\s+(\w+)/;

export const onBeforeDestroy = (callback: Function) => {
  (destroyHooks || (destroyHooks = new Set())).add(callback);
};

export const component = <T extends Record<string, any>>({
  root,
  elements: elementsSelectors = {},
  events = {},
  setup
}: IComponentProps<T>) => {
  const [addListener, removeAllListeners] = makeAddListener();

  const rootElement =
    typeof root === "string" ? document.querySelector(root) : root;

  if (!rootElement) {
    error("can not find root element");
  }

  let state: T;
  let elements: IElementsMap;

  const init = () => {
    elements = getElements();
    state = setup({ elements });
    attachEvents();
  };

  const getElements = () => {
    return Object.entries(elementsSelectors).reduce(
      (acc, [name, selector]) => {
        const element = document.querySelector(selector);
        if (element) {
          acc[name] = element;
        }
        return acc;
      },
      { rootElement } as IElementsMap
    );
  };

  const attachEvents = () => {
    Object.entries(events).forEach(([key, value]) => {
      const eventHandlerMatch = key.match(eventRegex);
      if (eventHandlerMatch) {
        const [, event, element] = eventHandlerMatch;

        if (!elements[element]) {
          error(
            `can not set ${event} event on ${element}. ${element} is undefined`
          );
        }

        const listener = state[value];

        if (!listener || !isFunction(listener)) {
          error(`value is not a valid listener.`);
        }
        addListener(elements[element], event, listener);
      }
    });
  };

  const destroy = () => {
    destroyHooks?.forEach(cb => cb());
    removeAllListeners();
  };

  init();

  return {
    init,
    destroy
  };
};
