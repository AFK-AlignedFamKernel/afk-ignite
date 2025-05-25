import { CallData, constants, Contract } from "starknet";
import { Account } from "starknet";
import { AUSD_ADDRESSES, ESCROW_ADDRESS, USDC_ADDRESSES } from "../../constants";
import { prepareAndConnectContract } from "../../utils/contract";
import { formatFloatToUint256 } from "../../utils/format";
import { provider } from "../../utils/starknet";

export const deposit = async (props: {
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

        const { abi: testAbi } = await provider.getClassAt(tokenAddress);
        if (testAbi === undefined) {
            throw new Error('no abi.');
        }
        const erc20Contract = new Contract(testAbi, tokenAddress, provider);
        console.log("erc20Contract", erc20Contract);

        const balance = await erc20Contract.balance_of(recipient);
        const allowance = await erc20Contract.allowance(recipient, contractAddress);

        console.log("balance", balance);
        console.log("allowance", allowance);

        const allowanceRevert = await erc20Contract.allowance(contractAddress, recipient);
        console.log("allowanceRevert", allowanceRevert);

        
        const depositData = [
            recipient ?? account?.address,
            amountUint256,
            tokenAddress,
        ]


        const depositCalldata = CallData.compile(depositData);


        const tx = await account?.execute([
            {
                contractAddress: tokenAddress,
                entrypoint: 'approve',
                calldata: approveCalldata,
            },
            {
                contractAddress,
                entrypoint: 'deposit',
                calldata: depositCalldata,
            },
        ]);
        return tx;
    } catch (error) {

        console.error("Error depositing", error);
    }
}


const privateKey0 = process.env.DEV_PK as string;
const accountAddress0 = process.env.DEV_PUBLIC_KEY as string;
const account = new Account(provider, accountAddress0, privateKey0, "1");



deposit({
    account: account,
    amount: 0.0001,
    recipient: accountAddress0,
    tokenAddress: USDC_ADDRESSES[constants.StarknetChainId.SN_SEPOLIA],
    contractAddress: AUSD_ADDRESSES[constants.StarknetChainId.SN_SEPOLIA],
})