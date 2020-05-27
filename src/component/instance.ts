import { BEFORE_DESTROY } from "./life-cycle";
import { AnyObject } from "../types";

interface ComponentOptions<T> {
  root: Element | string;
  elements?: Record<string, string>;
  setup: SetUpFunction<T>;
}

type ElementsMap = Record<string, Element>;
type SetUpFunction<T> = (ctx: { elements: ElementsMap }) => T;

export let currentInstance: Component<any> | null = null;

export const setCurrentInstance = (instance: Component<any> | null) => {
  currentInstance = instance;
};

export class Component<T extends AnyObject> {
  root: Element;
  state?: T;
  setup: SetUpFunction<T>;
  hooks = new Map<string, Set<Function>>();
  elementsSelectors: Record<string, string>;

  constructor({ root, setup, elements = {} }: ComponentOptions<T>) {
    const rootElement =
      typeof root === "string" ? document.querySelector(root) : root;

    if (!rootElement) {
      throw new TypeError(
        "root must be an element, or a selector of an existing element"
      );
    }

    this.root = rootElement;
    this.setup = setup;
    this.elementsSelectors = elements;

    this.init();
  }

  init() {
    setCurrentInstance(this);
    const { setup } = this;
    const elements = this.getElements();
    this.state = setup({ elements });
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
      { root } as ElementsMap
    );
  }

  destroy() {
    this.hooks.get(BEFORE_DESTROY)?.forEach(fn => fn());
    this.hooks.clear();
  }
}
