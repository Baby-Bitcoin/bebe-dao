import { getAddressAvatarPostDefault, toggleBanAddress } from "./address.js";
import { makeChart } from "./chart.js";
import {
  attachListenersToCommentBoxes,
  drawPostCommentsSection,
} from "./comments.js";
import { checkFileProperties, handleUploadedFile } from "./image-select.js";
import { currentPostsFilters } from "./search.js";
import { $, $$ } from "./ui.js";
import {
  countdown,
  currentUnixTimestamp,
  formatDate,
  shorthandAddress,
  wait,
} from "./utilities.js";
import { attachListenersToVote } from "./vote.js";
import { features } from "./welcome.js";

let filter = null;

let globalPost = {};

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
      const post = await fetch("/post", {
        method: "POST",
        body: formData,
      }).then((response) => response.json());

      if (post.id) {
        $("#post-form-container").style.display = "";
        $("body").style.overflow = "";
        $(".shortMessage").innerHTML =
          '<div class="quickText"><h2 style="color: green">POST SENT</h2></div>';
        await wait();
        window.location.href = `/?id=${post.id}&title=${post.title}`;
      }
    } catch (error) {
      $(".form_error").innerHTML = error.message;
    }
  });
};

const isPostClosed = (post: any) => {
  return post.expiresAt - currentUnixTimestamp() < 0;
};

const areCommentsAllowed = (post: any) => {
  return !(post.type == "election" && !isPostClosed(post));
};

const postCountdown = (post: any) => {
  const divId = `post-${post.id}-countdown`;

  const html = `
    <span
    id="${divId}"
    class="countdown" title="Time left (Days : Hours : Minutes)">
      ${countdown(post.expiresAt - currentUnixTimestamp(), `#${divId}`)}
    </span>
  `;

  return html;
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

const getPostImage = (post, useThumbnail = false) => {
  let imageSRC = "/img/love-technology.jpg";
  if (post.imageUrl && post.imageUrl !== "") {
    if (useThumbnail) {
      imageSRC = "/images/posts/thumbnails/" + post.imageUrl;
    } else {
      imageSRC = "/images/posts/" + post.imageUrl;
    }
  }
  return imageSRC;
};

const attachListenersToAddresses = () => {
  $$(".post span[data-address]").forEach((el) => {
    el.addEventListener("click", function (event) {
      event.preventDefault();
      const address = (event.target as any).getAttribute("data-address");
      postActions({ ...currentPostsFilters(), address });
    });
  });
};

const drawPostDetails = ({ post, address, comments, votes, ADMINS }: any) => {
  let deletePost = "";
  const publicKey = localStorage.getItem("publicKey");
  if (publicKey === post.walletAddress || ADMINS.includes(publicKey)) {
    deletePost = `<button id="delete-post-${post.id}" class="action-button delete" title="Delete this post"></button>`;
  }
  let banAddress = "";
  if (ADMINS.includes(publicKey)) {
    banAddress = `
      <button 
        id="ban-address-${post.walletAddress}"
        class="action-button ban ${address.isBanned ? "banned" : ""}"
        title="${address.isBanned ? "Unban" : "Ban"} this address">
      </button>
      `;
  }

  let pollHTML = "";
  const options = post.options;

  let votingDisabled;
  let checked;
  let deleteBtnTitle;
  let disabledColor;

  const isClosed = isPostClosed(post);

  let voteBtnText = "VOTE";
  let closedClass = "";

  if (isClosed) {
    closedClass = "closed";
    voteBtnText = "CLOSED";
  } else {
    closedClass = "";
  }

  if (votes.voters?.includes?.(publicKey)) {
    voteBtnText = "YOU VOTED";
  }

  if (isClosed || voteBtnText === "YOU VOTED") {
    checked = "disabled";
    disabledColor = 'style="color: gray"';
    votingDisabled = "disabled";
    deleteBtnTitle = 'title="You voted already."';
  } else {
    votingDisabled = "";
    checked = "";
    disabledColor = "";
    deleteBtnTitle = 'title="Hit the BEBE to cast your vote."';
  }

  options &&
    options.forEach((option, i) => {
      pollHTML += `
        <li>
          <input id="post-${post.id}-option-${i}" type="radio" name="post-${post.id}-options" value="${i}" ${checked}/>
          <label for="post-${post.id}-option-${i}" ${disabledColor}>${option}</label>
        </li>
      `;
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

  let description = post.description;
  description = description
    .replace(/<script[^>]*>/g, "<code>")
    .replace(/<\/script>/g, "</code>");

  const usersNeeded = Math.ceil(
    (post.quorum / 100) * post.totalCurrentAddresses
  );

  const totalMembers = `<b>${votes.voters?.length || 0}</b>/${usersNeeded} users (${
    post.quorum
  }%)`;

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
                <img src="${getAddressAvatarPostDefault(address)}" />
              </span>
              <span class="user" title="Username">
                ${shorthandAddress(post.walletAddress, 4)}
              </span>
            </div>
          </a>
          ${banAddress}
          <div class="content">
            <div class="user_info flex">
              <span class="${post.type} post-type">${post.type}</span>
              <img class="calendar" src="/svgs/calendar.svg" alt="calendar date posted icon" />
              <span class="date" title="Date posted">
                ${formatDate(post.createdAt * 1000)}
              </span>
              <img class="hourglass" src="/svgs/hourglass.svg" alt="hourglass time left icon" />
              ${postCountdown(post)}
              <span class="actions">${deletePost}</span>
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
            ${drawPostCommentsSection(post, comments)}
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
  attachListenersToCommentBoxes(post);
  attachListenersToVote(post);
  attachListenersToPost(post, address);
  makeChart(post, votes);
};

const attachListenersToPost = (post: any, address: any = {}) => {
  const deleteElemet = $(`#delete-post-${post.id}`);
  if (deleteElemet) {
    deleteElemet.addEventListener("click", () => {
      deletePost(post);
    });
  }

  const banElement = $(`#ban-address-${post.walletAddress}`);
  if (banElement) {
    banElement.addEventListener("click", () => {
      toggleBanAddress(post.walletAddress, address.isBanned);
    });
  }
};

const deletePost = async (post: any) => {
  const promptString = prompt(
    "Are you sure you want to delete this post?",
    "YES"
  );

  if (promptString != "YES") {
    return;
  }

  const result = await fetch("/delete-post", {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: post.id }),
  })
    .then((response) => response.json())
    .catch((err) => {
      console.log(err);
    });

  // if (result.error) {
  //   // TO-DO
  //   // Prompt error message to the user
  //   return;
  // }

  $(".shortMessage").innerHTML =
    '<div class="quickText"><h2 style="color: red">POST DELETED</h2></div>';

  await wait();
  window.location.href = "/";
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
  const isClosed = isPostClosed(post);

  post.voted === false
    ? (voted = false)
    : (voted = post?.voted?.includes(localStorage.getItem("publicKey")));

  if (isClosed) {
    closedStatus = "post-closed";
  } else if (voted === true) {
    closedStatus = "post-voted";
  } else {
    closedStatus = "";
  }

  const imageSRC = getPostImage(post, true);

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
              ${postCountdown(post)}
            </div>
          </div>
        </div>
      </a>
    </article>
  `;

  $("#posts").innerHTML += htmlStr;
};

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

  const posts = await fetch(`/posts?${params.join("&")}`).then((response) =>
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
  try {
    const response = await fetch(`/posts/${postId}`);
    $("#loader").style.setProperty("display", "none");
    if (!response.ok) {
      // Handle non-200 responses
      console.error(`Failed to load post: ${response.status}`);
      $("#posts").innerHTML = "Post not found.";
      return;
    }

    const data = await response.json();

    if (!data) {
      console.error("Post data is undefined or null");
      $("#posts").innerHTML = "Post not found.";
      return;
    }

    globalPost = data;
    drawPostDetails(data);

    $("#loader").style.setProperty("display", "none");
  } catch (error) {
    console.error("An error occurred while loading the post:", error);
    $("#posts").innerHTML = "An error occurred. Please try again later.";
    $("#loader").style.setProperty("display", "none");
  }
};

let initialized: boolean = false;
document.onreadystatechange = () => {
  if (document.readyState === "complete" && !initialized) {
    initialized = true;
    handlePostSubmit();
    postFormListener();
  }
};

export {
  postActions,
  filter,
  loadSinglePost,
  isPostClosed,
  areCommentsAllowed,
  globalPost,
  drawPostDetails,
};
