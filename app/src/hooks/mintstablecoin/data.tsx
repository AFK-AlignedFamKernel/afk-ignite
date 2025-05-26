import { useAccount, useProvider } from "@starknet-react/core";
import { RpcProvider, Contract } from "starknet";

export const useDataStablecoin = ({ contractAddress }: { contractAddress: string }) => {
    //initialize provider with a Sepolia Testnet node
    const provider = new RpcProvider({
        // nodeUrl: process.env.NEXT_PUBLIC_PROVIDER_URL ?? "https://starknet-sepolia.public.blastapi.io"
        nodeUrl: "https://starknet-sepolia.public.blastapi.io"
    });
    const { account, } = useAccount();
    console.log("process.env.NEXT_PUBLIC_PROVIDER_URL", process.env.NEXT_PUBLIC_PROVIDER_URL);

    // const {provider} = useProvider()

    const handleFetchMintCap = async (recipient: string, tokenAddress: string) => {

        try {

            // read abi of Test contract
            const { abi: testAbi } = await provider.getClassAt(contractAddress);
            if (testAbi === undefined) {
                throw new Error('no abi.');
            }
            const stablecoinContract = new Contract(testAbi, contractAddress, provider);
            console.log("stablecoinContract", stablecoinContract);
            

            const balance = await stablecoinContract.balance_of(recipient);
            console.log("balance", balance);
            // const mintCap = await stablecoinContract.get_total_mint_cap();

            // console.log("mintCap", mintCap);
            // const token_minted = await stablecoinContract.get_token_minted();
            // console.log("token_minted", token_minted);
            const total_mint_cap = await stablecoinContract.get_total_mint_cap();
            console.log("total_mint_cap", total_mint_cap);
            const mint_per_user = await stablecoinContract.get_mint_per_user(recipient);
            console.log("mint_per_user", mint_per_user);
            const mint_per_token = await stablecoinContract.get_mint_per_token(tokenAddress);
            console.log("mint_per_token", mint_per_token);
            const deposit_user_balance = await stablecoinContract.get_deposit_user_balance(recipient, tokenAddress);
            console.log("deposit_user_balance", deposit_user_balance);
            console.log("balance", balance);
            return {
                balance,
                // mintCap,
                // token_minted,
                total_mint_cap,
                mint_per_user,
                mint_per_token,
                deposit_user_balance,
            };
        } catch (error) {

            console.error("Error fetching balance", error);

        }
    }

    return {
        handleFetchMintCap,
    }
}