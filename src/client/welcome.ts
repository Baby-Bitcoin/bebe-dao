import { postActions } from "./post.js";
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
  postActions({
    ...currentPostsFilters(),
    type: ($("#select-type select") as any).value,
  });
});

const loadInitPosts = () => {
  const filters = currentPostsFilters();
  const defaultType = ["proposal", "issue", "poll", "election"].includes(
    filters.type
  )
    ? filters.type
    : "all";
  ($("#select-type select") as any).value = defaultType;
  filters.type = defaultType;
  postActions(filters);
};

startSearch();
loadInitPosts();

// if (urlSearch.get("title") && urlSearch.get("id")) {
//   queryURL.type = "title";
//   queryURL.id = urlSearch.get("id");
//   queryURL.string = urlSearch.get("title");
//   // generate post page
//   postActions(queryURL, false);
// } else if (urlSearch.get("tag") !== null) {
//   queryURL.type = "tag";
//   queryURL.string = urlSearch.get("tag");
//   // generate post page
//   postActions(queryURL, false);
// } else {
//   // generate index page
//   const filters = { type: localStorage.getItem("filter") || "all" };
//   postActions("", false, filters);
// }

export { features };
