import { observable, observe } from "./observable";
import { Component, onBeforeDestroy } from "./component";

const useCounter = (el: Element) => {
  // would be better to make ref
  const counter = observable({
    value: 0
  });

  observe(() => {
    el.textContent = "" + counter.value;
  });

  const increment = () => counter.value++;

  onBeforeDestroy(() => {
    console.log("here");
  });

  return { counter, increment };
};

const app = new Component({
  root: "#app",
  elements: {
    input: "#input",
    text: "#text",
    button: "#btn",
    count: "#count"
  },
  // aka vue composition api)
  setup({ elements }) {
    const { count } = elements;

    const user = observable({
      name: "hello",
      age: 16
    });

    const { counter, increment } = useCounter(count);

    const onInput = (e: Event) => {
      const value = (e.target as HTMLInputElement).value;
      user.name = value;
    };

    observe(() => {
      // @TODO make a reactions resetting for nested objects
      console.log(user.name);
    });

    return { user, counter, increment, onInput };
  },
  events: {
    "input on input": "onInput",
    "click on button": "increment"
  }
});

// @ts-ignore
window.app = app;
