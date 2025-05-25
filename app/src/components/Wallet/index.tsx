'use client';
import { useState } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';

const WalletComponents = () => {


  return (

    <div>
      <h1 className="text-xl font-bold">AFK Wallet, Non custodial Bank for Payment & DeFi</h1>
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
