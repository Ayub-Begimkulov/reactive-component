import { observable } from "./observable";
import { makeAddListener, error } from "./utils";

interface IComponentProps<T> {
  root: Element | string;
  elements: Record<string, string>;
  initialState: T;
  afterInit?: LifeCycleMethod<T>;
  beforeDestroy?: LifeCycleMethod<T>;
  events: Record<string, Function>;
  setup: LifeCycleMethod<T>;
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

export const component = <
  T extends { [key: string]: any } = { [key: string]: any }
>({
  root,
  elements: elementsSelectors,
  initialState,
  afterInit,
  beforeDestroy,
  events,
  setup
}: IComponentProps<T>) => {
  const [addListener, removeAllListeners] = makeAddListener();

  const state = observable(initialState);

  const rootElement =
    typeof root === "string" ? document.querySelector(root) : root;

  if (!rootElement) {
    error("can not find root element");
  }

  const elements = Object.entries(elementsSelectors).reduce(
    (acc, [name, selector]) => {
      const element = document.querySelector(selector)!;

      acc[name] = element;

      return acc;
    },
    {} as IElementsMap
  );

  setup({ elements, state });

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

  afterInit && afterInit({ state, elements });

  const destroy = () => {
    beforeDestroy && beforeDestroy({ state, elements });
    removeAllListeners();
  };

  return {
    destroy
  };
};
