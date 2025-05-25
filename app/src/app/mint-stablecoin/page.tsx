"use client";
import MintStablecoin from "@/components/MintStablecoin";
import { TokenSelection } from "@/types";
import { useState } from "react";

export default function MintStablecoinPage() {

    const [selectedToken, setSelectedToken] = useState<TokenSelection | null>(null);

    const [selectedTokenSymbol, setSelectedTokenSymbol] = useState<string | null>(null);
    const handleTokenSelect = (token: TokenSelection) => {
        setSelectedToken(token);
        setSelectedTokenSymbol(token?.symbol);
    }

    return <MintStablecoin
        selectedToken={selectedToken}
        onTokenSelect={handleTokenSelect}
    />;
}