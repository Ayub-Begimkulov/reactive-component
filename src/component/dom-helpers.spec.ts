import { renderIf, showIf } from "./dom-helpers";
import { observable } from "../observable";

beforeEach(() => {
  document.body.innerHTML = `<div></div>`;
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("renderIf helper", () => {
  it("removes element when function returns falsy value", () => {
    const div = document.querySelector("div")!;

    renderIf(div, () => false);

    expect(document.contains(div)).toBe(false);
    expect(document.body.innerHTML).toBe("<!---->");
  });

  it("doesn't remove element if function returns truthy value", () => {
    const div = document.querySelector("div")!;

    renderIf(div, () => true);

    expect(document.contains(div)).toBe(true);
    expect(document.body.innerHTML).not.toContain("<!---->");
  });

  it("updates if observable state changes", () => {
    const div = document.querySelector("div")!;

    const state = observable<Record<string, any>>({ renderDiv: false });

    renderIf(div, () => state.renderDiv);

    expect(document.contains(div)).toBe(false);
    expect(document.body.innerHTML).toBe("<!---->");

    state.renderDiv = true;

    expect(document.contains(div)).toBe(true);
    expect(document.body.innerHTML).not.toContain("<!---->");
  });
});

describe("showIf helper", () => {
  it("adds `display: none` if return value is falsy", () => {
    const div = document.querySelector("div")!;

    showIf(div, () => false);

    expect(div.style.display).toBe("none");
  });

  it("doesn't add `display: none` if value is truthy", () => {
    const div = document.querySelector("div")!;

    showIf(div, () => true);

    expect(div.style.display).toBe("");
  });

  it("updates when observable state changes", () => {
    const div = document.querySelector("div")!;

    const state = observable({ showDiv: true });

    showIf(div, () => state.showDiv);

    expect(div.style.display).toBe("");

    state.showDiv = false;

    expect(div.style.display).toBe("none");
  });

  it("respects initial display value", () => {
    const div = document.querySelector("div")!;
    div.style.display = "flex";

    const state = observable({ showDiv: false });

    showIf(div, () => state.showDiv);

    expect(div.style.display).toBe("none");

    state.showDiv = true;

    expect(div.style.display).toBe("flex");
  });
});
