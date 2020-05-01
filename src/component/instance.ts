import {
  makeAddListener,
  error,
  isFunction,
  AddListenerFunction,
  RemoveAllListenersFunction
} from "../utils";
import { setCurrentInstance, BEFORE_DESTROY } from "./life-cycle";

interface IComponentProps<T> {
  root: Element | string;
  elements?: Record<string, string>;
  events?: Record<string, string>;
  setup: ({ elements }: { elements: IElementsMap }) => T;
}

interface IElementsMap {
  [key: string]: Element;
}

const eventRegex = /(\w+)\s+on\s+(\w+)/;

export class Component<T extends Record<string, any>> {
  root: Element;
  state?: T;
  setup: ({ elements }: { elements: IElementsMap }) => T;
  hooks = new Map<string, Set<Function>>();
  events: Record<string, string>;
  elementsSelectors: Record<string, string>;
  listen?: AddListenerFunction;
  removeAllListeners?: RemoveAllListenersFunction;

  constructor({
    root,
    setup,
    events = {},
    elements: elementsSelectors = {}
  }: IComponentProps<T>) {
    const rootElement =
      typeof root === "string" ? document.querySelector(root) : root;

    if (!rootElement) {
      throw new TypeError(
        "root must be an element, or a selector of an existing element"
      );
    }

    const [listen, removeAllListeners] = makeAddListener();

    this.listen = listen;
    this.removeAllListeners = removeAllListeners;

    this.root = rootElement;
    this.setup = setup;
    this.events = events;
    this.elementsSelectors = elementsSelectors;

    this.init();
  }

  init() {
    setCurrentInstance(this);
    const { setup } = this;
    const elements = this.getElements();
    this.state = setup({ elements });
    this.attachEvents(this.state, elements);
    setCurrentInstance(null);
  }

  getElements() {
    const { root, elementsSelectors } = this;

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
  }

  attachEvents(state: T, elements: IElementsMap) {
    const { events } = this;

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

        this.listen?.(elements[element], event, listener);
      }
    });
  }

  destroy() {
    this.hooks.get(BEFORE_DESTROY)?.forEach(fn => fn());
    this.removeAllListeners?.();
  }
}
