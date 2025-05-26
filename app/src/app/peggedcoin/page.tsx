'use client';
import React from 'react';
import MenuHomeComponent from '@/components/menu/MenuHome';
import { PeggedList } from '@/components/VaultMint/PeggedList';

export default function PeggedCoinPage() {
  return (
    <div className="content">
      <MenuHomeComponent></MenuHomeComponent>

      <PeggedList />
    </div>
  );
}
