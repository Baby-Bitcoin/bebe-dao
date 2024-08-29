import { $ } from "./ui.js";

$("#close-welcome-info").addEventListener("click", (e) => {
  localStorage.setItem("welcome-info", "hidden");
  $(".welcome-info").style.display = "none";
});
