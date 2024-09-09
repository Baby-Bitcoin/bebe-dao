import { $ } from "./ui.js";

const getAddressAvatar = (address: any) => {
  let url = "/svgs/user.svg";
  if (address.avatarUrl && address.avatarUrl != "") {
    url = "/images/addresses/" + address.avatarUrl;
  }

  return url;
};

const getAddressAvatarPostDefault = (address: any) => {
  let url = "/img/love-technology.jpg";
  if (address.avatarUrl && address.avatarUrl != "") {
    url = "/images/addresses/" + address.avatarUrl;
  }

  return url;
};

const toggleBanAddress = async (walletAddress: string, msg = "ban") => {
  const promptString = prompt(
    `Are you sure you want to ${msg} this address?`,
    "YES"
  );

  if (promptString != "YES") {
    return;
  }

  const result = await fetch("toggle-address-ban", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ walletAddress }),
  })
    .then((response) => response.json())
    .catch((err) => {
      console.log(err);
    });

  if (result.error) {
    // TO-DO
    // Prompt error message to the user
    return;
  }

  $(".shortMessage").innerHTML = `
    <div class="quickText"><h2 style="color: red">
      USER ${result.isBanned ? "BANNED" : "UNBANNED"}
    </h2></div>
  `;

  const btn = $(`#ban-address-${walletAddress}`);
  btn.classList.toggle("banned");
};

export { getAddressAvatar, getAddressAvatarPostDefault, toggleBanAddress };
