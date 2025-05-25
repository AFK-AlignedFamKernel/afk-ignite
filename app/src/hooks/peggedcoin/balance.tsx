import { formatFloatToUint256 } from "@/utils/format";
import { useAccount } from "@starknet-react/core";
import { useQuery } from "@tanstack/react-query";
import { cairo, CallData, RpcProvider, Contract } from "starknet";

export const useFetchBalance = ({ contractAddress }: { contractAddress: string }) => {
    //initialize provider with a Sepolia Testnet node
    const provider = new RpcProvider({ nodeUrl: process.env.PROVIDER_URL ?? "https://starknet-sepolia.public.blastapi.io" });
    const { account } = useAccount();


    const handleFetchBalance = async (recipient: string, amount: string, tokenAddress: string) => {

        try {

            // read abi of Test contract
            const { abi: testAbi } = await provider.getClassAt(tokenAddress);
            if (testAbi === undefined) {
                throw new Error('no abi.');
            }
            const erc20Contract = new Contract(testAbi, tokenAddress, provider);
            console.log("erc20Contract", erc20Contract);

            const balance = await erc20Contract.balance_of(recipient);

            console.log("balance", balance);
            return balance;
        } catch (error) {

            console.error("Error fetching balance", error);

        }
    }

    return {
        handleFetchBalance,
    }
}