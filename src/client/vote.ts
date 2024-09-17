import { $, $$ } from "./ui.js";
import { showModal } from "./modal.js";
import { buildWalletsUI, getAddressInfo } from "./wallets.js";
import { BEBE_SYMBOL, MIN_TOKEN_BALANCE_FOR_POST } from "./config.js";
import { makeChart } from "./chart.js";

const attachListenersToVote = async (post: any) => {
  $(".vote-btn").addEventListener("click", async (event) => {
    $("#loader").style.display = "";
    if (!localStorage.getItem("publicKey")) {
      showModal(buildWalletsUI());
      return;
    }

    const checkedRadio: any =
      $('input[name="post-' + post.id + '-options"]:checked') || null;

    if (!checkedRadio) {
      const html = `
        <div class="overlayMessage">You need to select an option.</div>
      `;
      $("#loader").style.display = "none";
      showModal(html);
      return;
    }

    const result = (await getAddressInfo(localStorage.getItem("publicKey"))) || { balance: 0, username: '', address: '', avatarUrl: '' };
    if (result.balance < MIN_TOKEN_BALANCE_FOR_POST) {
      const html = `
        <div class="overlayMessage">You need at least ${MIN_TOKEN_BALANCE_FOR_POST} ${BEBE_SYMBOL} to vote.</div>
      `;
      $("#loader").style.display = "none";
      showModal(html);
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
      const html = `
        <div class="overlayMessage">The following error occurred:<br>${voteResult.error}</div>
      `;
      $("#loader").style.display = "none";
      showModal(html);
      return;
    }

    $("#loader").style.display = "none";
    let currentVotes = $('#total-users b').textContent;
    $('#total-users b').textContent = `${Number(currentVotes) + 1}`;
    const votingOptions = $$('#postVotingOptions input')  as NodeListOf<HTMLInputElement>;
    votingOptions.forEach((radio) => {
      radio.disabled = true;
    });

    const snd: any = $("#vote-sound");
    snd.play();
    if (!snd.paused) {
      const el: any = event.target;
      el.disabled = true;
      el.classList.remove("voted");
      el.classList.add("voted");
      makeChart(post, voteResult);
    }
  });
};

export { attachListenersToVote };
