var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { $, $$ } from "./ui.js";
import { showModal } from "./modal.js";
import { buildWalletsUI } from "./wallets.js";
import { BEBE_SYMBOL, MIN_TOKEN_BALANCE_FOR_POST } from "./config.js";
import { getTokenBalance } from "./web3.js";
import { makeChart } from "./chart.js";
const attachListenersToVote = (post) => __awaiter(void 0, void 0, void 0, function* () {
    $(".vote-btn").addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
        if (!localStorage.getItem("publicKey")) {
            showModal(buildWalletsUI());
            return;
        }
        const checkedRadio = $('input[name="post-' + post.id + '-options"]:checked') || null;
        if (!checkedRadio) {
            const html = `
        <div class="overlayMessage">You need to select an option.</div>
      `;
            showModal(html);
            return;
        }
        const balance = yield getTokenBalance(localStorage.getItem("publicKey"));
        console.log(balance);
        if (balance < MIN_TOKEN_BALANCE_FOR_POST) {
            const html = `
        <div class="overlayMessage">You need at least ${MIN_TOKEN_BALANCE_FOR_POST} ${BEBE_SYMBOL} to vote.</div>
      `;
            showModal(html);
            return;
        }
        const vote = {
            postId: post.id,
            optionIndex: parseInt(checkedRadio.value),
        };
        const voteResult = yield fetch("/vote", {
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
            showModal(html);
            return;
        }
        let currentVotes = $('#total-users b').textContent;
        $('#total-users b').textContent = `${Number(currentVotes) + 1}`;
        const votingOptions = $$('#postVotingOptions input');
        votingOptions.forEach((radio) => {
            radio.disabled = true;
        });
        const snd = $("#vote-sound");
        snd.play();
        if (!snd.paused) {
            const el = event.target;
            el.disabled = true;
            el.classList.remove("voted");
            el.classList.add("voted");
            makeChart(post, voteResult);
        }
    }));
});
export { attachListenersToVote };
//# sourceMappingURL=vote.js.map