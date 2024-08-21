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
  if (window?.phantom?.solana) {
    wallets.push({
      name: "Phantom",
      logo: "/svgs/phantom.svg",
      style: "background-color: #AB9FF2; color: white",
      adapter: window.phantom.solana,
    });
  }
  if (window?.trustWallet?.solana) {
    wallets.push({
      name: "Trust Wallet",
      logo: "/svgs/walletconnect.svg",
      adapter: window.trustWallet.solana,
    });
  }
  if (window?.solflare) {
    wallets.push({
      name: "Solflare",
      logo: "/img/solflare.png",
      adapter: window.solflare,
    });
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
    avatarName.innerHTML = "";
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
    avatarName.innerHTML = wallet.adapter.publicKey.toBase58();
  }
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

    $("#modal .modal_close").addEventListener("click", (e: Event) => {
      closeModal();
    });
  }
};

const buildWalletsUI = () => {
  const wallets = getAllAvailableWallets();
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

  return ui.join("");
};

globalThis.connectToWallet = connectToWallet;

export { disconnectWallet, getAllAvailableWallets };
