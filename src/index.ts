import { observable, observe } from "./observable";
import { component } from "./component";

const obj = observable({ a: 2, hello: "world" });

// @ts-ignore
window.o = obj;

observe(() => {
  console.log("from observable", obj.hello);
});

interface IAppState {
  text: string;
  count: number;
}

// @ts-ignore
const app = component<IAppState>({
  root: "#app",
  elements: {
    input: "#input",
    text: "#text",
    div: "#div",
    button: "#btn",
    count: "#count"
  },
  initialState: {
    text: "hello world",
    count: 0
  },
  setup({ elements, state }) {
    const { text, count } = elements;

    observe(() => {
      text.textContent = state.text;
    });

    observe(() => {
      count.textContent = `${state.count}`;
    });
  },
  afterInit({ elements, state }) {
    console.log(state, elements);
  },
  beforeDestroy({ elements, state }) {
    console.log(state, elements);
  },
  events: {
    "input on input"(e: Event, state: IAppState) {
      state.text = (e.target as HTMLInputElement).value;
    },
    "click on button"(_e: Event, state: IAppState) {
      state.count++;
    }
  }
});
