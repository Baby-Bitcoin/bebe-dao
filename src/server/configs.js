const { env } = require("process");
const ADMINS = env.ADMINS ? JSON.parse(env.ADMINS) : [];
const FORBIDDEN_USERNAMES = env.FORBIDDEN_USERNAMES
  ? JSON.parse(env.FORBIDDEN_USERNAMES)
  : [];
const BEBE_MINT_ADDRESS = "HRzN8zrPp6HT8nmHoRrDpGbhVnFbbya5cMzaVGWVpump";
const WSOLMint = "So11111111111111111111111111111111111111112";
const RPC_URL = "https://winter-capable-firefly.solana-mainnet.quiknode.pro/7c742bf076d345847ec8ed4289607694598df0b8/";

module.exports = { ADMINS, FORBIDDEN_USERNAMES, BEBE_MINT_ADDRESS, RPC_URL, WSOLMint };
