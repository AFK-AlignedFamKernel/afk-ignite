import { useState } from 'react';
import { ethers } from 'ethers';
import { Contract } from 'starknet';

// Replace with your deployed contract ABI + address
const CONTRACT_ADDRESS = '0xYourContractAddress';

export default function TokenEncryptedElgamal() {
  const [account, setAccount] = useState<string>('');
  const [balance, setBalance] = useState<string>('?');
  const [amount, setAmount] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [status, setStatus] = useState<string>('');



  async function connectWallet() {
    const [acc] = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(acc);
  }

  async function getEncryptedBalance() {
    // if (!contract || !account) return;
    // const [c1, c2] = await contract.getEncryptedBalance(account);
    // setBalance(`(${c1.toString()}, ${c2.toString()})`);
  }

  async function deposit() {
    // Here you would encrypt the amount off-chain and call `setInitialBalance` or a `deposit` function
    setStatus('Deposit simulated. In practice, call setInitialBalance with encrypted values.');
  }

  async function withdraw() {
    setStatus('Withdraw must be done by submitting proof and decrypting.');
  }

  async function transfer() {
    // if (!contract || !account || !amount || !to) return;
    setStatus('Generating proof and sending transaction...');

    // You would generate the zk-proof off-chain and submit proof + encrypted values here
    setStatus('Transfer simulated. Call privateTransfer with proof + encrypted inputs.');
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Private Token Transfer</h2>
      <button
        onClick={connectWallet}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded shadow"
      >
        Connect Wallet
      </button>
      <p className="mb-2">Connected Account: {account}</p>

      <button
        onClick={getEncryptedBalance}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded shadow"
      >
        Get Encrypted Balance
      </button>
      <p className="mb-4">Encrypted Balance: {balance}</p>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Recipient Address</label>
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="flex gap-4 mb-4">
        <button onClick={transfer} className="px-4 py-2 bg-purple-600 text-white rounded shadow">
          Transfer (ZK)
        </button>
        <button onClick={deposit} className="px-4 py-2 bg-yellow-500 text-white rounded shadow">
          Deposit
        </button>
        <button onClick={withdraw} className="px-4 py-2 bg-red-600 text-white rounded shadow">
          Withdraw
        </button>
      </div>

      {status && <p className="text-sm text-gray-700">{status}</p>}
    </div>
  );
}