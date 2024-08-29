// Single element selector
const $ = (
  selector: string,
  parent: HTMLElement | Document = document
): HTMLElement | null => {
  return parent.querySelector(selector);
};

// Multiple elements selector
const $$ = (
  selector: string,
  parent: HTMLElement | Document = document
): NodeListOf<HTMLElement> => {
  return parent.querySelectorAll(selector);
};

export { $, $$ };
