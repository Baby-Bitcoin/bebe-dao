import { $, $$ } from "./ui.js";
import { showModal } from "./modal.js";
import { buildWalletsUI } from "./wallets.js";
import { getAddressAvatar } from "./address.js";
import { areCommentsAllowed } from "./post.js";

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

const attachListenersToCommentBoxes = (post: any) => {
  if (!areCommentsAllowed(post)) {
    return;
  }
  let shownReplies = {};
  $$(".comment-box").forEach((el) => {
    el.addEventListener("click", function (event) {
      const commentId = parseInt(el.id.split("comment-")[1]);
      const replyForm = $(`#reply-to-${commentId}`);
      if (!replyForm || shownReplies[commentId]) {
        return;
      }
      shownReplies[commentId] = true;
      replyForm.classList.remove("hide");
      replyForm.addEventListener("submit", (e) => {
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

  $("#post-comment-form").addEventListener("submit", (e) => {
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

  const result: any = await fetch("/comments", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .catch(function (error) {
      console.log(error);
    });

  if (result.error) {
    // TO-DO:
    // Promot error message to the user
    return;
  }
  $("#loader").style.display = "";
  if (result.postId) {
    window.location.reload();
  }
};

export {
  drawPostCommentsSection,
  attachListenersToCommentBoxes,
  areCommentsAllowed,
};
