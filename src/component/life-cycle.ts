import type { Component } from "./instance";

export const BEFORE_DESTROY = "before-destroy";

let currentInstance: Component<any> | null = null;

export const setCurrentInstance = (instance: Component<any> | null) => {
  currentInstance = instance;
};

const makeLifeCycleHook = (type: string) => (callback: Function) => {
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
