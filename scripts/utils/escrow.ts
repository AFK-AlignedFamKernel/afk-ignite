import { Account, json, Contract, cairo, uint256, byteArray, CallData } from "starknet";
import fs from "fs";
import dotenv from "dotenv";
import { provider } from "./starknet";
import path from "path";

dotenv.config();
const PATH_SOCIAL_ACCOUNT = path.resolve(
  __dirname,
  "../../onchain/target/dev/afk_ignite_DepositEscrow.contract_class.json"
);
const PATH_SOCIAL_ACCOUNT_COMPILED = path.resolve(
  __dirname,
  "../../onchain/target/dev/afk_ignite_DepositEscrow.compiled_contract_class.json"
);

/** @TODO spec need to be discuss. This function serve as an example */
export const createEscrowAccount = async (
  name: string,
  symbol: string,
  initial_supply: number,
  recipient: string,
  decimals: number,
  token_address: string,
) => {
  try {
    // initialize existing predeployed account 0 of Devnet
    const privateKey0 = process.env.DEV_PK as string;
    const accountAddress0 = process.env.DEV_PUBLIC_KEY as string;

    // Devnet or Sepolia account
    const account0 = new Account(provider, accountAddress0, privateKey0, "1");
    let EscrowClassHash = process.env.ESCROW_CLASS_HASH as string;

    const compiledSierraAAaccount = json.parse(
      fs.readFileSync(PATH_SOCIAL_ACCOUNT).toString("ascii")
    );
    const compiledAACasm = json.parse(
      fs.readFileSync(PATH_SOCIAL_ACCOUNT_COMPILED).toString("ascii")
    );
    /** Get class hash account */

    // const ch = hash.computeSierraContractClassHash(compiledSierraAAaccount);
    // const compCH = hash.computeCompiledClassHash(compiledAACasm);
    // let pubkeyUint = pubkeyToUint256(nostrPublicKey);

    //Devnet
    // //  fund account address before account creation
    // const { data: answer } = await axios.post(
    //   "http://127.0.0.1:5050/mint",
    //   {
    //     address: AAcontractAddress,
    //     amount: 50_000_000_000_000_000_000,
    //     lite: true,
    //   },
    //   { headers: { "Content-Type": "application/json" } }
    // );
    // console.log("Answer mint =", answer);

    // deploy account

    // const AAaccount = new Account(provider, AAcontractAddress, AAprivateKey);
    /** @description uncomment this to declare your account */
    // console.log("declare account");

    const constructorCalldata = CallData.compile([{
      name: byteArray.byteArrayFromString(name),
      symbol: byteArray.byteArrayFromString(symbol),
      initial_supply: uint256.bnToUint256(BigInt(initial_supply)),
      recipient: recipient,
      decimals: decimals,
      token_address: token_address,
    }])
    if (process.env.REDECLARE_CONTRACT == "true") {
      console.log("try declare account");
      const declareResponse = await account0.declare({
        contract: compiledSierraAAaccount,
        casm: compiledAACasm,
      });
      console.log("Declare deploy", declareResponse?.transaction_hash);
      await provider.waitForTransaction(declareResponse?.transaction_hash);
      const contractClassHash = declareResponse.class_hash;
      EscrowClassHash = contractClassHash;

      const nonce = await account0?.getNonce();
      console.log("nonce", nonce);
    }

    const { transaction_hash, contract_address } =
      await account0.deployContract({
        classHash: EscrowClassHash,
        constructorCalldata: constructorCalldata,
      });

    console.log("transaction_hash", transaction_hash);
    console.log("contract_address", contract_address);
    let tx = await account0?.waitForTransaction(transaction_hash);

    console.log("Tx deploy", tx);
    await provider.waitForTransaction(transaction_hash);
    console.log(
      "✅ New contract Escrow created.\n   address =",
      contract_address
    );

    // const contract = new Contract(compiledSierraAAaccount, contract_address, account0)
    return {
      contract_address,
      tx,
      // contract
    };
  } catch (error) {
    console.log("Error createEscrowAccount= ", error);
  }
};

export const deposit = async (props: {
  escrow: Contract;
  account: Account;
  amount: number;
  tokenAddress: string;
  timelock: number;
  alicePublicKey: string;
}) => {
  try {
    const { escrow, account, amount, tokenAddress, timelock, alicePublicKey } =
      props;
    const depositParams = {
      amount: uint256.bnToUint256(BigInt("0x" + amount)), // amount float. cairo.uint256(amount) for Int
      // Float need to be convert with bnToUint
      token_address: tokenAddress, // token address
      nostr_recipient: cairo.uint256(BigInt("0x" + alicePublicKey)),
      timelock: timelock,
    };


    console.log("depositParams", depositParams);

    let approveCall = {
      contractAddress: tokenAddress,
      // calldata: [escrow?.address, amount],
      calldata: CallData.compile([escrow?.address, depositParams.amount]),
      entrypoint: "approve",
    }
    let depositCall = {
        contractAddress: escrow?.address,
        calldata: CallData.compile(depositParams),
        entrypoint: "deposit",
    }
    const tx = await account.execute([approveCall, depositCall]);

    await account.waitForTransaction(tx.transaction_hash);

    return tx;
  } catch (e) {
    console.log("Error deposit", e);
  }
};
