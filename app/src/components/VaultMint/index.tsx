import { useEffect, useState } from 'react';
import { useAccount } from '@starknet-react/core';
import { constants } from 'starknet';
import { Icon } from '../small/icon-component';
import { AUSD_ADDRESSES, ETH_ADDRESSES, STRK_ADDRESSES } from '../../constants/contracts';
import { useUIStore } from '@/store/uiStore';
import { WalletConnectButton } from '../account/WalletConnectButton';
import { usePeggedCoin } from '@/hooks/peggedcoin';
import { useFetchBalance } from '@/hooks/peggedcoin/balance';

interface VaultMintProps {
    availableTokens: {
        address: string;
        symbol: string;
        decimals?: number;
        maxAmount?: string;
        decimalsMintedCoin?:number;
    }[];
    contractAddress?: string;
    //   onMint: (tokenAddress: string, amount: string) => Promise<void>;
    //   onWithdraw: (tokenAddress: string, amount: string) => Promise<void>;
}

export const VaultMint: React.FC<VaultMintProps> = ({ availableTokens,
    contractAddress,
    //  onMint, onWithdraw 

}) => {
    const { isConnected, account } = useAccount();
    const { showModal, showToast } = useUIStore();
    const [selectedToken, setSelectedToken] = useState(availableTokens[0]);
    const [amount, setAmount] = useState(0);
    const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');

    const { handleDeposit } = usePeggedCoin({ contractAddress: contractAddress ?? AUSD_ADDRESSES[constants.StarknetChainId.SN_SEPOLIA] });

    const [balanceToken, setBalanceToken] = useState(0);
    const [balanceCollateral, setBalanceCollateral] = useState(0);
    const [amountReceived, setAmountReceived] = useState(0);

    const { handleFetchBalance } = useFetchBalance({ contractAddress: contractAddress ?? AUSD_ADDRESSES[constants.StarknetChainId.SN_SEPOLIA] });
    const { handleFetchBalance: handleBalanceCollateral } = useFetchBalance({ contractAddress: selectedToken.address ?? AUSD_ADDRESSES[constants.StarknetChainId.SN_SEPOLIA] });
    const onMint = async (tokenAddress: string, amount: string) => {


        try {
            const tx = await handleDeposit(account?.address, amount.toString(), tokenAddress);

            if (!tx) {
                showToast({ message: 'Deposit failed', type: 'error' });
                return;
            }
            showToast({ message: 'Deposit in progress', type: 'success' });
            // const receipt = await account?.waitForTransactionReceipt({transactionHash: tx.transaction_hash});
            // if(receipt?.status === 'REJECTED') {
            //     showToast({ message: 'Deposit failed', type: 'error' });
            //     return;
            // }
            showToast({ message: 'Deposit successful', type: 'success' });
            console.log('Minting', tokenAddress, amount);
        } catch (error) {

            console.error(error);
        }
    }


    useEffect(() => {
        const fetchBalance = async () => {
            if (account?.address) {
                const balanceToken = await handleFetchBalance(account?.address, "0", contractAddress ?? AUSD_ADDRESSES[constants.StarknetChainId.SN_SEPOLIA]);
                setBalanceToken(
                    Number(balanceToken) / 10 ** (selectedToken.decimalsMintedCoin ?? 18)
                );
            }
            console.log("balanceToken", balanceToken);

            if (selectedToken.address) {
                const balanceCollateral = await handleBalanceCollateral(account?.address, "0", selectedToken.address);
                console.log("balanceCollateral", balanceCollateral);
                setBalanceCollateral(Number(balanceCollateral) / 10 ** selectedToken.decimals);
            }
        }

        fetchBalance();
    }, [account?.address, selectedToken.address]);

    const onWithdraw = async (tokenAddress: string, amount: string) => {
        showToast({ message: 'Withdrawing', type: 'success' });
        console.log('Withdrawing', tokenAddress, amount);
    }
    const handleAction = async () => {
        if (!amount || !selectedToken || !account?.address) return;
        try {
            if (activeTab === 'deposit') {
                await onMint(selectedToken.address, amount.toString());
            } else {
                await onWithdraw(selectedToken.address, amount.toString());
            }
        } catch (error) {
            console.error('Action error:', error);
        }
    };

    // if (!isConnected) {
    //     return (
    //         <div className="flex flex-col items-center gap-4 p-6 bg-gray-800 rounded-lg">
    //             <h2 className="text-xl font-bold">Connect Wallet to Continue</h2>
    //             <WalletConnectButton />

    //         </div>
    //     );
    // }

    return (
        <div className="flex flex-col gap-4 p-6 rounded-lg">

            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setActiveTab('deposit')}
                    className={`flex-1 py-2 rounded-lg transition-colors ${activeTab === 'deposit'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                >
                    Deposit
                </button>
                <button
                    onClick={() => setActiveTab('withdraw')}
                    className={`flex-1 py-2 rounded-lg transition-colors ${activeTab === 'withdraw'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                >
                    Withdraw
                </button>
            </div>



            {activeTab === 'deposit' && (
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400">Select Token</label>
                    <select
                        value={selectedToken?.address}
                        onChange={(e) => {
                            const token = availableTokens?.find(t => t.address === e.target.value);
                            if (token) setSelectedToken(token);
                        }}
                        className="p-2 bg-gray-700 rounded-lg text-white"
                    >
                        {availableTokens?.map((token) => (
                            <option key={token.address} value={token.address}>
                                {token.symbol}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {activeTab === 'withdraw' && (
                <div>
                    <p>Balance: {balanceToken}</p>
                </div>

            )}

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm text-gray-400">Amount</label>

                    <p>Available: {activeTab === 'deposit' ? balanceCollateral : balanceToken}</p>

                    <button
                        onClick={() => setAmount(Number(selectedToken.maxAmount))}
                        className="text-sm text-blue-400 hover:text-blue-300"
                    >
                        MAX
                    </button>
                </div>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="0.0"
                    className="p-2 bg-gray-700 rounded-lg text-white"
                />
            </div>

            <div>
                <p className="text-sm text-gray-400"> Amount received in coin: {amountReceived.toFixed(2)}</p>
            </div>

            <p>Available: {activeTab === 'deposit' ? balanceCollateral : balanceToken}</p>


            {!account?.address &&

                <div className="flex flex-col items-center gap-4 rounded-lg">
                    <WalletConnectButton />

                </div>}

            <button
                onClick={handleAction}
                disabled={!amount || !selectedToken || !account?.address}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                {activeTab === 'deposit' ? 'Deposit' : 'Withdraw'}
            </button>
        </div>
    );
};
