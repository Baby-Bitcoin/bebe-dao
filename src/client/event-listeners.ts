import { BEBE_SYMBOL, MINI_TOKEN_BALANCE_FOR_POST } from "./config.js";
import { showModal } from "./modal.js";
import { $, $$ } from "./ui.js";
import { bebeTokenBalance, buildWalletsUI } from "./wallets.js";

export const addBTN = () => {
  $("#add").addEventListener("click", async (event) => {
    if (!localStorage.getItem("publicKey")) {
      showModal(buildWalletsUI());
      return;
    }

    const balance = await bebeTokenBalance();
    if (balance < MINI_TOKEN_BALANCE_FOR_POST) {
      const html = `
        <div class="overlayMessage">You need at least ${MINI_TOKEN_BALANCE_FOR_POST} ${BEBE_SYMBOL} to post.</div>
      `;
      showModal(html);
      return;
    }

    $("#post-form-container").style.display = "flex";
    $("#close-form").style.display = "block";
    $("body").style.overflow = "hidden";
  });
};

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
    const checkedElement: any = $('input[name="type"]:checked');
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
      const removeElement: any = $("#remove_option");
      removeElement.style = "display: inline-block !important";

      $$(".voteInput").forEach((el) => {
        el.setAttribute("placeholder", placeholder);
      });
    } else {
      alert("Maximum number of options is 23.");
    }
  });
};

export const removeOption = () => {
  $("#remove_option").addEventListener("click", (event: any) => {
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
