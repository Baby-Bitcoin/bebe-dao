import { ADMINS } from "./config.js";
import { countdown } from "./countdown.js";
import { checkFileProperties, handleUploadedFile } from "./image-select.js";
import { currentPostsFilters } from "./search.js";
import { $, $$ } from "./ui.js";
import { formatDate, shorthandAddress } from "./utilities.js";
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

const getPostImage = (post: any) => {
  let imageSRC = "/img/love-technology.jpg";
  if (post.imageUrl && post.imageUrl != "") {
    imageSRC = "/images/posts/" + post.imageUrl;
  }

  return imageSRC;
};

const attachListenersToAddresses = () => {
  $$(".post span[data-address]").forEach((el) => {
    el.addEventListener("click", function (event) {
      event.preventDefault();
      const address = (event.target as any).getAttribute("data-address");
      console.log(address);
      postActions({ ...currentPostsFilters(), address });
    });
  });
};

const drawPostDetails = ({ post }: any) => {
  let actions = "";
  const publicKey = localStorage.getItem("publicKey");
  if (publicKey === post.walletAddress || ADMINS.includes(post.walletAddress)) {
    actions = `<button id="delete-${post.id}" class="action-button delete" title="Delete this post"></button>`;
  }

  //!data.approved ? actions += `<button id="approve-${data.id}" class="action-button approve" title="Approve this post"></button>` : null

  let pollHTML = "";
  const options = post.options;

  let votingDisabled;
  let checked;
  let deleteBtnTitle;
  let disabledColor;

  const counter = new countdown();
  const closed = counter.count(post.id, post.expiresAt, false);

  let voteBtnText = "VOTE";
  let closedClass = "";

  if (closed === "Closed") {
    closedClass = closed;
    voteBtnText = "CLOSED";
  } else {
    closedClass = "";
  }

  if (post.voted && post.voted.includes(publicKey)) {
    voteBtnText = "YOU VOTED";
  }

  if (closed === "Closed" || voteBtnText === "YOU VOTED") {
    checked = "disabled";
    disabledColor = 'style="color: gray"';
    votingDisabled = "disabled";
    deleteBtnTitle = 'title="You voted already."';
  } else {
    checked = "";
    disabledColor = "";
    deleteBtnTitle = 'title="Hit the BEBE to cast your vote."';
  }

  options &&
    options.forEach((option, i) => {
      pollHTML += `<li><input id="post-${post.id}-option-${i}" type="radio" name="post-${post.id}-options" value="${i}" ${checked}/> <label for="post-${post.id}-option-${i}" ${disabledColor}>${option}</label></li>`;
    });

  pollHTML = "<ol>" + pollHTML + "</ol>";

  // tags
  const tags = post.tags.split(" ");
  let tagsString = "";
  tags.forEach((post) => {
    tagsString += `<a class="tag ${post.type}" href="/?tag=${post}">#${post}</a>`;
  });

  const imageSRC = getPostImage(post);

  $("body").classList.add("postPage");

  // comments
  // const postComments = commentTemplate(post) || "";
  const postComments = "";

  let description = post.description;
  description = description
    .replace(/<script[^>]*>/g, "<code>")
    .replace(/<\/script>/g, "</code>");

  // const totalMembers =
  //   "<b>" + Object.keys(post.members).length + "</b> total users";
  const totalMembers = "<b>" + 1 + "</b> total users";

  const htmlStr = `
    <article class="post ${closedClass}" id="post-${post.id}">
      <div class="flex">
        <div class="flex justify-start maxw-1111-230">
          <a class="main-image" href="${imageSRC}" target="_blank">
            <img
              class="image"
              src="${imageSRC}"
              alt="${post.tags}" />
            <div class="main-image-username flex-center">
              <span class="postAvatar avatar" title="Avatar">
                <img src="/avatars/${post.walletAddress}.webp" />
              </span>
              <span class="user" title="Username">
                ${shorthandAddress(post.walletAddress, 4)}
              </span>
            </div>
          </a>

          <div class="content">
            <div class="user_info flex">
              <span class="${post.type} post-type">${post.type}</span>
              <b class="${post.type}">#${post.id}</b>
              <img class="calendar" src="/svgs/calendar.svg" alt="calendar date posted icon" />
              <span class="date" title="Date posted">
                ${formatDate(post.createdAt * 1000)}
              </span>
              <img class="hourglass" src="/svgs/hourglass.svg" alt="hourglass time left icon" />
              <span class="countdown" title="Time left (Days : Hours : Minutes)"></span>
              <span class="actions">${actions}</span>
            </div>
            <h1 class="title ${post.type}">${post.title}</h1>
            <div class="description">
              <p>${description}</p>
              <div class="tags">
                <b>TAGS:</b>
                <span class="${post.type}">${tagsString}</span>
              </div>
              <div>
                <b>VOTING OPTIONS:</b>
                <span>${pollHTML}</span>
              </div>
            </div>
            <div class="comments-section">
              <h2>Comments</h2>
              <form
                id="post-${post.id}-comment"
                class="submit-comment main-comment-form">
                <textarea minlength="2" maxlength="1000" required></textarea>
                <input type="submit" value="Comment" />
              </form>
              <div class="comments">${postComments}</div>
            </div>
          </div>
        </div>

        <div class="voting" id="voting">
          <button
            data-id="${post.id}"
            class="vote-btn ${post.type}-bg"
            ${votingDisabled}
            ${deleteBtnTitle}>
          </button>
          <span>${voteBtnText}</span>
          <canvas class="myChart"></canvas>
          <br>
          <span id="total-users">${totalMembers}</span>
          <br><br>
          <a class="back" href="javascript:history.back()" title="Back">
            <img class="small-icon invert" alt="back icon" src="/svgs/back.svg" />
          </a>
        </div>
      </div>
    </article>
    `;

  $("#posts").innerHTML = htmlStr;
};

const drawPost = (post: any) => {
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
  const closed = counter.count(post.id, post.expiresAt, false);

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

  const imageSRC = getPostImage(post);

  const htmlStr = `
    <article class="post ${post.type} ${closedStatus}" id="post-${post.id}">
      <a href="${linkTitle}" class="flex indexPost" title="${post.title}">
        <div class="main-image" style='background: url(${imageSRC}) no-repeat 50% 50%; background-size: cover'></div>
        <div class="content">
          <div class="flex-space-vertical flex-space-vertical-middle">
            <div class="title ${post.type}"><h2>${post.title}</h2></div>
            <div class="user_info flex">
              <span class="index-user ${post.type}" data-address="${
                post.walletAddress
              }">@${post.username}</span>
              <img class="calendar" src="/svgs/calendar.svg" alt="calendar date posted icon" />
              <span class="date" title="Date posted">${formatDate(
                post.createdAt * 1000
              )}</span>
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

const postActions = async (filters: any = {}) => {
  $("#select-type").style.display = "block";
  features === "hidden"
    ? ($(".welcome-info").style.display = "none")
    : ($(".welcome-info").style.display = "block");

  // clear all items
  $("#posts").innerHTML = "Loading posts ...";

  const params = Object.keys(filters).map((key) => `${key}=${filters[key]}`);

  if (filters.type == "all" && Object.keys(filters).length == 1) {
    history.pushState({}, null, "/");
  } else {
    history.pushState({}, null, `/?${params.join("&")}`);
  }

  const posts = await fetch(`posts?${params.join("&")}`).then((response) =>
    response.json()
  );

  $("#loader").style.setProperty("display", "none");

  $("#posts").innerHTML = "";
  posts.forEach((post: any, index: number) => {
    drawPost(post);
  });

  if (filters.query || filters.tag || filters.address) {
    $(".query-text").innerHTML = `<b>${
      filters.query || filters.tag || filters.address
    }</b> - returned ${posts.length} results.`;
  }

  attachListenersToAddresses();
};

const loadSinglePost = async (postId: number) => {
  const data = await fetch(`/posts/${postId}`).then((response) =>
    response.json()
  );

  console.log(data);
  drawPostDetails(data);

  $("#loader").style.setProperty("display", "none");
};

let initialized: boolean = false;
document.onreadystatechange = () => {
  if (document.readyState === "complete" && !initialized) {
    initialized = true;
    handlePostSubmit();
    postFormListener();
  }
};

export { postActions, filter, loadSinglePost };
