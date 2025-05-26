import { CallData, constants, Contract } from "starknet";
import { Account } from "starknet";
import { AUSD_ADDRESSES, BACKED_USD_ADDRESSES, ESCROW_ADDRESS, USDC_ADDRESSES } from "../../constants";
import { prepareAndConnectContract } from "../../utils/contract";
import { formatFloatToUint256 } from "../../utils/format";
import { provider } from "../../utils/starknet";

export const adminSetTokenCollateral = async (props: {
    account: Account;
    amount: number;
    tokenAddress: string;
    contractAddress: string;
    recipient: string;
}) => {

    try {


        const { account, amount, tokenAddress, contractAddress, recipient } = props;
        const amountUint256 = (formatFloatToUint256(Number(amount)) ?? Number(amount) * 10 ** 18);

        console.log("contractAddress", contractAddress);
        console.log("amountUint256", amountUint256);

        console.log("tokenAddress", tokenAddress);
        console.log("recipient", recipient);
        const approveData = [
            contractAddress,
            amountUint256,
        ]

        const approveCalldata = CallData.compile(approveData);

        const depositData = [
            recipient ?? account?.address,
            amountUint256,
            tokenAddress,
        ]

        const setTokenCollateralData = [
            tokenAddress,
            true,
            true,
            true,
            0,
            0,
        ]


        const setTokenCollateralCalldata = CallData.compile(setTokenCollateralData);


        const tx = await account?.execute([
            {
                contractAddress,
                entrypoint: 'set_token_collateral',
                calldata: setTokenCollateralCalldata,
            },
        ]);
        return tx;
    } catch (error) {

        console.error("Error adminSetTokenCollateral", error);
    }
}


export const setMintCap = async (props: {
    account: Account;
    amount: number;
    contractAddress: string;
}) => {

    try {


        const { account, amount, contractAddress } = props;
        const amountUint256 = (formatFloatToUint256(Number(amount)) ?? Number(amount) * 10 ** 18);

        console.log("contractAddress", contractAddress);
        console.log("amountUint256", amountUint256);

        const setMintCapData = [
            amountUint256,
        ]


        const setMintCapCalldata = CallData.compile(setMintCapData);


        const tx = await account?.execute([
            {
                contractAddress,
                entrypoint: 'set_mint_cap',
                calldata: setMintCapCalldata,
            },
        ]);
        return tx;
    } catch (error) {

        console.error("Error adminSetTokenCollateral", error);
    }
}


const privateKey0 = process.env.DEV_PK as string;
const accountAddress0 = process.env.DEV_PUBLIC_KEY as string;
const account = new Account(provider, accountAddress0, privateKey0, "1");



setMintCap({
    account: account,
    amount: 100_000_000,
    contractAddress: BACKED_USD_ADDRESSES[constants.StarknetChainId.SN_SEPOLIA],
})