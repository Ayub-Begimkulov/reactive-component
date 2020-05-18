import { replaceNode } from "../utils";
import { onBeforeDestroy } from "./life-cycle";
import { watchEffect } from "./watch";

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
