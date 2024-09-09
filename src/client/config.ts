const __DEV__ = true;
const RPC_URL =
  "https://winter-capable-firefly.solana-mainnet.quiknode.pro/7c742bf076d345847ec8ed4289607694598df0b8/";
const BEBE_MINT_ADDRESS = "HRzN8zrPp6HT8nmHoRrDpGbhVnFbbya5cMzaVGWVpump";
const BEBE_SYMBOL = "BEBE";
const WSOLMint = "So11111111111111111111111111111111111111112";
const MINI_TOKEN_BALANCE_FOR_POST = __DEV__ ? 0 : 100;
const MINI_TOKEN_BALANCE_FOR_VOTE = __DEV__ ? 0 : 100;

export {
  RPC_URL,
  BEBE_MINT_ADDRESS,
  BEBE_SYMBOL,
  WSOLMint,
  MINI_TOKEN_BALANCE_FOR_POST,
  MINI_TOKEN_BALANCE_FOR_VOTE,
};
