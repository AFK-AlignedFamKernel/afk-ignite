import { genKeypair, encrypt } from './elgamal-utils';
import fs from 'fs';

import poseidon, { poseidon1 } from 'poseidon-lite'; // or circomlibjs

export function computeNullifier(
  sk: bigint,
  amount: bigint,
  receiverX: bigint,
  transferId?: bigint
): bigint {
  const inputs = transferId
    ? [sk, amount, receiverX, transferId]
    : [sk, amount, receiverX];
  return poseidon1(inputs)
}


export const generateTransferInputs = async (amountProps: number, toProps: string) => {

    const amount = BigInt(amountProps);
    const to = toProps;
    const { privKey: senderSk, pubKey: senderPk } = genKeypair();
    const { privKey: receiverSk, pubKey: receiverPk } = genKeypair();
    
    // --- Encrypt balances ---
    const senderStart = encrypt(amount, senderPk);   // start balance: 10
    const senderAfter = encrypt(0n, senderPk);       // after sending 10
    const receiverStart = encrypt(0n, receiverPk);   // start balance: 0
    const receiverAfter = encrypt(amount, receiverPk); // after receiving 10
    
    // --- Transfer circuit inputs ---
    const transferInputs = {
      old_sender_c1: senderStart.c1,
      old_sender_c2: senderStart.c2,
      old_receiver_c1: receiverStart.c1,
      old_receiver_c2: receiverStart.c2,
      new_sender_c1: senderAfter.c1,
      new_sender_c2: senderAfter.c2,
      new_receiver_c1: receiverAfter.c1,
      new_receiver_c2: receiverAfter.c2,
      secret_key: senderSk,
      amount: amount.toString(),
      receiver_pubkey: receiverPk,
      nullifier: "1234567890" // Poseidon hash should be added here
    };
    
    // --- Prove Balance circuit input (for receiver) ---
    const proveBalanceInputs = {
      c1: receiverAfter.c1,
      c2: receiverAfter.c2,
      pubkey: receiverPk,
      privkey: receiverSk,
      balance: amount.toString(),
    };
    
    // --- Save files ---
    fs.writeFileSync('transfer_inputs.json', JSON.stringify(transferInputs, null, 2));
    fs.writeFileSync('balance_inputs.json', JSON.stringify(proveBalanceInputs, null, 2));
    
    console.log('✅ Generated inputs for both circuits');
    
}