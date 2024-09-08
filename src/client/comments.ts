import { $, $$ } from "./ui.js";
import { countdown } from "./countdown.js";
import { showModal } from "./modal.js";
import { buildWalletsUI } from "./wallets.js";
import { getAddressAvatar } from "./address.js";

let closed;

const drawPostCommentsSection = (post: any, comments: any[]) => {
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
};

const drawPostComments = (post: any, comments: any[]) => {
  let commentTemplate = "";

  (comments || []).forEach((comment: any) => {
    let replies = "";
    (comment.replies || []).forEach((reply, i) => {
      replies += `
        <reply id="post-${post.id + "-reply-" + reply.id}">
          <header class="flex-center">
            <avatar><img src="/avatars/${reply.user}.webp"></avatar>
            <h3>${reply.user}</h3>
          </header>
          <p>${reply.text}</p>
        </reply>
        `;
    });
    replies = "<replies>" + replies + "</replies>";

    commentTemplate += `
      <comment id="comment-${comment.id}">
        <header class="flex-center">
          <avatar><img src="${getAddressAvatar(comment)}"></avatar>
          <h3>${comment.username}</h3>
        </header>
        <p>${comment.content}</p>
        ${replies}
      </comment>
    `;
  });

  const html = `
    <div class="comments">${commentTemplate}</div>
  `;
  return html;
};

const drawCommentReplyBox = (id: number = 0) => {
  return `
    <form id="reply-to-comment-${id}" class="reply-comment">
      <textarea minlength="2" maxlength="1000" required></textarea>
      <input type="submit" value="Reply" />
    </form>
  `;
};

const startComment = (post: any) => {
  // const counter = new countdown();
  // closed = counter.count(data.id, data.expires, false);
  $("#post-comment-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      postId: post.id,
      type: "comment",
      content: (e.currentTarget as any).querySelector("textarea").value,
    };
    postComment(data);

    // if (closed === "Closed") {
    //   commentData.postid = post.id;
    //   commentData.commentid = lastCommentID;
    //   commentData.type = "comment";
    //   commentData.comment = e.currentTarget.querySelector("textarea").value;
    //   postComment(commentData);
    // } else {
    //   alert("Comments are only available when the voting period expires.");
    // }
  });
};

const postComment = async (data: any) => {
  if (!localStorage.getItem("publicKey")) {
    showModal(buildWalletsUI());
    return;
  }

  console.log(data);

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

  console.log("result..result", result);

  if (result.postId) {
    window.location.reload();
  }
};

export { startComment, drawPostCommentsSection };
