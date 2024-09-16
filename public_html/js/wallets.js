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
import { closeModal, showModal } from "./modal.js";
import { browserType, prettifyNumber } from "./utilities.js";
import { getTokenBalance } from "./web3.js";
import { checkFileProperties, handleUploadedFile } from "./image-select.js";
const getWalletExtensionDownloadUrl = (walletName) => {
    var _a;
    const bank = {
        Chrome: {
            Phantom: "https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa?hl=en",
            Solflare: "https://chromewebstore.google.com/detail/solflare-wallet/bhhhlbepdkbapadjdnnojkbgioiodbic?hl=en",
            "Trust Wallet": "https://chromewebstore.google.com/detail/trust-wallet/egjidjbpglichdcondbcbdnbeeppgdph",
        },
        Firefox: {
            Phantom: "https://addons.mozilla.org/en-US/firefox/addon/phantom-app/",
            Solflare: "https://addons.mozilla.org/en-US/firefox/addon/solflare-wallet/",
        },
    };
    return (_a = bank[browserType()]) === null || _a === void 0 ? void 0 : _a[walletName];
};
const getAllAvailableWallets = () => {
    var _a, _b, _c;
    const wallets = [
        {
            name: "Phantom",
            logo: "/svgs/phantom.svg",
            style: "background-color: #AB9FF2; color: white",
            adapter: (_a = window === null || window === void 0 ? void 0 : window.phantom) === null || _a === void 0 ? void 0 : _a.solana,
            extensionUrl: getWalletExtensionDownloadUrl("Phantom"),
        },
        {
            name: "Solflare",
            logo: "/img/solflare.png",
            adapter: window === null || window === void 0 ? void 0 : window.solflare,
            extensionUrl: getWalletExtensionDownloadUrl("Solflare"),
        },
        {
            name: "Trust Wallet",
            logo: "/svgs/trust.svg",
            adapter: (_b = window === null || window === void 0 ? void 0 : window.trustWallet) === null || _b === void 0 ? void 0 : _b.solana,
            extensionUrl: getWalletExtensionDownloadUrl("Trust Wallet"),
        },
        {
            name: "WalletConnect",
            logo: "/svgs/walletconnect.svg",
            adapter: (_c = window === null || window === void 0 ? void 0 : window.walletConnect) === null || _c === void 0 ? void 0 : _c.solana,
            extensionUrl: getWalletExtensionDownloadUrl("WalletConnect"),
        },
    ];
    return wallets;
};
const disconnectWallet = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (walletName = "") {
    const wallets = getAllAvailableWallets();
    // disconnect from all
    if (walletName == "") {
        for (const wallet of wallets) {
            disconnectWallet(wallet.name);
        }
        return;
    }
    const wallet = wallets.filter((wallet) => wallet.name == walletName)[0];
    if (!wallet) {
        return;
    }
    const disconnected = yield wallet.adapter.disconnect();
    if (disconnected) {
        closeModal();
        const avatarName = $("#avatar-name");
        avatarName.innerHTML = "Connect wallet";
        $("#logout").classList.add("hide");
        $("#account").classList.add("hide");
        $("#add").style.display = "";
        const avatarImage = $(".avatar-container img");
        avatarImage.src = "/svgs/user.svg";
        const loginButton = $("#login>span");
        loginButton.innerHTML = "Connect Wallet";
        $("#stats b").innerHTML = "0.00 BEBE";
        localStorage.removeItem("publicKey");
        localStorage.removeItem("connectedWallet");
    }
});
const connectToWallet = (walletName) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = getAllAvailableWallets().filter((wallet) => wallet.name == walletName)[0];
    if (!wallet) {
        return;
    }
    if (!wallet.adapter) {
        if (!wallet.extensionUrl) {
            showModal(`<div class="overlayMessage">There is no ${browserType()} extension for ${walletName}.<div>`);
            return;
        }
        globalThis.open(wallet.extensionUrl, "_blank").focus();
        return;
    }
    const connected = yield wallet.adapter.connect();
    if (connected) {
        closeModal();
        const avatarName = $("#avatar-name");
        $("#login span").textContent = 'Switch Wallet';
        $("#logout").classList.remove("hide");
        $("#account").classList.remove("hide");
        $("#add").style.display = "block"; // on submit for Post we need to check min balance
        const publicKey = wallet.adapter.publicKey.toBase58();
        avatarName.innerHTML = publicKey;
        localStorage.setItem("publicKey", publicKey);
        localStorage.setItem("connectedWallet", walletName);
        const body = JSON.stringify({
            address: publicKey,
            login: "yes"
        });
        yield fetch("/address-info", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body,
        })
            .then((response) => {
            return response.json();
        })
            .then((data) => {
            // localStorage.setItem("username", data.username);
            // localStorage.setItem("avatar", data.username);
            // still need to handle local storage to save on requests ^^^^
            updateAvatarSrcAndUserName(data.username, data.address, data.avatarUrl);
        });
    }
});
const updateAvatarSrcAndUserName = (userName, address, avatarSrc) => {
    const usernameInput = $("#usernameInput");
    usernameInput.value = userName || "";
    const userNameElements = $$(".userName");
    userNameElements.forEach((el) => {
        el.textContent = userName || address;
    });
    const avatarElements = $$(".userAvatar");
    const source = avatarSrc
        ? `/images/addresses/thumbnails/${avatarSrc}`
        : "/svgs/user.svg";
    avatarElements.forEach((img) => {
        // special case for profile section avatar
        if (avatarSrc && img.classList.contains('camera')) {
            img.src = `/images/addresses/${avatarSrc}`;
        }
        else {
            img.src = source;
        }
    });
};
const checkSession = () => {
    const connectedWalletName = localStorage.getItem("connectedWallet");
    if (!connectedWalletName) {
        return;
    }
    connectToWallet(connectedWalletName);
};
const connectedWallet = () => {
    const walletName = localStorage.getItem("connectedWallet");
    return getAllAvailableWallets().filter((wallet) => wallet.name == walletName)[0];
};
const buildWalletsUI = () => {
    const wallets = getAllAvailableWallets();
    const showInstallationGuide = wallets.filter((wallet) => wallet.forced).length > 0;
    let ui = [];
    for (const wallet of wallets) {
        const html = `
      <button
        onclick="connectToWallet('${wallet.name}')"
        class="${wallet.adapter ? "available" : "disabled"}"
        style="${wallet.style ? wallet.style : ""}"><img src="${wallet.logo}" />
        ${wallet.name}
      </button>
    `;
        ui.push(html);
    }
    const footer = `
  <p class="white">
      <b class="f200">(ℹ)</b><br />For PC/Laptop, we encourage using Chrome or Firefox browsers for better wallet support.
      </br>
      WalletConnect is not supported at the moment.
  </p>`;
    return `${ui.join("")} ${footer}`;
};
const refreshTokenBalance = () => __awaiter(void 0, void 0, void 0, function* () {
    let balance = (yield getTokenBalance(localStorage.getItem("publicKey"))) || 0;
    const balanceTag = $("#balance>b");
    if (balanceTag) {
        balanceTag.innerHTML = `${prettifyNumber(balance)} BEBE`;
    }
});
const handleProfileHeader = () => {
    $("#account").addEventListener("click", (e) => {
        $("#profile").style = "display: block !important";
    });
    $("#profile .modal_close").addEventListener("click", (e) => {
        $("#profile").style = "";
    });
    $("#profile-form").addEventListener("change", (event) => {
        // check file selected
        let theFile;
        if (event.target.files) {
            theFile = event.target.files[0];
            $("#profile-form .form_error").classList.add("error");
            if (checkFileProperties(theFile, "profile-form")) {
                handleUploadedFile(theFile, "profile-form");
            }
        }
    });
};
const startup = () => {
    checkSession();
    refreshTokenBalance();
    handleProfileHeader();
    const loginButton = $("#login");
    const logoutButton = $("#logout");
    loginButton.addEventListener("click", () => {
        showModal(buildWalletsUI());
    });
    logoutButton.addEventListener("click", () => disconnectWallet());
    $("#wallets .modal_close").addEventListener("click", (e) => {
        closeModal();
    });
    $("#profile").addEventListener("submit", (event) => __awaiter(void 0, void 0, void 0, function* () {
        event.preventDefault();
        const image = $("#avatar-image");
        const username = $("#usernameInput");
        const email = $("#email");
        const wallet = connectedWallet();
        if (!image || !username || !email || !wallet) {
            return;
        }
        const formData = new FormData();
        formData.append("address", wallet.adapter.publicKey.toBase58());
        formData.append("username", username.value);
        formData.append("email", email.value);
        if (image.files[0]) {
            formData.append("avatar", image.files[0]);
        }
        $("#loader").style.display = "";
        const result = yield fetch("/address-info-form", {
            method: "POST",
            body: formData,
        }).then((res) => res.json());
        result.address ? ($("#profile").style.display = "") : null;
        $("#loader").style.display = "none";
        updateAvatarSrcAndUserName(result.username || "", result.address, result.avatarUrl);
    }));
};
startup();
globalThis.connectToWallet = connectToWallet;
export { connectToWallet, disconnectWallet, getAllAvailableWallets, buildWalletsUI, };
//# sourceMappingURL=wallets.js.map