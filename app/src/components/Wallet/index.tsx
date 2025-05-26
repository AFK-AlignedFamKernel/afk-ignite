'use client';
import { useState } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import Cashu from '../Cashu';
import TokenEncryptedElgamal from '../PrivateToken/elgamal';
import PayReceive from '../PayReceive';

const WalletComponents = () => {


  const [activeTab, setActiveTab] = useState<"pay_receive" | 'cashu' | 'bitcoin' | 'starknet' | 'private'>('cashu');

  const handleTabChange = (tab: 'pay_receive' | 'cashu' | 'bitcoin' | 'starknet' | 'private') => {
    setActiveTab(tab);
  }

  return (

    <div>
      <h1 className="text-xl font-bold">AFK Wallet, Non custodial Bank for Payment & DeFi</h1>

      <div className="flex flex-row gap-4">
        <button onClick={() => handleTabChange('pay_receive')} className={`${activeTab === 'pay_receive' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} px-4 py-2 rounded-md`}>Pay & Receive</button>
        <button onClick={() => handleTabChange('cashu')} className={`${activeTab === 'cashu' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} px-4 py-2 rounded-md`}>Cashu</button>
        <button onClick={() => handleTabChange('bitcoin')} className={`${activeTab === 'bitcoin' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} px-4 py-2 rounded-md`}>Bitcoin</button>
        {/* <button onClick={() => handleTabChange('starknet')} className={`${activeTab === 'starknet' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} px-4 py-2 rounded-md`}>Starknet</button> */}
        <button onClick={() => handleTabChange('private')} className={`${activeTab === 'private' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} px-4 py-2 rounded-md`}>Private</button>
      </div>


      {activeTab === 'pay_receive' && <PayReceive />}
      {activeTab === 'cashu' && <Cashu />}
      {activeTab === 'private' && <TokenEncryptedElgamal />}
      {/* {activeTab === 'bitcoin' && <Bitcoin />} */}
      {/* {activeTab === 'starknet' && <Starknet />}
      {activeTab === 'private' && <Private />} */}


      <label className="font-bold text-md" >Received and pay everyone with crypto public and private transfers</label>
      <p className="text-md text-gray-400 font-bold">Wallet coming soon</p>
      <ul>
        <li>Payment using BTC, ETH and stablecoins</li>
        <li>Easy setup and UX</li>
        <li>Private transfer mod</li>
      </ul>
    </div>
  );
};

export default WalletComponents;
