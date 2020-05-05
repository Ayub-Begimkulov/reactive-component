import { observe } from "../observable";
import { replaceNode } from "../utils";

export const renderIf = (
  el: Element,
  condition: (...args: any[]) => boolean
) => {
  const comment = document.createComment("");

  observe(() => {
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
  observe(() => {
    const showElement = condition();

    el.style.display = showElement ? initialDisplay : "none";
  });
};

export const dynamicClasses = (
  el: Element,
  classMap: Record<string, () => boolean>
) => {
  Object.entries(classMap).forEach(([className, condition]) => {
    observe(() => {
      condition()
        ? el.classList.add(className)
        : el.classList.remove(className);
    });
  });
};
