// import { $, $$ } from "/js/selectors.js";
import { $ } from "./ui.js";
import { postActions } from "./post.js";

const search = () => {
  $("#search").addEventListener("submit", (event) => {
    event.preventDefault();
    let queryURL: any = {};
    queryURL.type = "search";
    queryURL.string = ($("#search input[type=text]") as any).value;
    $("body").classList.remove("postPage");
    // Boolean arguments are to call or not call functions inside postActions() - names of sub-functions below:
    // queryURL, clearItems, fetchy, looper, populatePosts, charts, voteBTNlisteners, deleteBTNs, removeLastItem
    postActions(queryURL, false, false, false, false);
    $(".welcome-info").style.display = "none";
  });
};

export { search };
