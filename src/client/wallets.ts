import { $, $$ } from "./ui.js";
import { closeModal, showModal } from "./modal.js";
import { browserType, prettifyNumber } from "./utilities.js";
import { getTokenBalance } from "./web3.js";
import { BEBE_MINT_ADDRESS } from "./config.js";
import { checkFileProperties, handleUploadedFile } from "./image-select.js";

declare global {
  interface Window {
    phantom: any;
    trustWallet: any;
    solflare: any;
    walletConnect: any;
  }
}

const getWalletExtensionDownloadUrl = (walletName: string): string | null => {
  const bank = {
    Chrome: {
      Phantom:
        "https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa?hl=en",
      Solflare:
        "https://chromewebstore.google.com/detail/solflare-wallet/bhhhlbepdkbapadjdnnojkbgioiodbic?hl=en",
      "Trust Wallet":
        "https://chromewebstore.google.com/detail/trust-wallet/egjidjbpglichdcondbcbdnbeeppgdph",
    },
    Firefox: {
      Phantom: "https://addons.mozilla.org/en-US/firefox/addon/phantom-app/",
      Solflare:
        "https://addons.mozilla.org/en-US/firefox/addon/solflare-wallet/",
    },
  };

  return bank[browserType()]?.[walletName];
};

const getAllAvailableWallets = (): any[] => {
  const wallets: any[] = [
    {
      name: "Phantom",
      logo: "/svgs/phantom.svg",
      style: "background-color: #AB9FF2; color: white",
      adapter: window?.phantom?.solana,
      extensionUrl: getWalletExtensionDownloadUrl("Phantom"),
    },
    {
      name: "Solflare",
      logo: "/img/solflare.png",
      adapter: window?.solflare,
      extensionUrl: getWalletExtensionDownloadUrl("Solflare"),
    },
    {
      name: "Trust Wallet",
      logo: "/svgs/trust.svg",
      adapter: window?.trustWallet?.solana,
      extensionUrl: getWalletExtensionDownloadUrl("Trust Wallet"),
    },
    {
      name: "WalletConnect",
      logo: "/svgs/walletconnect.svg",
      adapter: window?.walletConnect?.solana,
      extensionUrl: getWalletExtensionDownloadUrl("WalletConnect"),
    },
  ];

  return wallets;
};

const disconnectWallet = async (walletName: string = "") => {
  const wallets = getAllAvailableWallets();

  // disconnect from all
  if (walletName == "") {
    for (const wallet of wallets) {
      disconnectWallet(wallet.name);
    }
    return;
  }
  const wallet = wallets.filter((wallet: any) => wallet.name == walletName)[0];

  if (!wallet) {
    return;
  }

  const disconnected = await wallet.adapter.disconnect();

  if (disconnected) {
    closeModal();
    const avatarName = $("#avatar-name");
    avatarName.innerHTML = "Connect wallet";
    $("#logout").classList.add("hide");
    $("#account").classList.add("hide");
    $("#add").style.display = "";
    const avatarImage = $(".avatar-container img") as HTMLImageElement;
    avatarImage.src = "/svgs/user.svg";
    const loginButton = $("#login>span");
    loginButton.innerHTML = "Connect Wallet";
    $("#stats b").innerHTML = "0.00 BEBE";
    localStorage.removeItem("publicKey");
    localStorage.removeItem("connectedWallet");
  }
};

const connectToWallet = async (walletName: string) => {
  const wallet = getAllAvailableWallets().filter(
    (wallet: any) => wallet.name == walletName
  )[0];

  if (!wallet) {
    return;
  }

  if (!wallet.adapter) {
    if (!wallet.extensionUrl) {
      showModal(
        `<div class="overlayMessage">There is no ${browserType()} extension for ${walletName}.<div>`
      );
      return;
    }
    globalThis.open(wallet.extensionUrl, "_blank").focus();
    return;
  }

  const connected = await wallet.adapter.connect();
  if (connected) {
    closeModal();
    const avatarName = $("#avatar-name");
    $("#login span").textContent = 'Switch Wallet'
    $("#logout").classList.remove("hide");
    $("#account").classList.remove("hide");
    $("#add").style.display = "block"; // on submit for Post we need to check min balance
    const publicKey = wallet.adapter.publicKey.toBase58();
    avatarName.innerHTML = publicKey;
    localStorage.setItem("publicKey", publicKey);
    localStorage.setItem("connectedWallet", walletName);
    const body: any = JSON.stringify({
      address: publicKey,
    });
    refreshTokenBalance();
    await fetch("/address-info", {
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
};

const updateAvatarSrcAndUserName = (
  userName: string,
  address: string,
  avatarSrc: string
) => {
  const usernameInput = $("#usernameInput") as HTMLInputElement;
  usernameInput.value = userName || "";
  const userNameElements = $$(".userName") as NodeListOf<HTMLElement>;

  userNameElements.forEach((el) => {
    el.textContent = userName || address;
  });

  const avatarElements = $$(".userAvatar") as NodeListOf<HTMLImageElement>;

  const source = avatarSrc
    ? `/images/addresses/thumbnails/${avatarSrc}`
    : "/svgs/user.svg";
  avatarElements.forEach((img) => {
    img.src = source;
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

  return getAllAvailableWallets().filter(
    (wallet) => wallet.name == walletName
  )[0];
};

const buildWalletsUI = () => {
  const wallets = getAllAvailableWallets();
  const showInstallationGuide =
    wallets.filter((wallet) => wallet.forced).length > 0;
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

const bebeTokenBalance = async () => {
  try {
    return await getTokenBalance(
      localStorage.getItem("publicKey"),
      BEBE_MINT_ADDRESS
    );
  } catch (error) {
    return 0;
  }
};

const refreshTokenBalance = async () => {
  let balance = 0;
  if (localStorage.getItem("publicKey")) {
    balance = await bebeTokenBalance();
  }

  const balanceTag = $("#balance>b");

  if (balanceTag) {
    balanceTag.innerHTML = `${prettifyNumber(balance)} BEBE`;
  }
};

const handleProfileHeader = () => {
  $("#account").addEventListener("click", (e) => {
    ($("#profile") as any).style = "display: block !important";
  });

  $("#profile .modal_close").addEventListener("click", (e) => {
    ($("#profile") as any).style = "";
  });

  $("#profile-form").addEventListener("change", (event) => {
    // check file selected
    let theFile;
    if ((event.target as any).files) {
      theFile = (event.target as any).files[0];
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

  $("#wallets .modal_close").addEventListener("click", (e: Event) => {
    closeModal();
  });

  $("#profile").addEventListener("submit", async (event) => {
    event.preventDefault();

    const image: any = $("#avatar-image");
    const username: any = $("#usernameInput");
    const email: any = $("#email");
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
    const result = await fetch("/address-info-form", {
      method: "POST",
      body: formData,
    }).then((res) => res.json());
    result.address ? ($("#profile").style.display = "") : null;
    $("#loader").style.display = "none";

    updateAvatarSrcAndUserName(
      result.username || "",
      result.address,
      result.avatarUrl
    );
  });
};

startup();
globalThis.connectToWallet = connectToWallet;

export {
  connectToWallet,
  disconnectWallet,
  getAllAvailableWallets,
  bebeTokenBalance,
  buildWalletsUI,
};
