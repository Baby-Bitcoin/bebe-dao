import { showModal } from "./modal.js";
import { buildWalletsUI } from "./wallets.js";
import { $ } from "./ui.js";

const attachListenersToVote = async (post: any) => {
  $(".vote-btn").addEventListener("click", async (event) => {
    if (!localStorage.getItem("publicKey")) {
      showModal(buildWalletsUI());
      return;
    }

    const checkedRadio: any =
      $('input[name="post-' + post.id + '-options"]:checked') || null;

    if (!checkedRadio) {
      // TO-DO:
      // prompt to the user that he needs to select an option
      return;
    }

    const vote = {
      postId: post.id,
      optionIndex: parseInt(checkedRadio.value),
    };

    const voteResult = await fetch("/vote", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vote),
    })
      .then((response) => response.json())
      .catch((err) => {
        console.log(err);
      });

    if (voteResult.error) {
      // TO-DO
      // Prompt error message to the user
      return;
    }

    const snd: any = $("#vote-sound");
    snd.play();
    if (!snd.paused) {
      const el: any = event.target;
      el.disabled = true;
      el.classList.remove("voted");
      el.classList.add("voted");

      // TO-DO:
      // Update vote info on the page
    }
  });
};

export { attachListenersToVote };
