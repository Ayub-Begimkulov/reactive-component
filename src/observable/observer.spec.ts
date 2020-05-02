import { observable, observe } from ".";

describe("observable util", () => {
  it("runs reaction when data changes", () => {
    let dummy;
    const obj = observable({ a: 0 });
    const reaction = jest.fn(() => (dummy = obj.a));

    observe(reaction);

    expect(reaction).toBeCalledTimes(1);
    expect(dummy).toBe(0);

    for (let i = 0; i < 10; i++) {
      obj.a++;
    }

    expect(reaction).toBeCalledTimes(11);
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
    const reaction = jest.fn(() => (dummy = obj.nested.a));

    observe(reaction);

    expect(reaction).toBeCalledTimes(1);
    expect(dummy).toBe(0);

    obj.nested.a = 5;

    expect(reaction).toBeCalledTimes(2);
    expect(dummy).toBe(5);
  });

  it("observes function chain calls", () => {
    let dummy;
    const obj = observable({ a: 0 });

    const getDummy = () => {
      return obj.a;
    };

    observe(() => {
      dummy = getDummy();
    });

    expect(dummy).toBe(0);

    obj.a = 5;

    expect(dummy).toBe(5);
  });

  it("avoids implicit infinite recursive loops with itself", () => {
    const obj = observable({ a: 0 });

    const reaction = jest.fn(() => obj.a++);
    observe(reaction);

    expect(obj.a).toBe(1);
    expect(reaction).toBeCalledTimes(1);

    obj.a = 4;
    expect(obj.a).toBe(5);
    expect(reaction).toBeCalledTimes(2);
  });

  it("avoids infinite loops with other reactions", () => {
    const nums = observable({ num1: 0, num2: 1 });

    const spy1 = jest.fn(() => (nums.num1 = nums.num2));
    const spy2 = jest.fn(() => (nums.num2 = nums.num1));

    observe(spy1);
    observe(spy2);

    expect(nums.num1).toBe(1);
    expect(nums.num2).toBe(1);

    expect(spy1).toBeCalledTimes(1);
    expect(spy2).toBeCalledTimes(1);

    nums.num2 = 4;

    expect(nums.num1).toBe(4);
    expect(nums.num2).toBe(4);

    expect(spy1).toBeCalledTimes(2);
    expect(spy2).toBeCalledTimes(2);

    nums.num1 = 10;

    expect(nums.num1).toBe(10);
    expect(nums.num2).toBe(10);

    expect(spy1).toBeCalledTimes(3);
    expect(spy2).toBeCalledTimes(3);
  });

  it.todo("discovers new branches while running automatically");
  it.todo(
    "not triggered by mutating a property, which is used in an inactive branch"
  );
  it.todo("should not run multiple times for a single mutation");

  it.todo("should allow nested reactions");
});
