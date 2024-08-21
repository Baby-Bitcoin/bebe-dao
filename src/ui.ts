const $ = (selector: string, parent: HTMLElement = null): HTMLElement => {
  return (parent ? parent : document).querySelector(selector);
};

export { $ };
