import { useState } from "react";
import { WalletConnectButton } from "./WalletConnectButton";
import AlbyBitcoinConnect from "./bitcoin/AlbyBitcoinConnect";
import { XverseConnect } from "./bitcoin/XverseConnect";
import CashuConnect from "../Cashu";

export default function Connect() {

    const [isConnected, setIsConnected] = useState(false);
    const [tab, setTab] = useState<'starknet' | 'bitcoin' | "xverse" | "cashu">('starknet');
    return (
        <div className="flex flex-col gap-4 my-8">
            <div className="flex flex-row gap-4">
                <button className={tab === 'starknet' ? 'btn btn-gradient-green' : 'btn btn-gradient-blue'} onClick={() => setTab('starknet')}>Starknet</button>
                <button className={tab === 'bitcoin' ? 'btn btn-gradient-green' : 'btn btn-gradient-blue'} onClick={() => setTab('bitcoin')}>Bitcoin</button>
                <button className={tab === 'xverse' ? 'btn btn-gradient-green' : 'btn btn-gradient-blue'} onClick={() => setTab('xverse')}>Xverse</button>
                <button className={tab === 'cashu' ? 'btn btn-gradient-green' : 'btn btn-gradient-blue'} onClick={() => setTab('cashu')}>Cashu</button>
            </div>


            <div className="flex flex-col gap-4 my-4">

                {tab === 'starknet' && <WalletConnectButton />}
                {tab === 'bitcoin' && <AlbyBitcoinConnect />}
                {tab === 'xverse' && <XverseConnect />}
                {tab === 'cashu' && <CashuConnect />}
            </div>

        </div>
    );
}