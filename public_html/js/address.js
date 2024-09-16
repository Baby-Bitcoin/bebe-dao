var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { $ } from "./ui.js";
const getAddressAvatar = (address) => {
    let url = "/svgs/user.svg";
    if (address.avatarUrl && address.avatarUrl != "") {
        url = "/images/addresses/" + address.avatarUrl;
    }
    return url;
};
const getAddressAvatarPostDefault = (address) => {
    let url = "/img/love-technology.jpg";
    if (address.avatarUrl && address.avatarUrl != "") {
        url = "/images/addresses/thumbnails/" + address.avatarUrl;
    }
    return url;
};
const toggleBanAddress = (walletAddress_1, ...args_1) => __awaiter(void 0, [walletAddress_1, ...args_1], void 0, function* (walletAddress, isBanned = false) {
    const result = yield fetch("toggle-address-ban", {
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
        return;
    }
    $(".shortMessage").innerHTML = `
    <div class="quickText"><h2 style="color: ${result.isBanned ? "red" : "green"}">
      USER ${result.isBanned ? "BANNED" : "UNBANNED"}
    </h2></div>
  `;
    const btn = $(`#ban-address-${walletAddress}`);
    btn.classList.toggle("banned");
});
export { getAddressAvatar, getAddressAvatarPostDefault, toggleBanAddress };
//# sourceMappingURL=address.js.map