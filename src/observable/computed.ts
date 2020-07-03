import { observe } from "./observer";
import { addReaction, runReactions } from "./store";

interface Computed<T> {
  readonly value: T;
}

export const computed = <T>(getter: () => T) => {
  let value: T;
  let computed: Computed<T>;
  let isDirty = true;

  const runner = observe(getter, {
    lazy: true,
    scheduler: () => {
      if (!isDirty) {
        isDirty = true;
        return runReactions(computed, "value");
      }
      return;
    },
  });

  computed = {
    get value() {
      if (isDirty) {
        value = runner();
        isDirty = false;
      }
      addReaction(computed, "value");
      return value;
    },
    set value(val) {
      console.warn("asdf", val);
    },
  };

  return computed;
};
