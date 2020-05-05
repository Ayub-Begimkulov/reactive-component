import { observable, observe } from "./observable";
import { Component, onBeforeDestroy } from "./component";
import { makeAddListener } from "./utils";
import { showIf, dynamicClasses } from "./component";

const useCounter = ({
  count,
  incrementButton,
  decrementButton
}: Record<string, Element>) => {
  const [addListener, removeAllListeners] = makeAddListener();
  const counter = observable({
    value: 0
  });

  observe(() => {
    count.textContent = "" + counter.value;
  });

  dynamicClasses(count, {
    zero: () => counter.value === 0,
    negative: () => counter.value < 0,
    positive: () => counter.value > 0
  });

  const increment = () => counter.value++;
  const decrement = () => counter.value--;
  const isPositive = () => counter.value > 0;

  addListener(incrementButton, "click", increment);
  addListener(decrementButton, "click", decrement);

  showIf(decrementButton as HTMLElement, isPositive);

  onBeforeDestroy(removeAllListeners);
};

const app = new Component({
  root: "#app",
  elements: {
    input: "#input",
    text: "#text",
    incrementButton: "#inc-btn",
    decrementButton: "#dec-btn",
    count: "#count"
  },
  setup({ elements }) {
    const { input } = elements;
    const [addListener, removeAllListeners] = makeAddListener();

    const user = observable({
      name: "hello",
      age: 16
    });

    useCounter(elements);

    const onInput = (e: Event) => {
      const value = (e.target as HTMLInputElement).value;
      user.name = value;
    };

    addListener(input, "input", onInput);

    onBeforeDestroy(removeAllListeners);

    return { user, onInput };
  }
});

// @ts-ignore
window.app = app;
