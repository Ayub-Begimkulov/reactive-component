import { observable, observe } from "./observable";
import { component } from "./component";

interface IAppState {
  text: string;
  count: number;
  user: {
    name: string;
    age: number;
  };
}

// @ts-ignore
const app = component<IAppState>({
  root: "#app",
  elements: {
    input: "#input",
    text: "#text",
    button: "#btn",
    count: "#count"
  },
  setup({ elements }) {
    const state = observable({
      text: "hello world",
      count: 0,
      user: {
        name: "hello",
        age: 16
      }
    });

    const { text, count } = elements;

    observe(() => {
      text.textContent = state.text;
    });

    observe(() => {
      count.textContent = `${state.count}`;
    });

    observe(() => {
      // @TODO make a reactions resetting for nested objects
      console.log(state.user.name);
    });

    return state as IAppState;
  },
  afterInit({ elements, state }) {
    console.log(state, elements);
  },
  beforeDestroy({ elements, state }) {
    console.log(state, elements);
  },
  events: {
    "input on input"(e: Event, state: IAppState) {
      const value = (e.target as HTMLInputElement).value;
      state.text = value;
      state.user.name = value;
    },
    "click on button"(_e: Event, state: IAppState) {
      state.count++;
    }
  }
});
