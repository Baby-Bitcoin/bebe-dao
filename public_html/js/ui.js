// Single element selector
const $ = (selector, parent = document) => {
    return parent.querySelector(selector);
};
// Multiple elements selector
const $$ = (selector, parent = document) => {
    return parent.querySelectorAll(selector);
};
export { $, $$ };
//# sourceMappingURL=ui.js.map