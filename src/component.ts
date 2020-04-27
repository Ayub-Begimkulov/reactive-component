import { makeAddListener, error } from "./utils";

interface IComponentProps<T> {
  root: Element | string;
  elements: Record<string, string>;
  beforeDestroy?: LifeCycleMethod<T>;
  events: Record<string, (e: Event, state: T) => void>;
  setup: ({ elements }: { elements: IElementsMap }) => T;
  [key: string]: any;
}

interface IElementsMap {
  [key: string]: Element;
}

type LifeCycleMethod<T> = ({
  state,
  elements
}: {
  state: T;
  elements: Record<string, Element>;
}) => void;

const eventRegex = /(\w+)\s+on\s+(\w+)/;

export const component = <T>({
  root,
  elements: elementsSelectors,
  beforeDestroy,
  events,
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
      { root } as IElementsMap
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
        addListener(elements[element], event, e => value(e, state));
      }
    });
  };

  const destroy = () => {
    beforeDestroy && beforeDestroy({ state, elements });
    removeAllListeners();
  };

  init();

  return {
    init,
    destroy
  };
};
