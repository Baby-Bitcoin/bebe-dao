const dotenv = require('dotenv');
dotenv.config({
  path: ".env",
});
const ADMINS = process.env.ADMINS ? JSON.parse(process.env.ADMINS) : [];
const FORBIDDEN_USERNAMES = process.env.FORBIDDEN_USERNAMES
  ? JSON.parse(process.env.FORBIDDEN_USERNAMES)
  : [];
const BEBE_MINT_ADDRESS = "HRzN8zrPp6HT8nmHoRrDpGbhVnFbbya5cMzaVGWVpump";
const WSOLMint = "So11111111111111111111111111111111111111112";
const RPC_URL = process.env.SOLANA_ENDPOINT;

module.exports = { ADMINS, FORBIDDEN_USERNAMES, BEBE_MINT_ADDRESS, WSOLMint, RPC_URL };
