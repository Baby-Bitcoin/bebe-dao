import { countdown } from "./countdown.js";
import { checkFileProperties, handleUploadedFile } from "./image-select.js";
import { $, $$ } from "./ui.js";
import { formatDate } from "./utilities.js";
import { features } from "./welcome.js";

let filter = null;

const handlePostSubmit = async () => {
  $("#post-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    // get the number of options added and push 0 for each of them to the votes array
    let votes = [];
    const voteInputsNr = $$(".voteInput").length;
    for (let i = 0; i < voteInputsNr; i++) {
      votes.push(0);
    }

    const formData = new FormData();

    const titleElement: any = $("#title");
    const durationElement: any = $("#duration");
    const descriptionElement: any = $("#description");
    const imageElement: any = $("#post-image");

    if (
      !titleElement ||
      !durationElement ||
      !descriptionElement ||
      !imageElement
    ) {
      return;
    }

    formData.append("title", titleElement.value);
    formData.append("duration", durationElement.value);
    formData.append("description", descriptionElement.value);
    formData.append("quorum", ($("#quorumSlider") as any).value);
    imageElement.files[0] && formData.append("image", imageElement.files[0]);

    $$(".voteInput").forEach((option: any) =>
      formData.append("options[]", option.value)
    );

    const tags = ($("#tags-input") as any).value;
    const punctuationless = tags
      .replace(/[^\w\s]|_/g, "")
      .replace(/\s+/g, " ")
      .trimStart()
      .trimEnd();
    const finalTagsString = punctuationless.replace(/\s{2,}/g, " ");

    formData.append("tags", finalTagsString);
    formData.append("type", ($('input[name="type"]:checked') as any).value);
    (votes || []).forEach((vote: string) => formData.append("votes[]", vote));

    try {
      const result = await fetch("/post", {
        method: "POST",
        body: formData,
      }).then((response) => response.json());

      if (result.status === 200) {
        $("#post-form-container").style.display = "";
        $("body").style.overflow = "";
        $(".shortMessage").innerHTML =
          '<div class="quickText"><h2 style="color: green">POST SENT</h2></div>';
      }
    } catch (error) {
      $(".form_error").innerHTML = error.message;
    }
  });
};

const postFormListener = () => {
  let postType;
  let pollOptions = [];
  let imageSelected = false;

  $("#post-form").addEventListener("change", (event) => {
    postType = ($('input[name="type"]:checked') as any).value;
    pollOptions = [];
    $$(".voteInput").forEach((el: any, i) => {
      pollOptions.push(el.value);
    });

    const election =
      ($('input[name="type"]:checked') as any).value === "election";

    if (
      ($('input[name="type"]:checked') as any).value === "poll" ||
      ($('input[name="type"]:checked') as any).value === "election"
    ) {
      ($(".options") as any).style = "";
      ($("#add-remove-inputs") as any).style = "display: block";
      $$(".voteInput").forEach((el: any, i) => {
        el.required = true;
        election ? (el.placeholder = "Candidate") : (el.placeholder = "Option");
      });
    } else {
      ($(".options") as any).style = "display: none";
      ($("#add-remove-inputs") as any).style = "";
      $$(".voteInput").forEach((el: any, i) => {
        el.required = false;
      });
    }

    // check file selected
    let theFile;
    if ((event.target as any).files) {
      theFile = (event.target as any).files[0];
      $("#post-form .form_error").classList.add("error");
      if (checkFileProperties(theFile, "post-form")) {
        handleUploadedFile(theFile, "post-form");
        imageSelected = true;
      }
    }
  });

  $("#post-form .image-label+input[type=file]").addEventListener(
    "click",
    (event) => {
      $("#post-form .form_error").innerHTML = "";
      $("#post-form .form_error").classList.remove("error");
    }
  );
};

const drawPost = (post: any) => {
  // let approved
  // !data.approved ? approved = 'unapproved' : approved = ''

  // title
  let linkTitle = "";
  if (post && post.title) {
    linkTitle =
      "?id=" +
      post.id +
      "&title=" +
      post.title
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
  }
  let voted;
  let closedStatus = "";
  const counter = new countdown();
  const closed = counter.count(post.id, post.expires, false);
  post.voted === false
    ? (voted = false)
    : (voted = post?.voted?.includes(localStorage.getItem("publicKey")));

  if (closed === "Closed") {
    closedStatus = "post-closed";
  } else if (voted === true) {
    closedStatus = "post-voted";
  } else {
    closedStatus = "";
  }

  // check if we have an image
  let imageSRC;
  if (post.image && post.image != "") {
    imageSRC = "/uploads/" + post.image;
  } else {
    imageSRC = "/img/love-technology.jpg";
  }

  const htmlStr = `
    <article class="post ${post.type} ${closedStatus}" id="post-${post.id}">
      <a href="${linkTitle}" class="flex indexPost" title="${post.title}">
        <div class="main-image" style='background: url(${imageSRC}) no-repeat 50% 50%; background-size: cover'></div>
          <div class="content">
            <div class="flex-space-vertical flex-space-vertical-middle">
              <div class="title ${post.type}">
              <h2>${post.title}</h2>
            </div>
            <div class="user_info flex">
              <span class="index-user ${post.type}">@
                ${post.user}
              </span>
              <img class="calendar" src="/svgs/calendar.svg" alt="calendar date posted icon" />
              <span class="date" title="Date posted">
                ${formatDate(post.date)}
              </span>
              <img class="hourglass" src="/svgs/hourglass.svg" alt="hourglass time left icon" />
              <span class="countdown" title="Time left (Days : Hours : Minutes)"></span>
            </div>
          </div>
        </div>
      </a>
    </article>
  `;

  $("#posts").innerHTML += htmlStr;
};

// const postFunctions = (item, index, charts, voteBTNlisteners, deleteBTNs) => {
//   // let's reverse order of data on the client, to save computing power on server and to have most recent posts to be first
//   const latestPosts = {}; //filteredData.posts.reverse()
//   let latestVotes;

//   // populate HTML function
//   if (populatePosts === true) {
//     let html;
//     // if the URL coming from page load on main.js and passed to this postActions function does not contain any title or tag parameters, use indexHTML, else, use HTML
//     let indexPage = true;

//     if (
//       typeof queryURL === "string" ||
//       queryURL.type === "search" ||
//       queryURL.type === "tag"
//     ) {
//       html = new indexHTML();
//     } else {
//       html = new HTML();
//       indexPage = false;
//     }

//     $("#posts").innerHTML += html.insertHTML({
//       ...item,
//       ...latestVotes[index],
//       ...filteredData.comments,
//       members: data.members,
//     });

//     indexPage === false ? commentEvents(filteredData.posts[0].id) : null;
//   }

//   // remake all charts functiony
//   if (charts === true) {
//     makeChart(latestPosts, latestVotes);
//   }

//   // voteBTNs addEventListeners
//   if (voteBTNlisteners === true) {
//     voteBTN();
//   }

//   // delete btns addEventListeners
//   if (deleteBTNs === true) {
//     const deleteBTN = $(".delete");
//     deleteBTN &&
//       deleteBTN.addEventListener("click", (event) => {
//         // get the id (title) of the clicked post
//         const arr = event.target.id.split("-");
//         const id = arr.at(-1);
//         deletePost(id, user);
//       });
//   }

//   const counter = new countdown();
//   counter.count(item.id, latestVotes[index].expires, true);
// };

const postActions = async (
  queryURL,
  charts,
  voteBTNlisteners,
  deleteBTNs,
  removeLastItem
) => {
  filter = localStorage.getItem("filter") || "all";

  const selectType: any = $("#select-type select");

  if (filter !== null) {
    selectType.value = filter;
  } else {
    selectType.value = "all";
    localStorage.removeItem("filter");
  }

  const url = "/";
  const user = localStorage.getItem("publicKey");
  let newURL = url + "posts?user=" + user;

  if (typeof queryURL === "object") {
    queryURL.type === "search"
      ? (newURL = url + "posts?user=" + user + "&search=" + queryURL.string)
      : null;
    queryURL.type === "title"
      ? (newURL =
          url +
          "posts?user=" +
          user +
          "&id=" +
          queryURL.id +
          "&title=" +
          queryURL.string)
      : null;
    queryURL.type === "tag"
      ? (newURL = url + "posts?user=" + user + "&tag=" + queryURL.string)
      : null;
    $(".easyNav").classList.add("showEasyNav");
    $("#select-type").style.display = "none";
  } else {
    $("#select-type").style.display = "block";
    features === "hidden"
      ? ($(".welcome-info").style.display = "none")
      : ($(".welcome-info").style.display = "block");
  }

  // clear all items
  $("#posts").innerHTML = "Loading posts ...";

  // remove last post from HTML
  if (removeLastItem === true) {
    $("#posts .post:last-of-type").remove();
  }

  let filteredData: any = {};
  let filteredPosts = [];
  let filteredVotes = [];

  const posts = await fetch(newURL).then((response) => response.json());

  // // let's filter the data by user selecte post type
  // if (filter !== "all") {
  //   data.posts.forEach((el, i) => {
  //     if (el.type === filter) {
  //       filteredPosts.push(el);
  //       filteredVotes.push(data.votes[i]);
  //     }
  //   });
  //   filteredData.posts = filteredPosts;
  //   filteredData.votes = filteredVotes;
  // } else {
  //   filteredData = data;
  // }

  // filteredData.votes ? latestVotes = filteredData.votes.reverse() : null

  $("#loader").style.setProperty("display", "none");

  $("#posts").innerHTML = "";
  posts.forEach((post: any, index: number) => {
    drawPost(post);
  });

  let queryText = $(".query-text");
  let finalQuery = "Posts";
  if (queryURL.type === "search" || queryURL.type === "tag") {
    finalQuery = queryURL.string;
    queryText.innerHTML = `<b>${finalQuery}</b> - returned ${filteredData.posts.length} results.`;
  }

  posts.length == 0
    ? (queryText.innerHTML = `<b>${finalQuery}</b> - returned no results.`)
    : null;
};

let initialized: boolean = false;
document.onreadystatechange = () => {
  if (document.readyState === "complete" && !initialized) {
    initialized = true;
    handlePostSubmit();
    postFormListener();
  }
};

export { postActions, filter };
