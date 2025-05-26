'use client';
import React from 'react';
import MenuHomeComponent from '@/components/menu/MenuHome';
import { VaultMint } from '@/components/VaultMint';
import { AUSD_ADDRESSES, AUSD_TOKEN_AVAILABLE } from '@/constants/contracts';
import { constants } from 'starknet';
import { PeggedList } from '@/components/VaultMint/PeggedList';


// Use inline Layout to avoid type issues
export default function HomePage() {
  return (
    <div className="content">
      <MenuHomeComponent></MenuHomeComponent>
      {/* <PeggedList /> */}
    </div>
  );
}
