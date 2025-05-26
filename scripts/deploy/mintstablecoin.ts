import { provider } from "../utils/starknet";
import { Account, constants } from "starknet";
import { ESCROW_ADDRESS, TOKENS_ADDRESS } from "../constants";
import dotenv from "dotenv";
import { createMintStablecoin } from "../utils/mintstablecoin";
import { prepareAndConnectContract } from "../utils/contract";
dotenv.config();

export const deployMintStablecoin = async (tokenAddress: string,
  name?: string,
  symbol?: string,
  decimals?: number,
  tokenIdProps?: string) => {
  let escrow_address: string | undefined = ESCROW_ADDRESS[
    constants.StarknetChainId.SN_SEPOLIA
  ] as any; // change default address
  console.log("deploy keys");
  const privateKey0 = process.env.DEV_PK as string;
  const accountAddress0 = process.env.DEV_PUBLIC_KEY as string;
  const account = new Account(provider, accountAddress0, privateKey0, "1");

  // Sepolia PRAGMA Address
  const PRAGMA_ADDRESS = process.env.PRAGMA_ADDRESS as string ?? "0x36031daa264c24520b11d93af622c848b2499b66b41d611bac95e13cfca131a";
  const PRAGMA_STATISTIC_ADDRESS = process.env.PRAGMA_STATISTIC_ADDRESS as string ?? "0x6421fdd068d0dc56b7f5edc956833ca0ba66b2d5f9a8fea40932f226668b5c4";

  const tokenId = tokenIdProps ?? process.env.TOKEN_ID as string ?? "6004514686061859652";

  // 6004514686061859652// STRK USD
  const token_address = tokenAddress;
  let escrow;
  if (process.env.IS_DEPLOY_CONTRACT == "true") {
    let escrowContract = await createMintStablecoin(
      PRAGMA_ADDRESS,
      PRAGMA_STATISTIC_ADDRESS,
      name ?? "AFK Deposit Escrow",
      symbol ?? "AFK",
      accountAddress0,
      decimals ?? 18,
      token_address,
      tokenId,
    );
    console.log("mint stablecoin address", escrowContract?.contract_address);
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

deployMintStablecoin(TOKENS_ADDRESS.SEPOLIA.STRK,
  "abUSD",
  "aligned Backed USD",
  6,
  "6004514686061859652" // STRK/usd
);

// deployEscrow(TOKENS_ADDRESS.SEPOLIA.ETH);
