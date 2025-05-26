"use client"
import { useDataStablecoin } from "@/hooks/mintstablecoin/data";
import { useAccount } from "@starknet-react/core";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function MintStablecoinData({ mintContractAddress, tokenAddress }: { mintContractAddress: string, tokenAddress: string }) {


    const { account } = useAccount();
    const { handleFetchMintCap } = useDataStablecoin({ contractAddress: mintContractAddress });

    const [responseData, setResponseData] = useState<any>(null);
    const { data: response } = useQuery({
        queryKey: ['mintCap', mintContractAddress],
        queryFn: () => {
            const response = handleFetchMintCap(account?.address, tokenAddress)
            setResponseData(response)
            return response
        },
    })
    console.log("response", response);
    console.log("responseData", responseData);

    return (
        <div className="flex flex-col gap-4 p-4"    >
            <div className="justify-end">
                <button onClick={() => handleFetchMintCap(account?.address, tokenAddress)}>Fetch Mint Cap</button>
                <h1>Mint Stablecoin Data</h1>
                <p>Mint Cap: {response?.mintCap}</p>
                <p>Token Minted: {response?.token_minted}</p>
                <p>Total Mint Cap: {response?.total_mint_cap}</p>
                <p>Mint Per User: {response?.mint_per_user}</p>
                <p>Mint Per Token: {response?.mint_per_token}</p>
                <p>Deposit User Balance: {response?.deposit_user_balance}</p>
            </div>

        </div>
    )
}