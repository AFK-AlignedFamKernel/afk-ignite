import { cairo, CallData, constants, Contract } from "starknet";
import { Account } from "starknet";
import { AUSD_ADDRESSES, ESCROW_ADDRESS, USDC_ADDRESSES } from "../../constants";
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
            cairo.uint256(0),
            cairo.uint256(0),
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


const privateKey0 = process.env.DEV_PK as string;
const accountAddress0 = process.env.DEV_PUBLIC_KEY as string;
const account = new Account(provider, accountAddress0, privateKey0, "1");



adminSetTokenCollateral({
    account: account,
    amount: 0.0001,
    recipient: accountAddress0,
    tokenAddress: USDC_ADDRESSES[constants.StarknetChainId.SN_SEPOLIA],
    contractAddress: AUSD_ADDRESSES[constants.StarknetChainId.SN_SEPOLIA],
})