import { observable } from "./observable";
import { Component, onBeforeDestroy } from "./component";
import { showIf, dynamicClasses, watchEffect, listen } from "./component";

const useCounter = ({
  count,
  incrementButton,
  decrementButton,
}: Record<string, Element>) => {
  const counter = observable({
    value: 0,
  });

  watchEffect(() => {
    count.textContent = "" + counter.value;
  });

  dynamicClasses(count, {
    zero: () => counter.value === 0,
    negative: () => counter.value < 0,
    positive: () => counter.value > 0,
  });

  const increment = () => counter.value++;
  const decrement = () => counter.value--;
  const isPositive = () => counter.value > 0;

  listen(incrementButton, "click", increment);
  listen(decrementButton, "click", decrement);

  showIf(decrementButton as HTMLElement, isPositive);
};

new Component({
  root: "#app",
  elements: {
    input: "#input",
    text: "#text",
    incrementButton: "#inc-btn",
    decrementButton: "#dec-btn",
    count: "#count",
  },
  setup({ elements }) {
    const { input } = elements;

    const user = observable({
      name: "hello",
      age: 16,
    });

    useCounter(elements);

    const onInput = (e: Event) => {
      const value = (e.target as HTMLInputElement).value;
      user.name = value;
    };

    listen(input, "input", onInput);

    onBeforeDestroy(() => {});

    return { user, onInput };
  },
});
