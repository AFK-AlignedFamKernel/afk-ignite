'use client';
import Link from 'next/link';
import React from 'react';
// import Link from 'next/link';
// import { Icon } from '../small/icon-component';

export default function MenuHomeComponent() {
  return (
    <div className="shadow-lg p-4 rounded-lg px-4">
      <h2 className="font-semibold">AFK, the DeFi app for your digital assets</h2>

      <div className='flex flex-row gap-2'>
        <Link href="/peggedcoin">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Vault
          </button>
        </Link>
        <Link href="/mint-stablecoin">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Mint abUSD
          </button>
        </Link>
      </div>

    </div>
  );
}
