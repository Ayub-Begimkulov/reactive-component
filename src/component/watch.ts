import { queueJob } from "./scheduler";
import { observe } from "../observable";

export const watchEffect = (cb: Function) => {
  observe(cb, {
    scheduler: queueJob,
  });
};
