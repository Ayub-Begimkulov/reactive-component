import { observable, observe } from "./observable";
import { component } from "./component";

interface IState {
  user: {
    name: string;
    age: number;
  };
  counter: {
    value: number;
  };
}

const useCounter = (el: Element) => {
  // would be better to make ref
  const counter = observable({
    value: 0
  });

  observe(() => {
    el.textContent = "" + counter.value;
  });

  return counter;
};

const app = component<IState>({
  root: "#app",
  elements: {
    input: "#input",
    text: "#text",
    button: "#btn",
    count: "#count"
  },
  // aka vue composition api)
  setup({ elements }) {
    const user = observable({
      name: "hello",
      age: 16
    });

    const { count } = elements;

    const counter = useCounter(count);

    observe(() => {
      // @TODO make a reactions resetting for nested objects
      console.log(user.name);
    });

    return { user, counter };
  },
  beforeDestroy({ elements, state }) {
    console.log(state, elements);
  },
  events: {
    // also it's may be better to declare event handlers
    // in setup function and use event object as a map
    // with same key but with value as method name
    // setup({elements}) {
    //   const onClick = () => {...}
    //   return {..., onClick}
    // },
    // ...
    // events: {
    //   "click on div": "onClick"
    // }
    "input on input"(e, state) {
      const value = (e.target as HTMLInputElement).value;
      state.user.name = value;
    },
    "click on button"(_e, state) {
      state.counter.value++;
    }
  }
});

console.log(app);
