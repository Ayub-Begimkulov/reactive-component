import { getCurrentInstance } from "./instance";

export const BEFORE_DESTROY = "before-destroy";

const makeLifeCycleHook = (type: string) => (callback: Function) => {
  const currentInstance = getCurrentInstance();
  if (currentInstance) {
    const hooksMap = currentInstance.hooks;
    let lifeCycleHooks = hooksMap.get(type);
    if (!lifeCycleHooks) {
      lifeCycleHooks = new Set();
      hooksMap.set(type, lifeCycleHooks);
    }
    lifeCycleHooks.add(callback);
  }
};

export const onBeforeDestroy = makeLifeCycleHook(BEFORE_DESTROY);
