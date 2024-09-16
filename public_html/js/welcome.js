import { loadSinglePost, postActions } from "./post.js";
import { currentPostsFilters, startSearch } from "./search.js";
import { $ } from "./ui.js";
let features = localStorage.getItem("welcome-info") || null;
$("#close-welcome-info").addEventListener("click", (e) => {
    localStorage.setItem("welcome-info", "hidden");
    $(".welcome-info").style.display = "none";
});
$("#bugs").addEventListener("click", (event) => {
    alert("Send bugs or feedback at: bugs@babybitcoin.meme");
});
$("#select-type select").addEventListener("change", (e) => {
    postActions(Object.assign(Object.assign({}, currentPostsFilters()), { type: $("#select-type select").value }));
});
const loadInitPosts = () => {
    const filters = currentPostsFilters();
    const defaultType = ["proposal", "issue", "poll", "election"].includes(filters.type)
        ? filters.type
        : "all";
    $("#select-type select").value = defaultType;
    filters.type = defaultType;
    postActions(filters);
};
startSearch();
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("id")) {
    loadSinglePost(Number(urlParams.get("id")));
}
else {
    loadInitPosts();
}
export { features };
//# sourceMappingURL=welcome.js.map