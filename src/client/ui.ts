const $ = (
  selector: string,
  parent: HTMLElement | null = null
): HTMLElement | null => {
  return (parent ? parent : document).querySelector(selector) || null;
};

module.exports = { $ };
