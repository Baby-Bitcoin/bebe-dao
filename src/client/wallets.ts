import { $ } from "./ui.js";
import { closeModal, showModal } from "./modal.js";
import { browserType } from "./utilities.js";

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
    const loginButton = $("#login>span");
    loginButton.innerHTML = "Connect Wallet";
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
        `<h1>There is no ${browserType()} extension for ${walletName}<h1>`
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
    $("#logout").classList.remove("hide");
    $("#account").classList.remove("hide");
    $("#add").style.display = "block";
    const publicKey = wallet.adapter.publicKey.toBase58();
    avatarName.innerHTML = publicKey;
    localStorage.setItem("publicKey", publicKey);
    localStorage.setItem("connectedWallet", walletName);
    const body: any = JSON.stringify({
      address: publicKey,
    });

    const result = await fetch("/address-info", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body,
    });
  }
};

const checkSession = () => {
  const connectedWalletName = localStorage.getItem("connectedWallet");
  if (!connectedWalletName) {
    return;
  }
  connectToWallet(connectedWalletName);
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
    <p style="color: white">
      We encourage using Chrome or Firefox browsers for better wallet support.
      </br>
      WalletConnect is not supported at the moment.
  </p>`;
  return `${ui.join("")} ${footer}`;
};

let initialized: boolean = false;
document.onreadystatechange = () => {
  if (document.readyState === "complete" && !initialized) {
    initialized = true;
    const loginButton = $("#login");
    const logoutButton = $("#logout");

    loginButton.addEventListener("click", () => {
      showModal(buildWalletsUI());
    });
    logoutButton.addEventListener("click", () => disconnectWallet());

    $("#wallets .modal_close").addEventListener("click", (e: Event) => {
      closeModal();
    });

    checkSession();
  }
};

globalThis.connectToWallet = connectToWallet;

export { disconnectWallet, getAllAvailableWallets };
