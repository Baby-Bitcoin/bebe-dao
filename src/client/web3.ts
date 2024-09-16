// import { BEBE_MINT_ADDRESS, RPC_URL, WSOLMint } from "./config.js";

// const web3 = globalThis.solanaWeb3;
// const connection = new web3.Connection(RPC_URL);
// const LAMPORTS_PER_SOL = web3.LAMPORTS_PER_SOL;
// const TOKEN_PROGRAM_ID = new web3.PublicKey(
//   "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
// );

// const uiAmountFromAccount = (account: any) => {
//   return account.account.data.parsed.info.tokenAmount.uiAmount;
// };

// const mintFromAccount = (account: any) => {
//   return account.account.data.parsed.info.mint;
// };

// const programAccounts = async (
//   publicKey: string,
//   includeZeros: boolean = false
// ) => {
//   try {
//     const filters = [
//       {
//         dataSize: 165,
//       },
//       {
//         memcmp: {
//           offset: 32,
//           bytes: publicKey,
//         },
//       },
//     ];

//     return Promise.all([
//       connection
//         .getBalance(new web3.PublicKey(publicKey))
//         .then((balance: number) => {
//           return {
//             isSOL: true,
//             pubkey: WSOLMint,
//             account: {
//               data: {
//                 parsed: {
//                   info: {
//                     mint: WSOLMint,
//                     tokenAmount: {
//                       uiAmount: balance / LAMPORTS_PER_SOL,
//                       decimals: 9,
//                     },
//                   },
//                 },
//               },
//             },
//           };
//         }),
//       connection
//         .getParsedProgramAccounts(TOKEN_PROGRAM_ID, {
//           filters,
//         })
//         .then((accounts: any) => {
//           return accounts
//             .filter((a: any) => includeZeros || uiAmountFromAccount(a) != 0)
//             .sort((a: any, b: any) => {
//               let amountA = uiAmountFromAccount(a);
//               let amountB = uiAmountFromAccount(b);
//               if (amountA < 0.00001) {
//                 amountA = 0;
//               }
//               if (amountB < 0.00001) {
//                 amountB = 0;
//               }

//               return (
//                 amountB - amountA ||
//                 mintFromAccount(a).localeCompare(mintFromAccount(b))
//               );
//             });
//         }),
//     ]).then((res) => {
//       return [res[0], ...res[1]];
//     });
//   } catch (error) {
//     return [];
//   }
// };

// const getTokenBalance = async (walletAdress: string) => {
//   try {
//     const accounts = await programAccounts(walletAdress);
//     const mintAccount = accounts.filter(
//       (account) => mintFromAccount(account) == BEBE_MINT_ADDRESS
//     )[0];
//     return uiAmountFromAccount(mintAccount);
//   } catch (error) {
//     return 0;
//   }
// };

// export { connection, getTokenBalance };
