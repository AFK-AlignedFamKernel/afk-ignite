import { provider } from "../utils/starknet";
import { Account, constants } from "starknet";
import { ESCROW_ADDRESS, TOKENS_ADDRESS, USDC_ADDRESSES } from "../constants";
import dotenv from "dotenv";
import { createPeggedCoin } from "../utils/peggedcoin";
import { prepareAndConnectContract } from "../utils/contract";
dotenv.config();

export const deployPeggedCoin = async (tokenAddress: string,
  name?: string,
  symbol?: string,
  decimals?: number) => {
  let escrow_address: string | undefined = ESCROW_ADDRESS[
    constants.StarknetChainId.SN_SEPOLIA
  ] as any; // change default address
  console.log("deploy keys");
  const privateKey0 = process.env.DEV_PK as string;
  const accountAddress0 = process.env.DEV_PUBLIC_KEY as string;
  const account = new Account(provider, accountAddress0, privateKey0, "1");


  const token_address = tokenAddress;

  console.log("token address", token_address);
  console.log("name", name);
  console.log("symbol", symbol);
  console.log("decimals", decimals);

  let escrow;
  if (process.env.IS_DEPLOY_CONTRACT == "true") {
    let escrowContract = await createPeggedCoin(
      name ?? "AFK Deposit Escrow",
      symbol ?? "AFK",
      accountAddress0,
      decimals ?? 18,
      token_address,
    );
    console.log("pegged coin address", escrowContract?.contract_address);
    if (escrowContract?.contract_address) {
      escrow_address = escrowContract?.contract_address;
      escrow = await prepareAndConnectContract(
        escrow_address ?? escrowContract?.contract_address,
        account
      );
    }
  } else {
  }

  /** TODO script to save constants address */

  return {
    escrow,
    escrow_address,
  };
};

const deployAsync = async () => {
  // await deployPeggedCoin(
  //   USDC_ADDRESSES[constants.StarknetChainId.SN_SEPOLIA],
  //   "aUSD",
  //   "aligned USDC",
  //   6);
  await deployPeggedCoin(
    USDC_ADDRESSES[constants.StarknetChainId.SN_SEPOLIA],
    "aUSD",
    "aligned USDC",
    18);
  // await deployPeggedCoin(TOKENS_ADDRESS.SEPOLIA.ETH,
  //   "aETH",
  //   "aligned ETH",
  //   18);
}

deployAsync();

// deployPeggedCoin(TOKENS_ADDRESS.SEPOLIA.USDC,
//   "aUSD",
//   "aligned USDC",
//   6);
// deployPeggedCoin(TOKENS_ADDRESS.SEPOLIA.ETH,
//   "aETH",
//   "aligned ETH",
//   18);
// deployEscrow(TOKENS_ADDRESS.SEPOLIA.ETH);
