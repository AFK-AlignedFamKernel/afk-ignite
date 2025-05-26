import { cairo, CallData, constants, Contract } from "starknet";
import { Account } from "starknet";
import { AUSD_ADDRESSES, BACKED_USD_ADDRESSES, ESCROW_ADDRESS, TOKENS_ADDRESS, USDC_ADDRESSES } from "../../constants";
import { prepareAndConnectContract } from "../../utils/contract";
import { formatFloatToUint256 } from "../../utils/format";
import { provider } from "../../utils/starknet";

export const adminSetTokenCollateral = async (props: {
    account: Account;
    amount: number;
    tokenAddress: string;
    contractAddress: string;
    recipient: string;
    tokenIdFelt: string;
}) => {

    try {


        const { account, amount, tokenAddress, contractAddress, recipient, tokenIdFelt } = props;
        const amountUint256 = (formatFloatToUint256(Number(amount)) ?? Number(amount) * 10 ** 18);

        console.log("contractAddress", contractAddress);
        console.log("amountUint256", amountUint256);

        console.log("tokenAddress", tokenAddress);
        console.log("recipient", recipient);
   
        const setTokenCollateralData = [
            tokenAddress,
            true,
            true,
            true,
            cairo.uint256(0),
            cairo.uint256(0),
            tokenIdFelt,
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


const tokenIdEth = "19514442401534788";
const tokenIdUsdc = "6004514686061859652";


adminSetTokenCollateral({
    account: account,
    amount: 0.0001,
    recipient: accountAddress0,
    tokenAddress: TOKENS_ADDRESS.SEPOLIA.ETH,
    contractAddress: BACKED_USD_ADDRESSES[constants.StarknetChainId.SN_SEPOLIA],
    tokenIdFelt: tokenIdEth,
})