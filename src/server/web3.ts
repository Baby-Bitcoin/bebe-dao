const { Connection, PublicKey } = require('@solana/web3.js');
const { getAccount, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const dotenv = require('dotenv');

dotenv.config();

// Function to get the shared connection
const getWeb3Connection = () => {
    const connectionUrl = 'https://winter-capable-firefly.solana-mainnet.quiknode.pro/7c742bf076d345847ec8ed4289607694598df0b8/';
    return new Connection(connectionUrl, 'confirmed');
};

/**
 * Fetches the token balance of an SPL token for a given Solana address.
 *
 * @param walletAddress - The Solana wallet address to check the balance for.
 * @returns {Promise<number>} The token balance.
 */
async function getTokenBalance(walletAddress) {
  const walletPublicKey = new PublicKey(walletAddress);
  const tokenPublicKey = new PublicKey('HRzN8zrPp6HT8nmHoRrDpGbhVnFbbya5cMzaVGWVpump');

  // Find the associated token account for the wallet address and the token mint
  const [associatedTokenAddress] = await PublicKey.findProgramAddress(
    [
      walletPublicKey.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      tokenPublicKey.toBuffer(),
    ],
    TOKEN_PROGRAM_ID
  );

  try {
    const connection = getWeb3Connection();
    // Get token account info using the associated token address
    const tokenAccount = await getAccount(connection, associatedTokenAddress);

    // Return the token balance (amount) as a number
    return Number(tokenAccount.amount);
  } catch (error) {
    throw new Error(`Failed to get token balance: ${error.message}`);
  }
}

module.exports = {getTokenBalance};
// Example usage (You can test this part):
// (async () => {
//   try {
//     const balance = await getTokenBalance('87AQ5gem6zAXHjCDj6csAF9qjhEWkspxtLmF7a7dteGD');
//     console.log(`Token balance: ${balance}`);
//   } catch (error) {
//     console.error(error);
//   }
// })();
