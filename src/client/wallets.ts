import { $ } from "./ui.js";
import { closeModal, showModal } from "./modal.js";

declare global {
  interface Window {
    phantom: any;
    trustWallet: any;
    solflare: any;
  }
}

const getAllAvailableWallets = (): any[] => {
  let wallets: any[] = [];
  const trustWallet = {
    name: "Trust Wallet",
    logo: "/svgs/walletconnect.svg",
    adapter: window?.trustWallet?.solana,
    forced: true,
  };

  if (window?.phantom?.solana) {
    wallets.push({
      name: "Phantom",
      logo: "/svgs/phantom.svg",
      style: "background-color: #AB9FF2; color: white",
      adapter: window.phantom.solana,
    });
  }
  if (window?.trustWallet?.solana) {
    wallets.push({ ...trustWallet, forced: false });
  }
  if (window?.solflare) {
    wallets.push({
      name: "Solflare",
      logo: "/img/solflare.png",
      adapter: window.solflare,
    });
  }

  if (wallets.length == 0) {
    wallets.push(trustWallet);
  }

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
  }
};

const connectToWallet = async (walletName: string) => {
  const wallet = getAllAvailableWallets().filter(
    (wallet: any) => wallet.name == walletName
  )[0];

  if (!wallet) {
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
        style="${wallet.style}"><img src="${wallet.logo}" /> 
        ${wallet.name}
      </button>
    `;
    ui.push(html);
  }

  const walletInstallationGuide = showInstallationGuide
    ? `
      <h1 style="color: white">Install wallets extention for your browser</h1>
    `
    : "";

  return `${walletInstallationGuide} ${ui.join("")}`;
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
