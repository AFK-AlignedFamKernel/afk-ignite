"use client";
import { requestProvider } from '@getalby/bitcoin-connect-react';
import { useEffect } from 'react';
import Wallet, { AddressPurpose } from 'sats-connect';

export const XverseConnect = () => {

    const connectWallet = async () => {

        try {
            const response = await Wallet.request('getAccounts', {
                purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals, AddressPurpose.Stacks],
                message: 'Cool app wants to know your addresses!',
            });
        } catch (error) {
            console.error(error);
        }

    }

    // useEffect(() => {
    //     connectWallet();
    // }, []);
    return (
        <div>
            <h1>WalletSats</h1>
            <button onClick={connectWallet}>Connect</button>
        </div>
    );
};