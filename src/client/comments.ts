import { $, $$ } from "./ui.js";
import { showModal } from "./modal.js";
import { buildWalletsUI } from "./wallets.js";
import { getAddressAvatar } from "./address.js";
import { areCommentsAllowed } from "./post.js";
import { overlayMSG } from "./utilities.js";

const drawPostCommentsSection = (post: any, comments: any[]) => {
  if (areCommentsAllowed(post)) {
    const html = `
      <div class="comments-section">
        <h2>Comments</h2>
        <form
          id="post-comment-form"
          class="submit-comment main-comment-form">
          <textarea minlength="2" maxlength="1000" required></textarea>
          <input type="submit" value="Comment" />
        </form>
        ${drawPostComments(post, comments)}
      </div>
    `;

    return html;
  }

  const html = `
    <div class="comments-section">
      <h2>Comments</h2>
      <p>Comments will be opened after the voting period ends.</p>
    </div>
    `;

  return html;
};

const drawSingleComment = (comment: any) => {
  const html = `
    <header class="flex-center">
      <avatar><img src="${getAddressAvatar(comment)}"></avatar>
      <h3>${comment.username}</h3>
    </header>
    <p>${comment.content}</p>
  `;

  return html;
};

const drawPostComments = (post: any, comments: any[]) => {
  let commentTemplate = "";

  (comments || []).forEach((comment: any) => {
    let replies = "";
    (comment.replies || []).forEach((reply: any) => {
      replies += `
        <reply id="post-${post.id + "-reply-" + reply.id}">
          ${drawSingleComment(reply)}
        </reply>
        `;
    });
    replies = "<replies>" + replies + "</replies>";

    commentTemplate += `
      <comment
        id="comment-${comment.id}"
        class='comment-box'>
        ${drawSingleComment(comment)}
        ${drawCommentReplyBox(comment.id)}
        ${replies}
      </comment>
    `;
  });

  const html = `
    <div class="comments">${commentTemplate}</div>
  `;
  return html;
};

const drawCommentReplyBox = (commentId: number = 0) => {
  return `
    <form id="reply-to-${commentId}" class="hide">
      <textarea minlength="2" maxlength="1000" required></textarea>
      <input type="submit" value="Reply" />
    </form>
  `;
};

const attachListenersToCommentBoxes = async (post: any) => {
  if (!areCommentsAllowed(post)) {
    return;
  }
  let shownReplies = {};
  $$(".comment-box").forEach(async (el) => {
    if (el.getAttribute('data-listener') === 'true') {
      return; // Listener already attached
    }
    el.setAttribute('data-listener', 'true'); // Mark as listener attached

    el.addEventListener("click", async function (event) {
      event.preventDefault();
      const commentId = parseInt(el.id.split("comment-")[1]);

      const replyForm = $(`#reply-to-${commentId}`);
      if (!replyForm || shownReplies[commentId]) {
        return;
      }
      shownReplies[commentId] = true;
      replyForm.classList.remove("hide");
      replyForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = {
          postId: post.id,
          commentId,
          type: "reply",
          content: replyForm.querySelector("textarea").value,
        };
        postComment(data);
      });
    });
  });

  const commentForm = $("#post-comment-form");
  if (commentForm.getAttribute('data-listener') === 'true') {
    return; // Listener already attached
  }
  commentForm.setAttribute('data-listener', 'true'); // Mark as listener attached

  commentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      postId: post.id,
      type: "comment",
      content: (e.currentTarget as any).querySelector("textarea").value,
    };
    postComment(data);
  });
};

const postComment = async (data: any) => {
  $("#loader").style.display = "";

  if (!localStorage.getItem("publicKey")) {
    showModal(buildWalletsUI());
    return;
  }

  try {
    const response = await fetch("/comments", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Check if the status is 422
    if (response.status === 422) {
      overlayMSG('You are bannedd.');
      return;
    }

    // Check if the response is not OK (status code not in the range 200-299)
    if (!response.ok) {
      throw new Error(`An error occurred: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.error) {
      // Handle general error returned by the server
      alert('Error: ' + result.error.message || 'An unexpected error occurred.');
      $("#loader").style.display = "none";
      return;
    }

    $("#loader").style.display = "none";

    if (result.postId) {
      // Update and redraw comments without reloading
      const response = await fetch(`/posts/${result.postId}`);
      const newData = await response.json();
      $('.comments').innerHTML = drawPostComments(newData, newData.comments);
      attachListenersToCommentBoxes(newData);

      // Clear the comment form after successful submission
      const form = $("#post-comment-form") as HTMLFormElement;
      form.reset(); // Reset the form state
    }
  } catch (error) {
    // Handle any other errors
    console.error(error);
    alert(`Error: ${error.message || "An unexpected error occurred."}`);
    $("#loader").style.display = "none";
  }
};


export {
  drawPostCommentsSection,
  attachListenersToCommentBoxes,
  areCommentsAllowed,
};
