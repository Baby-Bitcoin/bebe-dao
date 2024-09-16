var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BEBE_SYMBOL, MIN_TOKEN_BALANCE_FOR_POST } from "./config.js";
import { showModal } from "./modal.js";
import { $, $$ } from "./ui.js";
import { buildWalletsUI } from "./wallets.js";
import { getTokenBalance } from "./web3.js";
export const addBTN = () => __awaiter(void 0, void 0, void 0, function* () {
    $("#add").addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
        if (!localStorage.getItem("publicKey")) {
            showModal(buildWalletsUI());
            return;
        }
        const balance = (yield getTokenBalance(localStorage.getItem("publicKey"))) || 0;
        if (balance < MIN_TOKEN_BALANCE_FOR_POST) {
            const html = `
        <div class="overlayMessage">You need at least ${MIN_TOKEN_BALANCE_FOR_POST} ${BEBE_SYMBOL} to post.</div>
      `;
            showModal(html);
            return;
        }
        $("#post-form-container").style.display = "flex";
        $("#close-form").style.display = "block";
        $("body").style.overflow = "hidden";
    }));
});
export const closeBTN = () => {
    $("#close-form").addEventListener("click", (event) => {
        $("#post-form-container").style.display = "none";
        $("body").style.overflow = "";
    });
    document.addEventListener("keydown", (evt) => {
        if (evt.key === "Escape") {
            $(".form-container").style.display = "none";
            $("body").style.overflow = "";
        }
    });
};
export const addOption = () => {
    $("#add_option").addEventListener("click", (event) => {
        event.preventDefault();
        let placeholder;
        const checkedElement = $('input[name="type"]:checked');
        if (checkedElement) {
            checkedElement.value === "poll"
                ? (placeholder = "Option")
                : (placeholder = "Candidate");
        }
        if ($$(".voteInput").length < 23) {
            // Create the new input element
            const newInputElement = document.createElement("input");
            // Set the attributes for the new input element
            newInputElement.setAttribute("class", "voteInput");
            newInputElement.setAttribute("type", "text");
            newInputElement.setAttribute("maxlength", "96");
            newInputElement.setAttribute("placeholder", placeholder);
            newInputElement.required = true;
            $(".options").appendChild(newInputElement);
            const removeElement = $("#remove_option");
            removeElement.style = "display: inline-block !important";
            $$(".voteInput").forEach((el) => {
                el.setAttribute("placeholder", placeholder);
            });
        }
        else {
            alert("Maximum number of options is 23.");
        }
    });
};
export const removeOption = () => {
    $("#remove_option").addEventListener("click", (event) => {
        event.preventDefault();
        if ($$(".voteInput").length === 3) {
            $(".voteInput:last-of-type").remove();
            event.target.style = "display: none !important";
        }
        if ($$(".voteInput").length > 2) {
            $(".voteInput:last-of-type").remove();
        }
    });
};
//# sourceMappingURL=event-listeners.js.map