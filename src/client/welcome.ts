import { postActions } from "./post.js";
import { $ } from "./ui.js";

let features = localStorage.getItem("welcome-info") || null;
const urlString = window.location.search;
const urlSearch = new URLSearchParams(urlString);
let queryURL: any = {};

$("#close-welcome-info").addEventListener("click", (e) => {
  localStorage.setItem("welcome-info", "hidden");
  $(".welcome-info").style.display = "none";
});

$("#bugs").addEventListener("click", (event) => {
  alert("Send bugs or feedback at: bugs@babybitcoin.meme");
});

$("#select-type select").addEventListener("change", (e) => {
  localStorage.setItem("filter", ($("#select-type select") as any).value);
  location.reload();
});

if (urlSearch.get("title") && urlSearch.get("id")) {
  queryURL.type = "title";
  queryURL.id = urlSearch.get("id");
  queryURL.string = urlSearch.get("title");
  // generate post page
  postActions(queryURL, true, true, true, false);
} else if (urlSearch.get("tag") !== null) {
  queryURL.type = "tag";
  queryURL.string = urlSearch.get("tag");
  // generate post page
  postActions(queryURL, true, true, true, false);
} else {
  // generate index page
  postActions("", false, false, false, false);
}

export { features };
