declare global {
  interface Window {
    phantom: any;
    trustWallet: any;
    solflare: any;
    walletConnect: any;
    connectToWallet: Function;
  }
}

export { global };
