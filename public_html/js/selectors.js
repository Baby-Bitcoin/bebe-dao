export { $, $$ };

const $ = function (selector, parent) {
    return (parent ? parent : document).querySelector(selector);
};
// Get all matching elements
const $$ = function (selector, parent) {
    return (parent ? parent : document).querySelectorAll(selector);
};