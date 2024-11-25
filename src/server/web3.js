const { BEBE_MINT_ADDRESS, RPC_URL, WSOLMint } = require('./configs.js');
const { PublicKey, Connection, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');

const connection = new Connection(RPC_URL);

// Helper to extract uiAmount from a parsed account
const uiAmountFromAccount = (account) => {
  return account.account.data.parsed.info.tokenAmount.uiAmount;
};

// Helper to extract the mint address from a parsed account
const mintFromAccount = (account) => {
  return account.account.data.parsed.info.mint;
};

// Function to retrieve both SOL balance and token accounts for a given publicKey
const programAccounts = async (publicKey, includeZeros = false) => {
  try {
    const filters = [
      {
        dataSize: 165, // Token accounts have a data size of 165 bytes
      },
      {
        memcmp: {
          offset: 32, // Offset to check for owner in a token account
          bytes: publicKey,
        },
      },
    ];

    // Fetch SOL balance and token accounts
    return Promise.all([
      connection.getBalance(new PublicKey(publicKey)).then((balance) => {
        return {
          isSOL: true,
          pubkey: WSOLMint,
          account: {
            data: {
              parsed: {
                info: {
                  mint: WSOLMint,
                  tokenAmount: {
                    uiAmount: balance / LAMPORTS_PER_SOL,
                    decimals: 9,
                  },
                },
              },
            },
          },
        };
      }),
      connection.getParsedProgramAccounts(TOKEN_PROGRAM_ID, { filters }).then((accounts) => {
        return accounts
          .filter((account) => includeZeros || uiAmountFromAccount(account) !== 0)
          .sort((a, b) => {
            let amountA = uiAmountFromAccount(a);
            let amountB = uiAmountFromAccount(b);
            if (amountA < 0.00001) amountA = 0;
            if (amountB < 0.00001) amountB = 0;

            return (
              amountB - amountA || mintFromAccount(a).localeCompare(mintFromAccount(b))
            );
          });
      }),
    ]).then((results) => {
      return [results[0], ...results[1]]; // SOL balance followed by token accounts
    });
  } catch (error) {
    console.error("Error fetching program accounts:", error);
    return [];
  }
};

// Function to fetch the token balance for BEBE mint for a specific wallet address
const getTokenBalance = async (walletAddress) => {
  try {
    const accounts = await programAccounts(walletAddress);
    const mintAccount = accounts.find(
      (account) => mintFromAccount(account) === BEBE_MINT_ADDRESS
    );
    return mintAccount ? uiAmountFromAccount(mintAccount) : 0;
  } catch (error) {
    const errorMessage = error.message.split(":").slice(0, 2).join(":"); // Limit the error message to the first 2 lines
    console.error(`${errorMessage}`);
    return 0;
  }
};



/**
 * Parses `[BEBE]wallet_address[/BEBE]` syntax and replaces with wallet balances.
 * @param {string} description - Post description with placeholders.
 * @returns {Promise<string>} - Updated description with wallet balances.
 */
const parseBalancePlaceholder = async (description) => {
  const matches = description.match(/\[BEBE\](.*?)\[\/BEBE\]/g);

  if (!matches) return description;

  for (const match of matches) {
    const walletAddress = match.replace(/\[BEBE\]|\[\/BEBE\]/g, "");
    const balance = await getTokenBalance(walletAddress);
    const balanceString = `Balance of ${walletAddress} is: ${balance} BEBE`;
    description = description.replace(match, balanceString);
  }

  return description;
};

module.exports = { connection, getTokenBalance, parseBalancePlaceholder };
