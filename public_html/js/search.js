// import { $, $$ } from "/js/selectors.js";
import { $ } from "./ui.js";
import { postActions } from "./post.js";
const currentPostsFilters = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const filters = {};
    if (urlParams.get("type")) {
        filters.type = urlParams.get("type");
    }
    if (urlParams.get("query")) {
        filters.query = urlParams.get("query");
    }
    if (urlParams.get("address")) {
        filters.address = urlParams.get("address");
    }
    return filters;
};
const startSearch = () => {
    $("#search").addEventListener("submit", (event) => {
        event.preventDefault();
        $("body").classList.remove("postPage");
        $(".welcome-info").style.display = "none";
        const query = $("#search input[type=text]").value;
        postActions(Object.assign(Object.assign({}, currentPostsFilters()), { query }));
    });
};
globalThis.currentPostsFilters = currentPostsFilters;
export { startSearch, currentPostsFilters };
//# sourceMappingURL=search.js.map