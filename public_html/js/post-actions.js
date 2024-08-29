import { $, $$ } from "/js/selectors.js";
import { url, user, features } from "/js/solana.js";
import { indexHTML } from "/js/index-template.js";
import { HTML } from "/js/post-template.js";
import { makeChart } from "/js/chart.js";
import { voteBTN } from "/js/vote.js";
import { deletePost } from "/js/delete-post.js";
import { countdown } from "/js/countdown.js";
import { commentEvents } from "/js/comments.js";
export let filter;

export const postActions = (
  queryURL,
  clearItems,
  fetchy,
  looper,
  populatePosts,
  charts,
  voteBTNlisteners,
  deleteBTNs,
  removeLastItem
) => {
  filter = localStorage.getItem("filter") || "all";

  if (filter !== null) {
    $("#select-type select").value = filter;
  } else {
    $("#select-type select").value = "all";
    localStorage.removeItem("filter");
  }

  let newURL = url + "getposts?user=" + user;

  if (typeof queryURL === "object") {
    queryURL.type === "search"
      ? (newURL = url + "getposts?user=" + user + "&search=" + queryURL.string)
      : null;
    queryURL.type === "title"
      ? (newURL =
          url +
          "getposts?user=" +
          user +
          "&id=" +
          queryURL.id +
          "&title=" +
          queryURL.string)
      : null;
    queryURL.type === "tag"
      ? (newURL = url + "getposts?user=" + user + "&tag=" + queryURL.string)
      : null;
    $(".easyNav").classList.add("showEasyNav");
    $("#select-type").style.display = "none";
  } else {
    $("#select-type").style.display = "block";
    features === "hidden"
      ? ($(".welcome-info").style.display = "none")
      : ($(".welcome-info").style.display = "block");
  }

  let filteredData = {};
  let filteredPosts = [];
  let filteredVotes = [];

  if (fetchy === true) {
    fetch(newURL)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        // let's filter the data by user selecte post type
        if (filter !== "all") {
          data.posts.forEach((el, i) => {
            if (el.type === filter) {
              filteredPosts.push(el);
              filteredVotes.push(data.votes[i]);
            }
          });
          filteredData.posts = filteredPosts;
          filteredData.votes = filteredVotes;
        } else {
          filteredData = data;
        }

        // let's reverse order of data on the client, to save computing power on server and to have most recent posts to be first
        const latestPosts = {}; //filteredData.posts.reverse()
        let latestVotes;

        // filteredData.votes ? latestVotes = filteredData.votes.reverse() : null

        const postFunctions = (item, index) => {
          // populate HTML function
          if (populatePosts === true) {
            let html;
            // if the URL coming from page load on main.js and passed to this postActions function does not contain any title or tag parameters, use indexHTML, else, use HTML
            let indexPage = true;

            if (
              typeof queryURL === "string" ||
              queryURL.type === "search" ||
              queryURL.type === "tag"
            ) {
              html = new indexHTML();
            } else {
              html = new HTML();
              indexPage = false;
            }

            $("#posts").innerHTML += html.insertHTML({
              ...item,
              ...latestVotes[index],
              ...filteredData.comments,
              members: data.members,
            });

            indexPage === false
              ? commentEvents(filteredData.posts[0].id)
              : null;
          }

          // remake all charts functiony
          if (charts === true) {
            makeChart(latestPosts, latestVotes);
          }

          // voteBTNs addEventListeners
          if (voteBTNlisteners === true) {
            voteBTN();
          }

          // delete btns addEventListeners
          if (deleteBTNs === true) {
            const deleteBTN = $(".delete");
            deleteBTN &&
              deleteBTN.addEventListener("click", (event) => {
                // get the id (title) of the clicked post
                const arr = event.target.id.split("-");
                const id = arr.at(-1);
                deletePost(id, user);
              });
          }

          const counter = new countdown();
          counter.count(item.id, latestVotes[index].expires, true);
        };

        $("#loader").style.setProperty("display", "none");

        // if (looper === true) {
        //     latestPosts.forEach((post, i) => {
        //         postFunctions(post, i)
        //     })
        // }

        let queryText = $(".query-text");
        let finalQuery;
        if (queryURL.type === "search" || queryURL.type === "tag") {
          finalQuery = queryURL.string;
          queryText.innerHTML = `<b>${finalQuery}</b> - returned ${filteredData.posts.length} results.`;
        }

        filteredData.posts.length == 0
          ? (queryText.innerHTML = `<b>${finalQuery}</b> - returned no results.`)
          : null;
      });
  }
  // clear all items
  if (clearItems === true) {
    $("#posts").innerHTML = "Loading posts ...";
  }

  // remove last post from HTML
  if (removeLastItem === true) {
    $("#posts .post:last-of-type").remove();
  }
};
