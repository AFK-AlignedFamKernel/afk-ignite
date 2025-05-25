import { formatFloatToUint256 } from "@/utils/format";
import { useAccount } from "@starknet-react/core";
import { useQuery } from "@tanstack/react-query";
import { cairo, CallData, Contract, RpcProvider } from "starknet";

export const usePeggedCoin = ({ contractAddress }: { contractAddress: string }) => {
    const provider = new RpcProvider({ nodeUrl: process.env.PROVIDER_URL ?? "https://starknet-sepolia.public.blastapi.io" });

    const { account } = useAccount();



    const handleDeposit = async (recipient: string, amount: string, tokenAddress: string) => {

        try {

            const amountUint256 = (formatFloatToUint256(Number(amount)) ?? Number(amount) * 10 ** 18);


            const approveData = [
                contractAddress,
                amountUint256,
            ]

            console.log("contractAddress", contractAddress);
            console.log("amountUint256", amountUint256);

            console.log("tokenAddress", tokenAddress);
            console.log("recipient", recipient);
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

            const depositData = [
                recipient ?? account?.address,
                amountUint256,
                tokenAddress,
            ]

            console.log("depositData", depositData);

            const depositCalldata = CallData.compile(depositData);

            console.log("depositCalldata", depositCalldata);

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

            console.error(error);

        }
    }

    return {
        handleDeposit,
    }
}