'use client';
import React from 'react';
import MenuHomeComponent from '@/components/menu/MenuHome';
import { VaultMint } from '@/components/VaultMint';


// Use inline Layout to avoid type issues
export default function HomePage() {
  return (
    <div className="content">
      <MenuHomeComponent></MenuHomeComponent>
      <VaultMint availableTokens={[]} />
    </div>
  );
}
