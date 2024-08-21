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

// Login in function that is called when the login button is clicked
const connectWallet = async () => {
  const availableWallets = getAllAvailableWallets();
  console.log("connectWallet2222", availableWallets);
  return;
  // const { link: localLink, session: localSession } = await ProtonWebSDK({
  //   // linkOptions is a required part of logging in with the protonWebSDK(), within
  //   // the options, you must have the chain API endpoint array, a chainID that matches the chain your API
  //   // endpoint is on, and restoreSession option that is passed to determine if there is
  //   // an existing session that needs to be saved or if a new session needs to be created.
  //   linkOptions: {
  //     endpoints,
  //     chainId,
  //     restoreSession,
  //   },
  //   // The account that is requesting the transaction with the client
  //   transportOptions: {
  //     requestAccount: appIdentifier,
  //   },
  //   // This is the wallet selector style options available
  //   selectorOptions: {
  //     appName: "SHIELD",
  //     appLogo: "/svgs/SHIELD-logo.svg",
  //     customStyleOptions: {
  //       modalBackgroundColor: "#F4F7FA",
  //       logoBackgroundColor: "white",
  //       isLogoRound: false,
  //       optionBackgroundColor: "white",
  //       optionFontColor: "#0274f9",
  //       primaryFontColor: "#012453",
  //       secondaryFontColor: "#6B727F",
  //       linkColor: "#0274f9",
  //     },
  //   },
  // });

  // link = localLink;
  // session = localSession;

  // if (localSession) {
  //   user = localSession.auth.actor;
  //   avatarName.textContent = user;
  //   $("#add").style.display = "block";
  //   $("#menu-options").classList.add("authenticated");

  //   if (restoreSession) {
  //     userInfo(user, false);
  //   } else {
  //     userInfo(user, true);
  //     location.reload();
  //   }
  // }
};

// Logout function sets the link and session back to original state of undefined
const disconnectWallet = async (walletName: string) => {
  const wallet = getAllAvailableWallets().filter(
    (wallet: any) => wallet.name == walletName
  )[0];

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
      connectWallet();
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

export { connectWallet, disconnectWallet, getAllAvailableWallets };
