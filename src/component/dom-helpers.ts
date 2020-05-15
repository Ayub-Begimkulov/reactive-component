import { observe } from "../observable";
import { replaceNode } from "../utils";
import { onBeforeDestroy } from "./life-cycle";

const jobs: Set<any> = new Set();
const promise = Promise.resolve();
let isRunning = false;

export const nextTick = (fn?: () => void) => (fn ? promise.then(fn) : promise);

const queueJob = (job: any) => {
  jobs.add(job);
  runJobs();
};

const runJobs = () => {
  if (!isRunning) {
    isRunning = true;
    nextTick(() => {
      jobs.forEach(job => {
        job();
      });
      isRunning = false;
    });
  }
};

const watchEffect = (cb: Function) => {
  observe(cb, {
    scheduler: queueJob,
  });
};

export const renderIf = (
  el: Element,
  condition: (...args: any[]) => boolean
) => {
  const comment = document.createComment("");

  watchEffect(() => {
    const showElement = condition();

    if (showElement) {
      if (!el.parentNode) {
        replaceNode(comment, el);
      }
    } else if (!comment.parentNode) {
      replaceNode(el, comment);
    }
  });
};

export const showIf = (
  el: HTMLElement,
  condition: (...args: any[]) => boolean
) => {
  const initialDisplay = el.style.display;

  watchEffect(() => {
    const showElement = condition();
    el.style.display = showElement ? initialDisplay : "none";
  });
};

export const dynamicClasses = (
  el: Element,
  classMap: Record<string, () => boolean>
) => {
  Object.entries(classMap).forEach(([className, condition]) => {
    watchEffect(() => {
      condition()
        ? el.classList.add(className)
        : el.classList.remove(className);
    });
  });
};

export const listen = (
  el: EventTarget,
  event: string,
  listener: EventListenerOrEventListenerObject
) => {
  el.addEventListener(event, listener);

  const remove = () => el.removeEventListener(event, listener);

  onBeforeDestroy(remove);

  return remove;
};
