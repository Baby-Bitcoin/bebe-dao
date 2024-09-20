import { $, $$ } from "./ui.js";
import { showModal } from "./modal.js";
import { buildWalletsUI } from "./wallets.js";
import { getAddressAvatar } from "./address.js";
import { areCommentsAllowed } from "./post.js";
import { overlayMSG } from "./utilities.js";

interface Reply {
  id: number;
  username: string;
  content: string;
}

interface Comment {
  id: number;
  username: string;
  content: string;
  replies?: Reply[];
}

interface Post {
  id: number;
  title: string;
  content: string;
  comments?: Comment[];
}

const drawPostCommentsSection = (post: Post, comments: Comment[]) => {
  const html = `
    <div class="comments-section">
      <h2>Comments</h2>
      ${areCommentsAllowed(post) ? `
        <form id="post-comment-form" class="submit-comment main-comment-form">
          <textarea minlength="2" maxlength="1000" required></textarea>
          <input type="submit" value="Comment" />
        </form>
        ${drawPostComments(comments)}` 
      : `<p>Comments will be opened after the voting period ends.</p>`}
    </div>
  `;
  return html;
};

const drawSingleComment = (comment: Comment) => {
  return `
    <header class="flex-center">
      <avatar><img src="${getAddressAvatar(comment)}"></avatar>
      <h3>${comment.username}</h3>
    </header>
    <p>${comment.content}</p>
  `;
};

const drawPostComments = (comments: Comment[]) => {
  return `
    <div class="comments">
      ${(comments || []).map(comment => `
        <comment id="comment-${comment.id}" class='comment-box'>
          ${drawSingleComment(comment)}
          <div class="reply-form-container"></div>
          <replies>
            ${(comment.replies || []).map(reply => `
              <reply id="post-reply-${reply.id}">
                ${drawSingleComment(reply)}
              </reply>
            `).join('')}
          </replies>
        </comment>
      `).join('')}
    </div>
  `;
};

const drawCommentReplyBox = (commentId: number) => `
  <form id="reply-to-${commentId}">
    <textarea minlength="2" maxlength="1000" required></textarea>
    <input type="submit" value="Reply" />
  </form>
`;

const attachListenersToCommentBoxes = async (post: Post) => {
  if (!areCommentsAllowed(post)) return;

  let activeCommentId: number | null = null;
  let isSubmitting = false;

  const commentBoxes = $$(".comment-box");

  commentBoxes.forEach((el: HTMLElement) => {
    if (el.getAttribute('data-listener') === 'true') return;

    el.setAttribute('data-listener', 'true');

    el.addEventListener("click", debounce(async function (event: Event) {
      event.preventDefault();
      event.stopPropagation();

      const commentId = parseInt(el.id.split("comment-")[1]);
      const replyContainer = el.querySelector('.reply-form-container');

      // Save the current textarea content if it exists
      const existingTextarea = el.querySelector('textarea') as HTMLTextAreaElement;
      const currentText = existingTextarea ? existingTextarea.value : "";

      // Handle reply form reset
      if (activeCommentId !== commentId) {
        if (activeCommentId !== null) {
          document.querySelector(`#comment-${activeCommentId} .reply-form-container`)!.innerHTML = "";
        }
        activeCommentId = commentId;
        replyContainer!.innerHTML = drawCommentReplyBox(commentId);
      } else {
        replyContainer!.innerHTML = drawCommentReplyBox(commentId);
      }

      // Restore the previous textarea content
      const newTextarea = el.querySelector(`#reply-to-${commentId} textarea`) as HTMLTextAreaElement;
      if (newTextarea) {
        newTextarea.value = currentText;
      }

      const replyForm = el.querySelector(`#reply-to-${commentId}`) as HTMLFormElement;

      if (!replyForm.getAttribute('data-reply-listener')) {
        attachSubmitListener(replyForm, commentId);
      }

      replyForm.querySelector("textarea")?.focus();

    }, 50));
  });

  const attachSubmitListener = (form: HTMLFormElement, commentId: number) => {
    form.setAttribute('data-reply-listener', 'true');

    form.addEventListener("submit", async (e: Event) => {
      e.preventDefault();
      e.stopPropagation();

      if (isSubmitting) return;

      isSubmitting = true;
      const textarea = form.querySelector("textarea")!;
      const content = textarea.value.trim();

      if (content.length < 2) {
        alert("Reply must be at least 2 characters.");
        isSubmitting = false;
        return;
      }

      try {
        console.log({ postId: post.id, commentId, type: "reply", content });
        await postComment({ postId: post.id, commentId, type: "reply", content });
        form.reset();
      } catch (error) {
        console.error('Error posting the reply:', error);
      } finally {
        isSubmitting = false;
      }
    });
  };

  const commentForm = $("#post-comment-form") as HTMLFormElement;
  if (commentForm && !commentForm.getAttribute('data-listener')) {
    commentForm.setAttribute('data-listener', 'true');
    commentForm.addEventListener("submit", async (e: Event) => {
      e.preventDefault();
      e.stopPropagation();

      const textarea = commentForm.querySelector("textarea")!;
      const content = textarea.value.trim();

      if (content.length < 2) {
        alert("Comment must be at least 2 characters.");
        return;
      }

      try {
        await postComment({ postId: post.id, type: "comment", content });
        commentForm.reset();
      } catch (error) {
        console.error('Error posting the comment:', error);
      }
    });
  }
};


function debounce(func: Function, wait: number) {
  let timeout: number | undefined;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  };
}

const postComment = async (data: { postId: number, commentId?: number, type: string, content: string }) => {
  $("#loader").style.display = "";

  if (!localStorage.getItem("publicKey")) {
    showModal(buildWalletsUI());
    $("#loader").style.display = "none";
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

    if (response.status === 422) {
      overlayMSG('You are banned.');
      return;
    }

    if (!response.ok) {
      throw new Error(`An error occurred: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.error) {
      alert('Error: ' + (result.error.message || 'An unexpected error occurred.'));
      return;
    }

    if (result.postId) {
      const newPostData = await (await fetch(`/posts/${result.postId}`)).json();
      $('.comments').innerHTML = drawPostComments(newPostData.comments);
      attachListenersToCommentBoxes(newPostData);
    }
  } catch (error) {
    console.error(error);
    alert(`Error: ${error.message || "An unexpected error occurred."}`);
  } finally {
    $("#loader").style.display = "none";
  }
};

export {
  drawPostCommentsSection,
  attachListenersToCommentBoxes,
  areCommentsAllowed,
};
