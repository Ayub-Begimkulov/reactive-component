import { observable, observe } from ".";

describe("observable util", () => {
  it("runs reaction when data changes", () => {
    let dummy;
    const obj = observable({ a: 0 });
    const spy = jest.fn(() => (dummy = obj.a));

    observe(spy);

    expect(spy).toBeCalledTimes(1);
    expect(dummy).toBe(0);

    for (let i = 0; i < 10; i++) {
      obj.a++;
    }

    expect(spy).toBeCalledTimes(11);
    expect(dummy).toBe(10);
  });

  it("observes multiple properties", () => {
    let dummy;
    const obj = observable({ a: 1, b: 1 });

    observe(() => (dummy = obj.a + obj.b));

    expect(dummy).toBe(2);

    obj.a = 7;

    expect(dummy).toBe(8);

    obj.b = 5;

    expect(dummy).toBe(12);
  });

  it("handles multiple reactions", () => {
    let dummy1, dummy2;
    const obj = observable({ a: 0 });

    observe(() => (dummy1 = obj.a));
    observe(() => (dummy2 = obj.a));

    expect(dummy1).toBe(0);
    expect(dummy2).toBe(0);

    obj.a = 7;

    expect(dummy1).toBe(7);
    expect(dummy2).toBe(7);
  });

  it("observes nested objects", () => {
    let dummy;
    const obj = observable({ nested: { a: 0 } });
    const spy = jest.fn(() => (dummy = obj.nested.a));

    observe(spy);

    expect(dummy).toBe(0);
    expect(spy).toBeCalledTimes(1);

    obj.nested.a = 5;

    expect(dummy).toBe(5);
    expect(spy).toBeCalledTimes(2);

    obj.nested = {
      a: 3
    };

    expect(dummy).toBe(3);
    expect(spy).toBeCalledTimes(3);
  });

  it("observes function chain calls", () => {
    let dummy;
    const obj = observable({ a: 0 });

    const getDummy = () => obj.a;

    observe(() => {
      dummy = getDummy();
    });

    expect(dummy).toBe(0);

    obj.a = 5;

    expect(dummy).toBe(5);
  });

  it("avoids implicit infinite recursive loops with itself", () => {
    const obj = observable({ a: 0 });

    const spy = jest.fn(() => obj.a++);
    observe(spy);

    expect(obj.a).toBe(1);
    expect(spy).toBeCalledTimes(1);

    obj.a = 4;
    expect(obj.a).toBe(5);
    expect(spy).toBeCalledTimes(2);
  });

  it("avoids infinite loops with other reactions", () => {
    const obj = observable({ num1: 0, num2: 1 });

    const spy1 = jest.fn(() => (obj.num1 = obj.num2));
    const spy2 = jest.fn(() => (obj.num2 = obj.num1));

    observe(spy1);
    observe(spy2);

    expect(obj.num1).toBe(1);
    expect(obj.num2).toBe(1);

    expect(spy1).toBeCalledTimes(1);
    expect(spy2).toBeCalledTimes(1);

    obj.num2 = 4;

    expect(obj.num1).toBe(4);
    expect(obj.num2).toBe(4);

    expect(spy1).toBeCalledTimes(2);
    expect(spy2).toBeCalledTimes(2);

    obj.num1 = 10;

    expect(obj.num1).toBe(10);
    expect(obj.num2).toBe(10);

    expect(spy1).toBeCalledTimes(3);
    expect(spy2).toBeCalledTimes(3);
  });

  it("discovers new branches while running automatically", () => {
    const obj = observable({ a: 0, b: 0 });

    const spy1 = jest.fn();
    const spy2 = jest.fn();

    observe(() => {
      if (obj.a < 2) {
        spy1();
      } else if (obj.b >= 0) {
        spy2();
      }
    });

    expect(spy1).toBeCalledTimes(1);
    expect(spy2).toBeCalledTimes(0);

    obj.a = 2;

    expect(spy1).toBeCalledTimes(1);
    expect(spy2).toBeCalledTimes(1);

    obj.b = 5;

    expect(spy1).toBeCalledTimes(1);
    expect(spy2).toBeCalledTimes(2);
  });

  it("not triggered by mutating a property, which is used in an inactive branch", () => {
    let dummy;
    const obj = observable({ prop: "value", run: true });

    const conditionalSpy = jest.fn(() => {
      dummy = obj.run ? obj.prop : "other";
    });
    observe(conditionalSpy);

    expect(dummy).toBe("value");
    expect(conditionalSpy).toBeCalledTimes(1);
    obj.run = false;
    expect(dummy).toBe("other");
    expect(conditionalSpy).toBeCalledTimes(2);
    obj.prop = "value2";
    expect(dummy).toBe("other");
    expect(conditionalSpy).toBeCalledTimes(2);
  });

  it("should not run if the value didn't change", () => {
    let dummy;
    const obj = observable({ a: 0 });

    const spy = jest.fn(() => {
      dummy = obj.a;
    });
    observe(spy);

    expect(dummy).toBe(0);
    expect(spy).toBeCalledTimes(1);

    obj.a = 2;

    expect(dummy).toBe(2);
    expect(spy).toBeCalledTimes(2);

    obj.a = 2;

    expect(dummy).toBe(2);
    expect(spy).toBeCalledTimes(2);
  });

  it.todo("should allow nested reactions");
});
