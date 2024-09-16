var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
function getTokenBalance(walletAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const walletPublicKey = new PublicKey(walletAddress);
        const tokenPublicKey = new PublicKey('HRzN8zrPp6HT8nmHoRrDpGbhVnFbbya5cMzaVGWVpump');
        // Find the associated token account for the wallet address and the token mint
        const [associatedTokenAddress] = yield PublicKey.findProgramAddress([
            walletPublicKey.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            tokenPublicKey.toBuffer(),
        ], TOKEN_PROGRAM_ID);
        try {
            const connection = getWeb3Connection();
            // Get token account info using the associated token address
            const tokenAccount = yield getAccount(connection, associatedTokenAddress);
            // Return the token balance (amount) as a number
            return Number(tokenAccount.amount);
        }
        catch (error) {
            throw new Error(`Failed to get token balance: ${error.message}`);
        }
    });
}
module.exports = { getTokenBalance };
// Example usage (You can test this part):
// (async () => {
//   try {
//     const balance = await getTokenBalance('87AQ5gem6zAXHjCDj6csAF9qjhEWkspxtLmF7a7dteGD');
//     console.log(`Token balance: ${balance}`);
//   } catch (error) {
//     console.error(error);
//   }
// })();
//# sourceMappingURL=web3.js.map